import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026')

DB_URL = "postgresql://backend_user:M75R4a8rdw0ZxKtL2gAcN3QU@localhost:5433/backend_db"

sql = "INSERT INTO media_files (id, storage_key, original_name, mime_type, size_bytes, bill_id, url, type, status, access, created_at, updated_at) VALUES (gen_random_uuid(), 'mock-key', 'mock.jpg', 'image/jpeg', 1024, '89b246b7-5ecf-42d3-8c73-4699f5ee3b30', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80', 'IMAGE', 'READY', 'PUBLIC', NOW(), NOW());"

cmd = f'psql "{DB_URL}" -t -c "{sql}"'
stdin, stdout, stderr = ssh.exec_command(cmd)
err = stderr.read().decode('utf-8', errors='ignore')
if err:
    print("ERR:", err)
else:
    print(stdout.read().decode('utf-8', errors='ignore'))
ssh.close()
