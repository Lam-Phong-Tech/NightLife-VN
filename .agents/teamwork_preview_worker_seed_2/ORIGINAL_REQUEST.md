## 2026-07-16T13:13:30Z
You are teamwork_preview_worker.
Your working directory is d:\laragon\www\NightLife-VN\.agents\teamwork_preview_worker_seed_2.
Your mission is to apply the requested code review improvements to backend/prisma/seed/index.ts and backend/seed_vps_full.py.

### Required Changes:
1. **Modify `backend/prisma/seed/index.ts`**:
   - Add a self-execution `main()` block at the bottom of the file (using `if (require.main === module)`) so that it can be run directly using `npx tsx prisma/seed/index.ts`.
   - Setup `PrismaClient` with `PrismaPg` adapter (similar to how `seed.ts` does it) and use `PasswordService` to hash 'Str0ngPass!'.
   - Import `PrismaPg` and `PasswordService` at the top of the file:
     ```typescript
     import { PrismaPg } from '@prisma/adapter-pg';
     import { PasswordService } from '../../src/common/password.service';
     ```
     (Ensure that `resolveSeedProfile` is also imported from `./shared`).
2. **Modify `backend/seed_vps_full.py`**:
   - Resolve the asynchronous race condition by waiting for the `mkdir -p` command to complete using `stdout.channel.recv_exit_status()`.
   - Update the remote VPS command to execute the correct profile on `45.119.83.233`:
     `cd /var/www/api.demonightlight.test9.io.vn && npx tsx prisma/seed/index.ts --profile=full`
   - Handle connection cleanup: Wrap the entire execution in a `try...finally` block to ensure `sftp.close()` and `ssh.close()` are always executed even if an exception occurs.
3. **Verify**:
   - Run the local build (`pnpm run build` inside `backend/` directory) to verify no compilation issues.
   - Run the python unit test suite (`python backend/test_seed_vps_full.py`) to verify the Paramiko mock tests pass cleanly.
4. **Git push**:
   - Run `git add .`
   - Run `git commit -m "chore(seed): resolve code review feedback for VPS deployment script and index.ts self-exec"`
   - Run `git push`

### MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, compile a handoff report (handoff.md) in your folder with commands run, output logs, and build/test results, and send a message back.
