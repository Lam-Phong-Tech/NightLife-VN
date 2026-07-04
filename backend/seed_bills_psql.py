import paramiko
import re
import uuid

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026')

DB_URL = "postgresql://backend_user:M75R4a8rdw0ZxKtL2gAcN3QU@localhost:5433/backend_db?schema=public"

def run_sql(sql):
    cmd = f'psql "{DB_URL}" -c "{sql}"'
    stdin, stdout, stderr = ssh.exec_command(cmd)
    err = stderr.read().decode('utf-8', errors='ignore')
    if err:
        print("ERR:", err)
    return stdout.read().decode('utf-8', errors='ignore')

store_id_out = run_sql("SELECT id FROM stores WHERE status = 'ACTIVE' LIMIT 1;")
store_id_match = re.search(r'([0-9a-fA-F\-]{36})', store_id_out)

if store_id_match:
    store_id = store_id_match.group(1)
else:
    store_id = str(uuid.uuid4())
    run_sql(f"INSERT INTO stores (id, name, slug, category, city, status, created_at, updated_at) VALUES ('{store_id}', 'Mock Store', 'mock-store-{store_id}', 'BAR', 'Ho Chi Minh City', 'ACTIVE', NOW(), NOW());")

print("Store ID:", store_id)

bills = [
    {
        "id": str(uuid.uuid4()),
        "status": 'SUBMITTED',
        "submitter_type": 'MEMBER',
        "subtotal_vnd": 10000000,
        "discount_vnd": 1000000,
        "total_vnd": 9000000,
        "commission_amount_vnd": 900000,
        "point_earned": 90,
        "used_at": "NOW()",
        "has_image": True,
        "bill_number": f"BILL-{uuid.uuid4().hex[:6].upper()}"
    },
    {
        "id": str(uuid.uuid4()),
        "status": 'SUBMITTED',
        "submitter_type": 'PARTNER',
        "subtotal_vnd": 5000000,
        "discount_vnd": 0,
        "total_vnd": 5000000,
        "commission_amount_vnd": 750000,
        "point_earned": 50,
        "used_at": "NOW() - INTERVAL '1 day'",
        "has_image": False,
        "bill_number": f"BILL-{uuid.uuid4().hex[:6].upper()}"
    },
    {
        "id": str(uuid.uuid4()),
        "status": 'VERIFIED',
        "submitter_type": 'VIP',
        "subtotal_vnd": 20000000,
        "discount_vnd": 2000000,
        "total_vnd": 18000000,
        "commission_amount_vnd": 1800000,
        "point_earned": 180,
        "used_at": "NOW() - INTERVAL '2 days'",
        "has_image": False,
        "bill_number": f"BILL-{uuid.uuid4().hex[:6].upper()}"
    },
    {
        "id": str(uuid.uuid4()),
        "status": 'REJECTED',
        "submitter_type": 'MEMBER',
        "subtotal_vnd": 2000000,
        "discount_vnd": 0,
        "total_vnd": 2000000,
        "commission_amount_vnd": 200000,
        "point_earned": 20,
        "used_at": "NOW()",
        "has_image": False,
        "bill_number": f"BILL-{uuid.uuid4().hex[:6].upper()}"
    }
]

for b in bills:
    sql = f"""
    INSERT INTO bills (id, bill_number, store_id, status, submitter_type, subtotal_vnd, discount_vnd, total_vnd, commission_amount_vnd, point_earned, used_at, created_at, updated_at)
    VALUES ('{b['id']}', '{b['bill_number']}', '{store_id}', '{b['status']}', '{b['submitter_type']}', {b['subtotal_vnd']}, {b['discount_vnd']}, {b['total_vnd']}, {b['commission_amount_vnd']}, {b['point_earned']}, {b['used_at']}, NOW(), NOW());
    """
    out = run_sql(sql)
    print("Insert Bill Output:", out)
    
    if b['has_image']:
        media_id = str(uuid.uuid4())
        media_sql = f"""
        INSERT INTO media (id, bill_id, url, type, status, access, created_at, updated_at)
        VALUES ('{media_id}', '{b['id']}', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80', 'IMAGE', 'READY', 'PUBLIC', NOW(), NOW());
        """
        out_media = run_sql(media_sql)
        print("Insert Media Output:", out_media)

ssh.close()
print("Done.")
