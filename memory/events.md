# Events Log

This file records every meaningful action performed in this project.
Append-only. Entry format: `EVT-YYYYMMDD-NNNN`.

---

## EVT-20260716-0001 — Project Initialization

- Timestamp: 2026-07-16 00:16 (local)
- Mode: PLAN
- Action: Created project root `wp_intaker/` under container `C:\Users\HP\Documents\code_repo\wp_repo\`.
- Summary: Scaffolded required directories per global AGENTS.md standard.
- Result: SUCCESS
- Files affected (folders created):
  - `docs/`
  - `plans/`
  - `tasks/`
  - `memory/`
  - `src/admin/`
  - `src/css/`
  - `src/js/`
  - `src/settings/`
- Errors: none
- Lessons: directory structure chosen so `src/` mirrors what GitHub Pages serves; admin lives under `/admin/` for clean URL separation.
- Tags: [init, scaffold, webapp]
- Next intent: bootstrap memory files + project AGENTS.md + initial source skeleton.

## EVT-20260716-0002 — Source scaffolding complete

- Timestamp: 2026-07-16 00:19 (local)
- Mode: BUILD
- Action: Wrote full static web app source tree for client intake survey with live cost calc and admin dashboard.
- Summary: Created index.html (survey), admin/index.html (settings dashboard), css/style.css, js/app.js (pure cost engine + FormSubmit POST + jsPDF), js/admin.js (GitHub Contents API save), src/settings/defaults.json (pricing rules + studio profile + form field definitions), plus docs/deploy.md and docs/google-sheets-integration.md.
- Result: SUCCESS
- Files affected:
  - `src/index.html`
  - `src/admin/index.html`
  - `src/css/style.css`
  - `src/js/app.js`
  - `src/js/admin.js`
  - `src/settings/defaults.json`
  - `docs/deploy.md`
  - `docs/google-sheets-integration.md`
- Errors: none
- Lessons: keeping the form receiver via FormSubmit (email + cc) and the records path via Apps Script alternative documented; admin token model documented as solo-studio acceptable trade-off.
- Tags: [build, survey, formsubmit, github-pages, jspdf, admin-dashboard]
