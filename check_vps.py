import paramiko

def execute_remote_command(ip, username, password, command):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print(f"Connecting to {ip}...")
        client.connect(ip, username=username, password=password, timeout=10)
        print(f"Connected. Executing: {command}")
        stdin, stdout, stderr = client.exec_command(command)
        
        output = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        
        if output:
            print("--- STDOUT ---")
            print(output.encode('cp1252', errors='replace').decode('cp1252'))
        if error:
            print("--- STDERR ---")
            print(error.encode('cp1252', errors='replace').decode('cp1252'))
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    ip = "45.119.83.233"
    username = "root" # Assuming root, will fallback to tailoc if it fails
    password = "Tailoc@2026"
    
    # 1. PM2 logs for backend
    # 2. Database check
    # 3. Prisma status
    
    command = "cd /var/www/api.demonightlight.test9.io.vn && pnpm build && pm2 restart app-api.demonightlight.test9.io.vn"
    execute_remote_command(ip, username, password, command)
