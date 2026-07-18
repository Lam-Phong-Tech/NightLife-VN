import paramiko

s = paramiko.SSHClient()
s.set_missing_host_key_policy(paramiko.AutoAddPolicy())
s.connect('45.119.83.233', username='root', password='Tailoc@2026')

stdin, stdout, stderr = s.exec_command('docker ps')
print(stdout.read().decode('utf-8', errors='ignore'))

# Use PGPASSWORD
cmd = 'PGPASSWORD=root psql -h localhost -p 5433 -U postgres -d backend_db -c "SELECT id, target_type, city_code, scope, status, target_id FROM ranking_configs;"'
stdin, stdout, stderr = s.exec_command(cmd)
print("STDOUT:", stdout.read().decode('utf-8', errors='ignore'))
print("STDERR:", stderr.read().decode('utf-8', errors='ignore'))
s.close()
