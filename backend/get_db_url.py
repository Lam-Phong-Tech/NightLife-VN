import paramiko
import re

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026')

stdin, stdout, stderr = ssh.exec_command('grep DATABASE_URL /var/www/api.demonightlight.test9.io.vn/.env')
out = stdout.read()
try:
    print(out.decode('utf-8', errors='ignore'))
except Exception as e:
    print(e)
    
ssh.close()
