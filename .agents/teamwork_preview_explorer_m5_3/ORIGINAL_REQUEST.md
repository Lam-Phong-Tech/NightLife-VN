## 2026-07-16T02:32:27Z
You are teamwork_preview_explorer.
Your identity: Explorer 3 - Frontend Diff UI Design Specialist.
Your working directory is: d:/laragon/www/NightLife-VN/.agents/teamwork_preview_explorer_m5_3/
Your task is to explore and analyze the codebase for the following requirements:
1. Fix backend partner request state machine logic in nightlife-data.service.ts (d:/laragon/www/NightLife-VN/backend/src/nightlife-data/nightlife-data.service.ts):
   - Locate and analyze where partnerRequest state transitions occur.
   - Analyze ensurePartnerOnboarding calls. It should only be triggered for new registrations (IDs starting with "PARTNER-"). For listing updates ("LISTING-"), skip onboarding and update the Store directly.
   - When rejecting (Reject), set Store status to DRAFT only for PARTNER- requests. For LISTING- requests, keep the old/current Store status (e.g. ACTIVE).
   - Ensure the detailed fields of the original Store are loaded in partnerRequestSelect and mapPartnerRequestRecord queries to support diffing in frontend.
2. Design frontend improvements in AdminConsole.tsx (d:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/AdminConsole.tsx):
   - Analyze how partner requests are rendered, tabbed, and approved/rejected.
   - Design separate tabs: Registration (PARTNER- requests) vs Modification (LISTING- requests).
   - Design a "Xem thay đổi" (View Changes) button for listing modification requests.
   - Design a side-by-side Diff View comparison modal:
     - Left column: Original/current Store data.
     - Right column: Proposed/updated Store data from PartnerRequest.
     - Visually highlight changed fields (name, type, address, phone, description, open/close hours, menu, etc.).
     - Include feedback/reason text field and Approve/Reject buttons inside the modal.
3. Review the constraints in AGENTS.md (specifically git commit/push rule, no browser alert/select/native datepicker).
4. Write your findings and proposed change locations/details to handoff.md in your working directory.
