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
| Full submission (primary) | **EmailJS** (`submission_template`) | `amworxx@gmail.com` | Professional HTML email with ALL form data in a styled table (CodePen-style) |
| Full submission (fallback) | FormSubmit.co (`/ajax/`) | `amworxx@gmail.com` | Text-only summary |
| OTP code | EmailJS (`otp_template`) | Client's email | 6-digit verification code |
| Client confirmation | EmailJS (`otp_template`) | Client's email | Thank-you + overview |

EmailJS is the primary delivery channel — it sends a beautifully formatted HTML email body containing all form fields with human-readable labels. No file attachments (EmailJS free tier limitation).

FormSubmit `/ajax/` endpoint serves as a text-only fallback. User-uploaded file names are listed in the email body but files cannot be attached due to EmailJS free plan limits.

# EmailJS Templates
## `submission_template`
- Variables: `{{email_body}}`, `{{company_name}}`, `{{request_time}}`, `{{logo_url}}`, `{{support_url}}`, `{{email}}`, `{{to_email}}`
- The `{{email_body}}` variable contains the full HTML table with all submission data
- Template subject: `New Website Request — {{company_name}}`
- Template body: use `{{{email_body}}}` (triple braces for raw HTML rendering) in the Content > Code section

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
