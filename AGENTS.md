# wp_intaker — Project Rules

This file inherits all rules in `~/.config/opencode/AGENTS.md` and overrides only what is project-specific.

---

# Project Type
Static web app — a self-contained single-file client website survey / intake form for **AM Worx Studio**.

# Stack (locked)
- **Single HTML file** — all CSS and JS are embedded in `index.html` (no external files, no build step).
- **FormSubmit.co** as form receiver endpoint (free, unlimited, supports `_cc` and AJAX).
- **GitHub Pages** as static hosting (free forever).
- **Google Fonts (Inter)** — only external resource loaded via CDN.

# Source of Truth
- **`index.html`** is the single source of truth for:
  - All survey questions, options, and structure.
  - All pricing values (via `data-price` attributes and the JS `calculate()` function).
  - Studio name and branding.
  - FormSubmit endpoint URL.
- No separate settings or configuration files.

# Non-negotiables
- Never auto-install dependencies.
- Never commit secrets.
- Never use paid SaaS APIs.
- Never split the single-file architecture — all changes go into `index.html`.

# Deployment
- Hosting: GitHub Pages (`Settings` → Pages → `main` → `/` (root) source).
- Domain: optional, e.g. `amworx.github.io/wp_intaker/`.

# Workflow
1. Client opens `index.html` (served via GitHub Pages).
2. Client fills out the 7-section survey with live price estimation.
3. On submit, two separate FormSubmit POSTs are sent:
   - **Studio POST** — full detailed submission to `amworxx@gmail.com`.
   - **Client POST** — simplified confirmation to the client's email (best-effort).
4. Summary is displayed on-screen with copy-to-clipboard as fallback.

# Pricing
- Prices are set via `data-price` attributes on each input element.
- The `calculate()` JavaScript function reads these attributes and computes the total.
- To update pricing: edit `data-price` values in the HTML and/or the JS calculation logic.
- No external pricing configuration files.

# Memory Discipline
- Every meaningful action recorded in `memory/events.md`.
- Lessons go to `memory/lessons.md` with severity and fix.
- Repeated patterns recorded in `memory/patterns.md`.
- Architecture and tooling decisions in `memory/decisions.md`.
- Reusable workflows in `memory/playbooks.md`.
