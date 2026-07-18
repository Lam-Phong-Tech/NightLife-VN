import paramiko
import sys
sys.stdout.reconfigure(encoding='utf-8')
s = paramiko.SSHClient()
s.set_missing_host_key_policy(paramiko.AutoAddPolicy())
s.connect('45.119.83.233', username='root', password='Tailoc@2026')

cmd = 'PGPASSWORD=root psql -h localhost -p 5433 -U postgres -d backend_db -c "SELECT id, status, deleted_at FROM stores WHERE id = \'f0a35f5a-ee17-484b-853d-4019b44746a8\';"'
stdin, stdout, stderr = s.exec_command(cmd)
print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))
s.close()
