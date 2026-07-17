# wp_intaker — Project Rules

This file inherits all rules in `~/.config/opencode/AGENTS.md` and overrides only what is project-specific.

---

# Project Type
Static web app — a self-contained single-file client website survey / intake form for **AM Worx Studio**.

# Stack (locked)
- **Single HTML file** — all CSS and JS are embedded in `index.html` (no external files, no build step).
- **FormSubmit.co** — full submission delivery to `amworxx@gmail.com` (free, unlimited, AJAX).
- **EmailJS** — OTP code delivery + client confirmation emails (free tier: 200/month, no recipient activation).
- **GitHub Pages** as static hosting (free forever).
- **Google Fonts (Inter)** + **EmailJS SDK** loaded via CDN.

# Source of Truth
- **`index.html`** is the single source of truth for:
  - All survey questions, options, and structure.
  - All pricing values (via `data-price` attributes and the JS `calculate()` function).
  - Studio name and branding.
  - FormSubmit endpoint URL.
  - EmailJS configuration (Public Key, Service ID, Template IDs).
- No separate settings or configuration files.

# Non-negotiables
- Never auto-install dependencies.
- Never commit secrets.
- Never use paid SaaS APIs.
- Never split the single-file architecture — all changes go into `index.html`.

# Deployment
- Hosting: GitHub Pages (`Settings` → Pages → `main` → `/` (root) source).
- Domain: optional, e.g. `amworx.github.io/wp_intaker/`.

# Email Architecture
| Email | Service | To | Content |
|---|---|---|---|
| Full submission (primary) | **Google Apps Script → Gmail** | `amworxx@gmail.com` | HTML email + PDF + all uploaded files as native Gmail attachments |
| Full submission (fallback 1) | EmailJS (`otp_template`) | `amworxx@gmail.com` | HTML body only, no attachments |
| Full submission (fallback 2) | FormSubmit.co (`/ajax/`) | `amworxx@gmail.com` | Text-only summary |
| OTP code | EmailJS (`otp_template`) | Client's email | 6-digit verification code |

Apps Script is the primary delivery channel — it sends a fully styled HTML email with PDF + every uploaded file attached natively to Gmail. Web Apps on Apps Script are 100% free, send via Gmail directly with attachments up to 25MB, and run under the existing `amworxx@gmail.com` account (no third parties). Fallbacks only fire if Apps Script URL is unconfigured or unreachable.

# Google Apps Script Backend
- Single endpoint (`APPS_SCRIPT_URL`) configured in `index.html` after deploying the Apps Script Web App.
- Receives JSON `POST { form: {...}, files: [{name, type, content (base64)}], request_time }`.
- Builds HTML email body with all form fields (human-readable labels) and calls `MailApp.sendEmail({htmlBody, attachments, to: STUDIO_EMAIL})`.
- Setup guide and copy-pasteable code: **`docs/google-apps-script.md`**.
- Quotas: 100 emails/day consumer Gmail; 25MB attachment cap; Apps Script request body 50MB.

# PDF Generation
- jsPDF is loaded client-side and generates a multi-page PDF with all form fields before submission. The PDF is sent as the first attachment via Apps Script.

# FormSubmit Usage
- FormSubmit `/ajax/` endpoint retained as last-resort text-only fallback (does NOT deliver attachments).
- Do NOT send TO client emails via FormSubmit — it triggers activation emails.

# Workflow
1. Client opens `index.html` (served via GitHub Pages).
2. Client enters email → clicks "Send Verification Code" → **OTP sent via EmailJS**.
3. Client enters OTP code → email **✓ Verified** and locked (read-only).
4. Client fills out the 7-section survey with live price estimation.
5. On submit:
   - **FormSubmit** sends full submission + files to `amworxx@gmail.com`.
   - **EmailJS** sends a confirmation to the client's email.
6. Summary is displayed on-screen with copy-to-clipboard as fallback.

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
