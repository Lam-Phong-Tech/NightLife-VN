import paramiko
import sys

host = "45.119.83.233"
user = "root"
password = "Tailoc@2026"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, username=user, password=password, timeout=10)
    
    commands = [
        "ls -la /var/www/demonightlight.test9.io.vn",
        "cat /var/www/demonightlight.test9.io.vn/ecosystem.config.js"
    ]
    
    for cmd in commands:
        print(f"\n--- {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode('utf-8', errors='replace').strip())
        err = stderr.read().decode('utf-8', errors='replace').strip()
        if err:
            print(f"STDERR: {err}")
            
finally:
    client.close()
