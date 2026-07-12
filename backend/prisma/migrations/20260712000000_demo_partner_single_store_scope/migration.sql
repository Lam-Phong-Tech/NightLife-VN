UPDATE store_permissions AS sp
SET
  status = 'DELETED',
  deleted_at = NOW(),
  updated_at = NOW()
FROM users AS u, stores AS s
WHERE sp.user_id = u.id
  AND sp.store_id = s.id
  AND u.email = 'partner@nightlife.vn'
  AND s.slug <> 'velvet-club'
  AND sp.deleted_at IS NULL;
