-- Default member accounts to the legacy FREE tier for live database compatibility.
ALTER TABLE "users" ALTER COLUMN "tier" SET DEFAULT 'FREE';
