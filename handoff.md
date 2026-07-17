# Handoff — AM Worx Studio Website Intake Form

This file is for any new team member taking over this project. It explains what was built, how it works, what's unfinished, and why certain decisions were made.

---

## Current State (Summary)

The intake form delivers submissions to the studio via **Google Apps Script → Gmail** — a single email arrives at `amworxx@gmail.com` with a styled HTML body plus PDF + all client uploads attached as native Gmail attachments. OTP verification still uses EmailJS.

Setup is documented in `docs/google-apps-script.md`.

---

## Project Overview

A single-file HTML website intake form (`index.html`) hosted on **GitHub Pages** at:

```
https://amworx.github.io/wp_intaker/
```

Clients fill out a 7-section survey about their website needs. The form calculates a price estimate in real time, verifies the client's email via OTP, and sends the submission to the studio (`amworxx@gmail.com`).

---

## What Was Done

### 1. Core Form (7 Sections)
| Section | Fields |
|---|---|
| Personal Info | Full Name, Business Name, Email, Phone |
| Domain & Hosting | Domain, Domain Idea, Hosting, Business Email, Email Accounts, Setup Help |
| Business Info | Description |
| Website Type & Pages | Type, Page checkboxes, Other Pages text |
| Features | Multiple-select checkboxes |
| Design & Content | Logo, Text, Photos, Brand Colors, Inspiration Links |
| Timeline & Maintenance | Timeline selection, Maintenance preference |
| Budget | Budget range dropdown, Extra Notes, Estimated Total (auto-calculated) |

All fields have **human-readable labels** in all outputs. Empty/unanswered fields display `—` (em dash).

### 2. Price Calculation Engine
- Each input carries a `data-price` attribute.
- `calculate()` JavaScript reads all `data-price` values and sums them live.
- Result shown in a breakdown table and a final "Estimated Total" field.
- Runs on page load and on any input change.

### 3. OTP Email Verification
- **Service**: EmailJS (`otp_template`)
- **Flow**:
  1. Client enters email → clicks "Send Verification Code"
  2. Server sends 6-digit passcode via EmailJS to that email
  3. Client enters code → clicks "Verify"
  4. Email field is locked (read-only + green check)
  5. Email is tied to the submission — cannot change after verification
- **OTP expires** after 15 minutes (countdown timer shown)
- **Resend** allowed with cooldown
- Template variables: `{{email}}`, `{{passcode}}`, `{{company_name}}`, `{{time}}`, `{{year}}`, `{{device}}`, `{{browser}}`, `{{location}}`, `{{request_time}}`, `{{logo_url}}`, `{{support_url}}`, `{{to_email}}`
- **Tested working** end-to-end using InboxAPI email (`ai-assistant@7747c9.inboxapi.ai`)

### 4. File Upload
- Clients can upload multiple files (click or drag-and-drop)
- Files shown as a list with remove buttons
- File names are included in the email table body
- Files are attached to FormSubmit FormData as fallback

### 5. Submission Delivery (Current Architecture)

**Primary** → **EmailJS** (`submission_template`)
- Sends a professionally styled HTML email table with ALL form data
- The email body is built client-side as HTML and injected via `{{email_body}}` (triple braces for raw HTML rendering)
- Styled with blue gradient header, alternating section rows, clean typography
- All labels are human-readable (e.g., "Full Name" not `full_name`)
- File names listed in the email under "Uploaded Files" section

**Fallback** → **FormSubmit.co** (`/ajax/` endpoint)
- Text-only `_summary` with all fields
- Files appended to FormData (may or may not arrive — FormSubmit silently drops attachments via `/ajax/`)

### 6. Thank-You / Status Display
- After submission, a thank-you card appears with a delivery status indicator
- Shows "Delivered ✓" or error message after EmailJS responds
- Submit button shows "Submitting..." spinner, then "Submitted ✓" in green

### 7. Hosting
- GitHub Pages, root of `main` branch
- Custom domain: `amworx.github.io/wp_intaker/`
- No build step — `index.html` is served directly

---

## Email Architecture (Current)

