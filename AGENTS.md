# wp_intaker — Project Rules

This file inherits all rules in `~/.config/opencode/AGENTS.md` and overrides only what is project-specific.

---

# Project Type
Static web app — a client intake survey for a WordPress + opencode studio.

# Stack (locked)
- Vanilla HTML / CSS / JS (no framework, no build step).
- jsPDF loaded via CDN for client-side PDF generation.
- FormSubmit.co as form receiver endpoint (free, unlimited, supports `_cc`).
- Google Sheets as record store (FormSubmit native integration OR Apps Script).
- GitHub Pages as static hosting (free forever).
- GitHub API used by the admin dashboard to commit changes to `settings/settings.json`.

# Source of Truth
- `settings/settings.json` is the single source of truth for:
  - Studio / owner profile (name, email, reply time, brand color).
  - Pricing rules (base, per-page, per-feature, add-ons).
  - Hostinger tier matching rules.
  - Email subject + body templates.
  - Survey field metadata (label, help text, options).

# Non-negotiables
- Never auto-install dependencies.
- Never commit secrets. The GitHub PAT used by `/admin` lives only in browser `localStorage`.
- Never hardcode the studio's actual studio name, email, or pricing values inside source files — they live only in `settings.json` and are rendered via templates.
- Never use paid SaaS APIs.

# Deployment
- Hosting: GitHub Pages (`Settings` → Pages → `main` → `/` (root) source).
- Domain: optional, e.g. `amworx.github.io/wp_intaker/`.

# Workflow
1. Survey UI: `index.html` reads `settings.json` and renders the form.
2. Live cost calculator uses pricing rules from `settings.json`.
3. Submit triggers POST to FormSubmit.co (configured recipient + `_cc` client email).
4. FormSubmit sends two emails (you + client) and can write a row to Google Sheets.
5. Client receives an automated PDF estimate generated client-side and attached in the email body (via FormSubmit body templates).

# Admin / `/admin/`
- A static dashboard that reads `settings.json` from the repo and lets the owner patch pricing, studio profile, and email templates.
- Saves by committing a single file change via GitHub Contents API.
- Token stored in `localStorage`, never on a server.

# Memory Discipline
- Every meaningful action recorded in `memory/events.<mode>.log`.
- Lessons go to `memory/lessons.md` with severity and fix.
- Repeated patterns recorded in `memory/patterns.md`.
- Architecture and tooling decisions in `memory/decisions.md`.
- Reusable workflows in `memory/playbooks.md`.

