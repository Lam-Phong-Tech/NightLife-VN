#!/usr/bin/env bash
set -Eeuo pipefail

# Run from the backend deploy directory before UAT/demo schema changes.
# Required: DATABASE_URL
# Optional:
#   BACKUP_ROOT=./backups
#   STORAGE_PATHS="uploads public/uploads"
#   RETENTION_COUNT=7
#   RESTORE_SANITY_DATABASE_URL=postgresql://...
#   PG_BACKUP_DATABASE_URL=postgresql://...  # override when DATABASE_URL has Prisma-only params
#   PG_BACKUP_SCHEMA=public

: "${DATABASE_URL:?DATABASE_URL is required for pg_dump backup}"

BACKUP_ROOT="${BACKUP_ROOT:-./backups}"
STORAGE_PATHS="${STORAGE_PATHS:-uploads public/uploads}"
RETENTION_COUNT="${RETENTION_COUNT:-7}"
TIME_ZONE="${TZ:-Asia/Bangkok}"
PRISMA_ONLY_DATABASE_URL_PARAMS="${PRISMA_ONLY_DATABASE_URL_PARAMS:-schema connection_limit pool_timeout pgbouncer}"
STAMP="$(TZ="$TIME_ZONE" date +%Y%m%d-%H%M%S)"

sanitize_database_url_for_pg_tools() {
  local input_url="$1"
  SANITIZED_DATABASE_URL="$input_url"
  SANITIZED_DATABASE_SCHEMA=""

  if [[ "$input_url" != *\?* ]]; then
    return
  fi

  local base="${input_url%%\?*}"
  local query="${input_url#*\?}"
  local old_ifs="$IFS"
  local part key kept_query
  local query_parts=()
  local kept_parts=()

  IFS='&'
  read -r -a query_parts <<< "$query"
  IFS="$old_ifs"

  for part in "${query_parts[@]}"; do
    key="${part%%=*}"
    if [ "$key" = "schema" ]; then
      if [[ "$part" == *=* ]]; then
        SANITIZED_DATABASE_SCHEMA="${part#*=}"
      fi
      continue
    fi

    case " $PRISMA_ONLY_DATABASE_URL_PARAMS " in
      *" $key "*) continue ;;
    esac

    kept_parts+=("$part")
  done

  if [ "${#kept_parts[@]}" -gt 0 ]; then
    IFS='&'
    kept_query="${kept_parts[*]}"
    IFS="$old_ifs"
    SANITIZED_DATABASE_URL="$base?$kept_query"
  else
    SANITIZED_DATABASE_URL="$base"
  fi
}

sanitize_database_url_for_pg_tools "$DATABASE_URL"
PG_DATABASE_URL="${PG_BACKUP_DATABASE_URL:-$SANITIZED_DATABASE_URL}"
PG_SCHEMA="${PG_BACKUP_SCHEMA:-$SANITIZED_DATABASE_SCHEMA}"

if ! [[ "$RETENTION_COUNT" =~ ^[0-9]+$ ]]; then
  echo "RETENTION_COUNT must be a number" >&2
  exit 1
fi

if [ "$RETENTION_COUNT" -lt 7 ]; then
  RETENTION_COUNT=7
fi

command -v pg_dump >/dev/null 2>&1 || {
  echo "pg_dump is required but was not found in PATH" >&2
  exit 1
}

command -v pg_restore >/dev/null 2>&1 || {
  echo "pg_restore is required but was not found in PATH" >&2
  exit 1
}

command -v tar >/dev/null 2>&1 || {
  echo "tar is required but was not found in PATH" >&2
  exit 1
}

command -v sha256sum >/dev/null 2>&1 || {
  echo "sha256sum is required but was not found in PATH" >&2
  exit 1
}

mkdir -p "$BACKUP_ROOT"

DB_BACKUP="$BACKUP_ROOT/nightlife-db-$STAMP.dump"
DB_LIST="$DB_BACKUP.list"
STORAGE_BACKUP="$BACKUP_ROOT/nightlife-storage-$STAMP.tgz"
STORAGE_SKIPPED="$BACKUP_ROOT/nightlife-storage-$STAMP.skipped"
MANIFEST="$BACKUP_ROOT/nightlife-$STAMP-manifest.txt"
CHECKSUMS="$BACKUP_ROOT/nightlife-$STAMP-sha256.txt"

