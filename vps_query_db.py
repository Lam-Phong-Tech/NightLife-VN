import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

host = "45.119.83.233"
user = "root"
password = "Tailoc@2026"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, username=user, password=password, timeout=10)
    
    query_cmd = (
        'PGPASSWORD=root psql -h localhost -p 5433 -U postgres -d backend_db -c '
        '"SELECT b.booking_code, b.scheduled_at, b.party_size, b.status, '
        'COALESCE(u.display_name, g.display_name, \'Khách Vãng Lai\') as customer_name, '
        's.name as store_name, c.stage_name as cast_name '
        'FROM bookings b '
        'LEFT JOIN users u ON b.user_id = u.id '
        'LEFT JOIN guests g ON b.guest_id = g.id '
        'LEFT JOIN stores s ON b.store_id = s.id '
        'LEFT JOIN casts c ON b.cast_id = c.id '
        'ORDER BY b.scheduled_at DESC, b.created_at DESC LIMIT 10;"'
    )
    
    print(f"Executing: {query_cmd}")
    stdin, stdout, stderr = client.exec_command(query_cmd)
    
    print("\n--- STDOUT ---")
    print(stdout.read().decode('utf-8', errors='replace'))
    print("--- STDERR ---")
    print(stderr.read().decode('utf-8', errors='replace'))

finally:
    client.close()
