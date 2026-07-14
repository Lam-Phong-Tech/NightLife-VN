import paramiko
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

host = "45.119.83.233"
user = "root"
password = "Tailoc@2026"

local_base = "d:/laragon/www/NightLife-VN"
frontend_remote = "/var/www/demonightlight.test9.io.vn"

files_to_upload = [
    (f"{local_base}/frontend/apps/web/src/components/support-chat/AdminSupportDashboard.tsx", f"{frontend_remote}/apps/web/src/components/support-chat/AdminSupportDashboard.tsx")
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print("Connecting to VPS...")
    client.connect(host, username=user, password=password, timeout=10)
    print("Connected.")
    
    print("Uploading files...")
    sftp = client.open_sftp()
    for local_file, remote_file in files_to_upload:
        print(f"Uploading {local_file} -> {remote_file}")
        sftp.put(local_file, remote_file)
    sftp.close()
    print("Upload complete.")
    
    commands = [
        # Build frontend web app
        f"cd {frontend_remote}/apps/web && pnpm run build",
        "pm2 restart app-demonightlight.test9.io.vn"
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