echo "Creating database backup: $DB_BACKUP"
pg_dump_args=(--format=custom --no-owner --no-privileges --file "$DB_BACKUP")
if [ -n "$PG_SCHEMA" ]; then
  echo "Using database schema for backup: $PG_SCHEMA"
  pg_dump_args+=(--schema "$PG_SCHEMA")
fi
pg_dump "${pg_dump_args[@]}" "$PG_DATABASE_URL"
test -s "$DB_BACKUP"
pg_restore --list "$DB_BACKUP" > "$DB_LIST"
test -s "$DB_LIST"

storage_found=0
storage_args=()
for storage_path in $STORAGE_PATHS; do
  if [ -e "$storage_path" ]; then
    storage_found=1
    storage_args+=("$storage_path")
  fi
done

if [ "$storage_found" -eq 1 ]; then
  echo "Creating storage archive: $STORAGE_BACKUP"
  tar -czf "$STORAGE_BACKUP" "${storage_args[@]}"
  test -s "$STORAGE_BACKUP"
else
  echo "No storage paths found from STORAGE_PATHS=$STORAGE_PATHS" | tee "$STORAGE_SKIPPED" >/dev/null
fi

if [ -n "${RESTORE_SANITY_DATABASE_URL:-}" ]; then
  echo "Running optional restore sanity check against RESTORE_SANITY_DATABASE_URL"
  sanitize_database_url_for_pg_tools "$RESTORE_SANITY_DATABASE_URL"
  RESTORE_DATABASE_URL="${PG_RESTORE_DATABASE_URL:-$SANITIZED_DATABASE_URL}"
  pg_restore --clean --if-exists --no-owner --no-privileges --dbname "$RESTORE_DATABASE_URL" "$DB_BACKUP"
fi

{
  echo "nightlife_backup_timestamp=$STAMP"
  echo "time_zone=$TIME_ZONE"
  echo "host=$(hostname 2>/dev/null || echo unknown)"
  echo "git_sha=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  echo "backup_root=$BACKUP_ROOT"
  echo "database_backup=$DB_BACKUP"
  echo "database_backup_bytes=$(wc -c < "$DB_BACKUP")"
  echo "database_schema=${PG_SCHEMA:-all}"
  echo "prisma_url_params_stripped=$PRISMA_ONLY_DATABASE_URL_PARAMS"
  echo "database_restore_list=$DB_LIST"
  echo "database_restore_list_bytes=$(wc -c < "$DB_LIST")"
  if [ "$storage_found" -eq 1 ]; then
    echo "storage_backup=$STORAGE_BACKUP"
    echo "storage_backup_bytes=$(wc -c < "$STORAGE_BACKUP")"
    echo "storage_paths=${storage_args[*]}"
  else
    echo "storage_backup=skipped"
    echo "storage_skip_reason=no configured storage paths existed"
  fi
  if [ -n "${RESTORE_SANITY_DATABASE_URL:-}" ]; then
    echo "restore_sanity=passed"
  else
    echo "restore_sanity=pg_restore_list_passed"
  fi
  echo "retention_count=$RETENTION_COUNT"
} > "$MANIFEST"

checksum_targets=("$DB_BACKUP" "$DB_LIST" "$MANIFEST")
if [ "$storage_found" -eq 1 ]; then
  checksum_targets+=("$STORAGE_BACKUP")
else
  checksum_targets+=("$STORAGE_SKIPPED")
fi
sha256sum "${checksum_targets[@]}" > "$CHECKSUMS"

mapfile -t old_stamps < <(
  find "$BACKUP_ROOT" -maxdepth 1 -type f -name 'nightlife-db-*.dump' -printf '%f\n' |
    sed -E 's/^nightlife-db-([0-9]{8}-[0-9]{6})\.dump$/\1/' |
    sort -r |
    tail -n +"$((RETENTION_COUNT + 1))"
)

for old_stamp in "${old_stamps[@]}"; do
  rm -f \
    "$BACKUP_ROOT/nightlife-db-$old_stamp.dump" \
    "$BACKUP_ROOT/nightlife-db-$old_stamp.dump.list" \
    "$BACKUP_ROOT/nightlife-storage-$old_stamp.tgz" \
    "$BACKUP_ROOT/nightlife-storage-$old_stamp.skipped" \
    "$BACKUP_ROOT/nightlife-$old_stamp-manifest.txt" \
    "$BACKUP_ROOT/nightlife-$old_stamp-sha256.txt"
done

echo "Backup completed."
echo "Manifest: $MANIFEST"
echo "Checksums: $CHECKSUMS"
