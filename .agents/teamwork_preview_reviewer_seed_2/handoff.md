# Handoff Report — Code Review of `backend/seed_vps_full.py`

## 1. Observation
- **Script Location**: `backend/seed_vps_full.py`
- **Unit Test Location**: `backend/test_seed_vps_full.py`
- **Key Code Segments in `seed_vps_full.py`**:
  - Connection (lines 13-18):
    ```python
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('45.119.83.233', username='root', password='Tailoc@2026')
    ```
  - Remote Directory Creation (line 26):
    ```python
    ssh.exec_command(f"mkdir -p {remote_seed_dir}")
    ```
  - SFTP Upload (lines 30-48):
    ```python
    sftp = ssh.open_sftp()
    ...
    sftp.put(local_seed_entry, remote_seed_entry)
    ...
    sftp.put(local_file, remote_file)
    ...
    sftp.close()
    ```
  - Remote Execution (lines 53-57):
    ```python
    seed_cmd = "cd /var/www/api.demonightlight.test9.io.vn && npx prisma db seed"
    stdin, stdout, stderr = ssh.exec_command(seed_cmd)
    exit_status = stdout.channel.recv_exit_status()
    ```

## 2. Logic Chain
1. **Paramiko Usage**: The script imports and correctly instantiates the `paramiko.SSHClient` and `AutoAddPolicy`. It successfully sets up the connection logic.
2. **SFTP Uploads**: It opens an SFTP channel (`ssh.open_sftp()`), validates the existence of local directories (`backend/prisma/seed.ts` and `backend/prisma/seed/`), and uploads all `.ts` files to the target directories.
3. **Execution Command**: The script executes `cd /var/www/api.demonightlight.test9.io.vn && npx prisma db seed` on the remote server `45.119.83.233`.
4. **Incorrect Seed Profile**: Because `npx prisma db seed` invokes `ts-node prisma/seed.ts` without arguments, it defaults to the `demo` profile. It does NOT run the `full` profile as the script's name `seed_vps_full.py` implies.
5. **Race Condition**: `ssh.exec_command` is non-blocking. If the SFTP channel opens and uploads start before `mkdir -p` finishes, it will raise a `FileNotFoundError`.
6. **Missing DevDependencies**: If the VPS runs in a production environment where `devDependencies` are excluded, `ts-node` will be missing, causing `npx prisma db seed` to fail.

## 3. Caveats
- Since this is a review-only role, we did not execute the script against the live VPS IP `45.119.83.233`. We assume the server configuration and credentials are correct.
- Local verification was performed using mock-based unit tests (`test_seed_vps_full.py`) and a syntax compile check.

## 4. Conclusion
The script successfully implements the core requirements (correct Paramiko usage, SFTP file uploading, and remote Prisma seeding command execution on `45.119.83.233`). However, it has major critical flaws that should be addressed before deployment:
1. **Wrong profile executed**: Defaults to `demo` instead of `full` profile.
2. **Race condition**: Non-blocking `mkdir -p`.
3. **Potential dependency failure**: Relying on `ts-node` in production.
4. **Security Risk**: Hardcoded root password.
5. **Connection leakage**: No `finally` block to close SSH/SFTP.

## 5. Verification Method
- **Syntax Check**: Run `python -m py_compile backend/seed_vps_full.py`.
- **Unit Test Execution**: Run `python -m unittest backend/test_seed_vps_full.py` to verify SSH mock interactions and path correctness.
