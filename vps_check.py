import paramiko
import sys
import time

host = "45.119.83.233"
user = "root"
password = "Tailoc@2026"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {host}...")
    client.connect(host, username=user, password=password, timeout=10)
    print("Connected.")
    
    commands = [
        "pwd",
        "ls -la /var/www",
        "find / -maxdepth 3 -type d -name 'demonightlight.test9.io.vn'",
        "pm2 status"
    ]
    
    for cmd in commands:
        print(f"\n--- Executing: {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        
        if out:
            print(out)
        if err:
            print(f"ERROR: {err}")
            
finally:
    client.close()
