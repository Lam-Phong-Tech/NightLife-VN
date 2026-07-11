import paramiko

def run_ssh_command(host, port, username, password, command):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, port, username, password)
        stdin, stdout, stderr = client.exec_command(command)
        exit_status = stdout.channel.recv_exit_status()
        out = stdout.read().decode('utf-8')
        err = stderr.read().decode('utf-8')
        return exit_status, out, err
    except Exception as e:
        return -1, "", str(e)
    finally:
        client.close()

if __name__ == '__main__':
    commands = [
        # Put the env in apps/web too just to be absolutely certain
        "echo 'NEXT_PUBLIC_API_URL=\"https://api.demonightlight.test9.io.vn\"' > /var/www/demonightlight.test9.io.vn/apps/web/.env.production",
        # Force turbo to rebuild by ignoring cache
        "cd /var/www/demonightlight.test9.io.vn && pnpm build --force",
        "pm2 restart app-demonightlight.test9.io.vn"
    ]
    with open('vps_fix_output2.txt', 'w', encoding='utf-8') as f:
        for cmd in commands:
            f.write(f"--- RUNNING: {cmd} ---\n")
            status, out, err = run_ssh_command("45.119.83.233", 22, "root", "Tailoc@2026", cmd)
            f.write(f"EXIT_STATUS: {status}\n")
            f.write("STDOUT:\n" + out + "\n")
            if err:
                f.write("STDERR:\n" + err + "\n")