| Purpose | Service | To |
|---|---|---|
| Full submission (primary) | **Google Apps Script → Gmail** | `amworxx@gmail.com` |
| Full submission (fallback) | EmailJS (`otp_template`) | `amworxx@gmail.com` |
| Full submission (last resort) | FormSubmit.co (`/ajax/`) | `amworxx@gmail.com` |
| OTP code | EmailJS (`otp_template`) | Client's email |

**Primary delivery: Google Apps Script → Gmail.** Single email with HTML body + PDF + all uploaded files as native Gmail attachments. 100% free. Setup guide at **`docs/google-apps-script.md`**.

---

## Email Services Configuration

### EmailJS (Primary)
| Item | Value |
|---|---|
| Public Key | `UVIFF194EIvto7_0v` |
| Service ID | `otp_wp_intake` |
| OTP Template ID | `otp_template` |
| Submission Template ID | `submission_template` |

### FormSubmit.co (Fallback)
| Item | Value |
|---|---|
| Endpoint | `https://formsubmit.co/ajax/amworxx@gmail.com` |
| Method | POST with `_captcha=false` |
| Use | Text-only fallback for submission data |

**Warning**: Do NOT use FormSubmit to send TO client emails — it triggers activation emails.

---

## Key Technical Decisions

1. **Single-file architecture** — No build step, no npm, no frameworks. All CSS + JS in one HTML file. Simplifies deployment and maintenance.
2. **jsPDF removed** — Was generating client-side PDFs but couldn't deliver them. Removed to reduce page weight. Can be re-added if EmailJS plan is upgraded.
3. **`_captcha=false` on FormSubmit** — Required for AJAX mode. Without it, FormSubmit returns a captcha HTML page.
4. **Human-readable labels everywhere** — Form summary and email table use "Full Name" not `full_name`. Empty fields shown as `—`.
5. **OTP email locked after verify** — Prevents client from changing email mid-form and creating a mismatch.

---

## Common Issues & Workarounds

| Issue | Cause | Fix |
|---|---|---|
| OTP not sending | EmailJS template ID mismatch | Check `EMAILJS_TEMPLATE_ID` in JS matches dashboard |
| "Template not found" | Template deleted or ID changed | Verify in EmailJS dashboard → Email Templates |
| OTP email looks wrong | Template variables mismatched | Edit `otp_template` to match JS params |
| FormSubmit 500 | Files attached to regular endpoint | Already using `/ajax/` endpoint; this should not occur |
| "Delivered ✓" but no email | FormSubmit `/ajax/` lies about success | Check EmailJS status — primary channel works |
| Email body shows raw HTML | Template using `{{email_body}}` (double braces) | Must use `{{{email_body}}}` (triple braces) for raw HTML |

---

## To Continue Development

### High Priority
1. **File delivery** — Upgrade EmailJS to paid plan ($15/mo) for Variable Attachments, or integrate cloud storage (Dropbox, Google Drive, S3) for file uploads
2. **Client confirmation email** — Create a separate EmailJS template for post-submission thank-you to client (avoid OTP template confusion)

### Nice to Have
3. **PDF re-add** — Re-add jsPDF and attach generated PDF if EmailJS plan supports it
4. **Admin dashboard** — View submissions, manage pricing, update form fields
5. **Form validation improvements** — Per-field inline validation instead of summary errors
6. **Responsive email template** — The HTML email table looks great on desktop; test on mobile

### Maintenance
- EmailJS free tier: **200 emails/month**. If exceeded, OTP delivery will fail.
- FormSubmit: Unlimited, free. No rate limits documented.
- GitHub Pages: 1GB storage, 100GB bandwidth/month — more than sufficient.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Single-file survey form (approximately 2047 lines) |
| `AGENTS.md` | Project rules and architecture documentation |
| `handoff.md` | This file |
| `memory/` | Events, lessons, patterns, decisions, playbooks |
| `docs/` | Additional documentation |
| `plans/` | Planning documents |
| `tasks/` | Task tracking |

---

*Handoff prepared for AM Worx Studio - July 2026*
