import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

host = "45.119.83.233"
user = "root"
password = "Tailoc@2026"

backend_remote = "/var/www/api.demonightlight.test9.io.vn"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("Connecting to VPS...")
    client.connect(host, username=user, password=password, timeout=10)
    print("Connected.")
    
    commands = [
        # Build backend
        f"cd {backend_remote} && npx @nestjs/cli build",
        "pm2 restart app-api.demonightlight.test9.io.vn"
    ]
    
    for cmd in commands:
        print(f"\n--- Executing: {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        while True:
            line = stdout.readline()
            if not line:
                break
            print(line.strip())
            
        err = stderr.read().decode('utf-8', errors='replace').strip()
        if err:
            print(f"STDERR: {err}")
            
finally:
    client.close()
