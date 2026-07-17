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

## EVT-20260716-0003 — Design polish & mobile optimization

- Timestamp: 2026-07-16 (local)
- Mode: BUILD
- Action: Applied design-taste-frontend skill to refine UI, add progress tracking, animate conditional fields, and optimize mobile layout.
- Summary:
  - CSS: full design system with custom properties, refined typography, improved form fields, checkbox card selected states, animated conditional fields (`.field-hidden`), staggered section entrance animations, `prefers-reduced-motion` support, 4-tier responsive breakpoints.
  - HTML: added 5-step progress indicator (`<ol class="progress-steps">`), footer, cache-bust `?v=3`.
  - JS: `IntersectionObserver`-based progress tracking updates step links, conditional fields use CSS class toggle for smooth slide transitions, styled success state replaces `alert()`.
- Result: SUCCESS
- Files affected:
  - `css/style.css`
  - `index.html`
  - `js/app.js`
- Errors: none
- Lessons: CSS `max-height` + `opacity` + `transform` transition is a lightweight, no-library way to animate show/hide. `IntersectionObserver` with `rootMargin` accounts for sticky header height. Staggered `fadeInUp` on `.section` elements gives pleasant on-load animation without JS.
- Tags: [design, polish, mobile, animation, accessibility, progress-tracker]

## EVT-20260717-0004 � Login gate replaced with Uiverse monkey card

- Timestamp: 2026-07-17 (local)
- Mode: BUILD
- Action: Replaced the admin login gate with the uiverse.io monkey card design by ilkhoeri (rare-treefrog-60).
- Summary:
  - CSS: Added full uiverse monkey card styles, namespaced under .login-gate to avoid conflicts with existing .avatar class. Includes monkey blink/slick animations, blind input toggle, dark mode overrides.
  - HTML: Replaced the entire login gate with the monkey face SVG + hand SVG + animated eye tracking + blind show/hide toggle. Kept the dark gradient background with animated orbs and dot-grid overlay.
  - Alpine: Added showPasscode state for the blind checkbox, wired to input :type toggle. login() and passcode model remain from parent dashboardApp() scope.
  - The monkey blinks every 10s, tracks input focus (eyes sway), and covers its eyes with hands when Hide is clicked.
- Result: SUCCESS
- Files affected:
  - admin/index.html
- Errors: none (first attempt got 403 from uiverse.io; user provided HTML/CSS directly)
- Lessons: Namespace third-party CSS selectors under a parent class (.login-gate) when they may conflict with existing classes (.avatar was already used in dashboard table rows).
- Tags: [login, uiverse, monkey, animation, admin-dashboard]
