import os
import paramiko

def main():
    # Setup paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    local_prisma_dir = os.path.join(script_dir, 'prisma')
    local_seed_dir = os.path.join(local_prisma_dir, 'seed')
    
    remote_base = '/var/www/api.demonightlight.test9.io.vn/prisma'
    remote_seed_dir = remote_base + '/seed'

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sftp = None

    print("Connecting to VPS (45.119.83.233)...")
    try:
        ssh.connect('45.119.83.233', username='root', password='Tailoc@2026')
        print("Connected successfully!")

        # Ensure remote seed directory exists
        print("Creating remote seed directory if not exists...")
        stdin, stdout, stderr = ssh.exec_command(f"mkdir -p {remote_seed_dir}")
        stdout.channel.recv_exit_status()

        # Copy files using SFTP
        print("Opening SFTP channel...")
        sftp = ssh.open_sftp()
        
        # 1. Upload seed.ts entry point
        local_seed_entry = os.path.join(local_prisma_dir, 'seed.ts')
        remote_seed_entry = remote_base + '/seed.ts'
        if os.path.exists(local_seed_entry):
            print(f"Uploading {local_seed_entry} -> {remote_seed_entry}")
            sftp.put(local_seed_entry, remote_seed_entry)
            
        # 2. Upload seed files recursively
        if os.path.exists(local_seed_dir):
            for filename in os.listdir(local_seed_dir):
                if filename.endswith('.ts'):
                    local_file = os.path.join(local_seed_dir, filename)
                    remote_file = remote_seed_dir + '/' + filename
                    print(f"Uploading {local_file} -> {remote_file}")
                    sftp.put(local_file, remote_file)
                    
        sftp.close()
        sftp = None
        print("File upload completed.")

        # Execute prisma seed command
        seed_cmd = "cd /var/www/api.demonightlight.test9.io.vn && npx tsx prisma/seed/index.ts --profile=full"
        print(f"Executing remote command: {seed_cmd}")
        stdin, stdout, stderr = ssh.exec_command(seed_cmd)
        
        exit_status = stdout.channel.recv_exit_status()
        print(f"Exit Status: {exit_status}")
        print("STDOUT:")
        print(stdout.read().decode('utf-8', errors='replace'))
        print("STDERR:")
        print(stderr.read().decode('utf-8', errors='replace'))

    except Exception as e:
        print(f"Execution failed: {e}")
    finally:
        if sftp is not None:
            try:
                sftp.close()
            except Exception:
                pass
        ssh.close()
        print("Seeding on VPS done.")

if __name__ == '__main__':
    main()
