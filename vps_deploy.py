import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

host = "45.119.83.233"
user = "root"
password = "Tailoc@2026"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("Connecting to VPS...")
    client.connect(host, username=user, password=password, timeout=10)
    print("Connected.")
    
    commands = [
        "cd /var/www/api.demonightlight.test9.io.vn && git pull origin main && pnpm install && pnpm run build",
        "pm2 restart app-api.demonightlight.test9.io.vn",
        "cd /var/www/demonightlight.test9.io.vn && git pull origin main",
        "cd /var/www/demonightlight.test9.io.vn/frontend && pnpm install && pnpm run build",
        "pm2 restart app-demonightlight.test9.io.vn"
    ]
    
    for cmd in commands:
        print(f"\n--- {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        # Read output line by line for long-running commands like build
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
