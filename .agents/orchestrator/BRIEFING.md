# BRIEFING — 2026-07-15T23:59:00+07:00

## Mission
Coordinate the backend integration of booking and discount flows matching the specifications in ORIGINAL_REQUEST.md.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: d:/laragon/www/NightLife-VN/.agents/orchestrator/
- Original parent: parent
- Original parent conversation ID: 13c51c1b-569f-437b-a554-559d4f76c02c

## 🔒 My Workflow
- **Pattern**: Project Pattern
- **Scope document**: d:/laragon/www/NightLife-VN/PROJECT.md
1. **Decompose**: Decompose the requirements into milestones for exploration, implementation, review, and verification.
2. **Dispatch & Execute**:
   - **Delegate (sub-orchestrator)**: For each milestone, delegate tasks to explorers, workers, and reviewers, or spawn a sub-orchestrator if needed.
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns, write handoff.md, spawn successor, and exit.
- **Work items**:
  1. Explore codebase and locate modules for Booking, Coupon, and Bill [pending]
  2. Implement R1 (tier-based default coupon and snapshot) [pending]
  3. Implement R2 (preserve bar campaign rates) [pending]
  4. Implement R3 (integrate Admin Global Coupon logic) [pending]
  5. Verification & E2E Testing (pass all tests, run integrity audit) [pending]
- **Current phase**: 1
- **Current focus**: Explore codebase and define global PROJECT.md

## 🔒 Key Constraints
- Never write, modify, or create source code files directly.
- Never run build/test commands yourself — require workers to do so.
- Audit Enforcement: If Forensic Auditor reports INTEGRITY VIOLATION, milestone fails unconditionally.
- Never reuse a subagent after it has delivered its handoff.

## Current Parent
- Conversation ID: 13c51c1b-569f-437b-a554-559d4f76c02c
- Updated: not yet

## Key Decisions Made
- [TBD]

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| Explorer 1 | teamwork_preview_explorer | Explore & Design (R1-R3) | completed | 1c89a659-845d-4730-94f9-3895a4da6614 |
| Explorer 2 | teamwork_preview_explorer | Explore & Design (R1-R3) | completed | 82544eca-68c5-474f-b014-67001fef6765 |
| Explorer 3 | teamwork_preview_explorer | Explore & Design (R1-R3) | completed | 33bc6506-02ca-499c-bfae-b65792076787 |
| Worker 1 | teamwork_preview_worker | Implement R1, R2, R3 | in-progress | 343f048b-de15-4f50-8eab-0341b9de7a6d |

## Succession Status
- Succession required: no
- Spawn count: 4 / 16
- Pending subagents: 343f048b-de15-4f50-8eab-0341b9de7a6d
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-15
- Safety timer: none

## Artifact Index
- d:/laragon/www/NightLife-VN/.agents/orchestrator/ORIGINAL_REQUEST.md — Verbatim user request
- d:/laragon/www/NightLife-VN/.agents/orchestrator/BRIEFING.md — Persistent briefing and memory
- d:/laragon/www/NightLife-VN/.agents/orchestrator/progress.md — Liveness and step-by-step progress tracking
- d:/laragon/www/NightLife-VN/PROJECT.md — Global project plan and milestones
