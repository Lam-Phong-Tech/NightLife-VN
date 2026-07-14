import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

host = "45.119.83.233"
user = "root"
password = "Tailoc@2026"

local_base = "d:/laragon/www/NightLife-VN"
backend_remote = "/var/www/api.demonightlight.test9.io.vn"

files_to_upload = [
    (f"{local_base}/backend/src/support-chat/support-chat.service.ts", f"{backend_remote}/src/support-chat/support-chat.service.ts")
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
        # Build backend
        f"cd {backend_remote} && npm install && npm run build",
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
