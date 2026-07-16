# BRIEFING — 2026-07-16T09:53:22+07:00

## Mission
Fix the missing fallback mapping for casts and media when normalizing the "live" store data in nightlife-data.service.ts.

## 🔒 My Identity
- Archetype: Worker 2 - Partner Form Go-Live Fallback Fix
- Roles: implementer, qa, specialist
- Working directory: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_2/
- Original parent: 0f70e5e8-075b-4673-815e-ff91f8cb5e31
- Milestone: Milestone 6 - Partner Form Go-Live Fallback Fix

## 🔒 Key Constraints
- Sau khi hoàn thành việc chỉnh sửa mã nguồn, hãy tự động tạo một commit trên Github và push lên (sử dụng các lệnh `git add`, `git commit -m "..."` và `git push`). Đừng quên báo cáo lại cho người dùng sau khi commit thành công.
- Tuyệt đối không dùng alert mặc định của trình duyệt, hãy sử dụng toast hoặc modal tự dựng để thông báo.
- Tuyệt đối không sử dụng giao diện thẻ `<select>` mặc định của trình duyệt.
- Tuyệt đối không sử dụng thư viện DatePicker/DateTimePicker mặc định của trình duyệt.
- CODE_ONLY network mode: no external HTTP/CURL requests.
- .agents/ holds only agent metadata. Never place source code, tests, or data files here.

## Current Parent
- Conversation ID: 0f70e5e8-075b-4673-815e-ff91f8cb5e31
- Updated: not yet

## Task Summary
- **What to build**: Fix missing fallback mapping for casts and media when normalizing "live" store data in nightlife-data.service.ts.
- **Success criteria**:
  - In `getPartnerListingStore`, `media` relation select block includes `castId: true`.
  - In `normalizePartnerListingDraft`, correct fallbacks implemented for `coverImageUrl`, `galleryUrls`, `videoUrls`, and `castProfiles` when `dto.*` properties are undefined.
  - Backend compiles cleanly (`npm run build`).
  - Tests pass (`npm run test`).
  - Git commit & push performed.
- **Interface contracts**: `backend/src/nightlife-data/nightlife-data.service.ts`

## Key Decisions Made
- Use precise file replacements to avoid large-scale disruption.
- Run tests and builds locally via run_command.
- Selected `publicHeadline: true` on `casts` relation in `getPartnerListingStore` to prevent type error / runtime issues.
- Updated inline select queries inside `partnerListingStoreUpdateFromRequest` to match types.
- Made code robust against missing mocked relations in unit tests.

## Artifact Index
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_2/ORIGINAL_REQUEST.md — Original User Request
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_2/BRIEFING.md — Working Briefing
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_2/progress.md — Progress Heartbeat
- d:/laragon/www/NightLife-VN/.agents/teamwork_preview_worker_m6_7_2/handoff.md — Handoff Report

## Change Tracker
- **Files modified**:
  - backend/src/nightlife-data/nightlife-data.service.ts
- **Build status**: Pass
- **Pending issues**: None.

## Quality Status
- **Build/test result**: Pass
- **Lint status**: Clean
- **Tests added/modified**: None.
