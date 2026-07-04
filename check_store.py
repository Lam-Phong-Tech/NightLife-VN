import sys
import paramiko

ip = "45.119.83.233"
username = "root"
password = "Tailoc@2026"

def execute_remote_command(ip, username, password, command):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(ip, username=username, password=password)
        stdin, stdout, stderr = ssh.exec_command(command)
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        sys.stdout.buffer.write(b"--- STDOUT ---\n" + out.encode('utf-8') + b"\n")
        if err:
            sys.stdout.buffer.write(b"--- STDERR ---\n" + err.encode('utf-8') + b"\n")
    finally:
        ssh.close()

if __name__ == "__main__":
    command = "sudo -u postgres psql -p 5433 -d backend_db -c \"UPDATE stores SET area_id = (SELECT id FROM areas LIMIT 1) WHERE area_id IS NULL;\""
    execute_remote_command(ip, username, password, command)
