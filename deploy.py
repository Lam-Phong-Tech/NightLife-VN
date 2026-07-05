import paramiko
import os

host = "45.119.83.233"
username = "root"
password = "Tailoc@2026"

print("Connecting to SSH...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password, timeout=10)
print("Connected.")

sftp = ssh.open_sftp()

def ensure_remote_dir(sftp, remote_dir):
    dirs = []
    while len(remote_dir) > 1:
        dirs.append(remote_dir)
        remote_dir = os.path.dirname(remote_dir).replace('\\', '/')
    while len(dirs):
        dir = dirs.pop()
        try:
            sftp.stat(dir)
        except IOError:
            sftp.mkdir(dir)

files_to_upload = [
    (r"d:\laragon\www\NightLife-VN\backend\prisma\schema.prisma", "/var/www/api.demonightlight.test9.io.vn/prisma/schema.prisma"),
    (r"d:\laragon\www\NightLife-VN\backend\src\app.module.ts", "/var/www/api.demonightlight.test9.io.vn/src/app.module.ts"),
    (r"d:\laragon\www\NightLife-VN\backend\src\system-config\system-config.module.ts", "/var/www/api.demonightlight.test9.io.vn/src/system-config/system-config.module.ts"),
    (r"d:\laragon\www\NightLife-VN\backend\src\system-config\system-config.service.ts", "/var/www/api.demonightlight.test9.io.vn/src/system-config/system-config.service.ts"),
    (r"d:\laragon\www\NightLife-VN\backend\src\system-config\system-config.controller.ts", "/var/www/api.demonightlight.test9.io.vn/src/system-config/system-config.controller.ts"),
    (r"d:\laragon\www\NightLife-VN\frontend\apps\web\src\app\admin\layout.tsx", "/var/www/demonightlight.test9.io.vn/apps/web/src/app/admin/layout.tsx"),
    (r"d:\laragon\www\NightLife-VN\frontend\apps\web\src\app\admin\appearance\page.tsx", "/var/www/demonightlight.test9.io.vn/apps/web/src/app/admin/appearance/page.tsx"),
]

for local, remote in files_to_upload:
    print(f"Uploading to {remote}...")
    try:
        ensure_remote_dir(sftp, os.path.dirname(remote).replace('\\', '/'))
        sftp.put(local, remote)
    except Exception as e:
        print(f"Failed to upload {remote}: {e}")

sftp.close()

# Execute backend restart commands
commands = [
    "cd /var/www/api.demonightlight.test9.io.vn && npx prisma generate",
    "cd /var/www/api.demonightlight.test9.io.vn && npx prisma migrate dev --name init_system_config",
    "cd /var/www/api.demonightlight.test9.io.vn && pnpm run build",
    "cd /var/www/api.demonightlight.test9.io.vn && pm2 restart app-api.demonightlight.test9.io.vn --update-env 2>/dev/null || pm2 start pnpm --name 'app-api.demonightlight.test9.io.vn' -- run start:prod",
    "cd /var/www/demonightlight.test9.io.vn && pnpm run build",
    "cd /var/www/demonightlight.test9.io.vn && pm2 restart app-demonightlight.test9.io.vn --update-env 2>/dev/null || pm2 start pnpm --name 'app-demonightlight.test9.io.vn' -- --dir apps/web run start"
]

for cmd in commands:
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out.strip(): print("STDOUT:", out.strip()[:500] + ("..." if len(out) > 500 else ""))
    if err.strip(): print("STDERR:", err.strip()[:500] + ("..." if len(err) > 500 else ""))
    if exit_status != 0:
        print(f"Command failed with status {exit_status}")

ssh.close()
print("Deploy finished.")
