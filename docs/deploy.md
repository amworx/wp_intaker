# Deployment Guide — wp_intaker

## Prerequisites
- A GitHub account.
- A public repo `wp_intaker` under your account (or organization).
- Local terminal with `git` installed.
- FormSubmit.co (no account needed, just a valid destination email).

## One-time setup

### 1. Create the GitHub repo
- New repo → `wp_intaker` → Public → Create.
- Do NOT add README / .gitignore / license (we already have those).

### 2. Push source to GitHub
From the project root (`C:\Users\HP\Documents\code_repo\wp_repo\wp_intaker`), run:
```
git init
git add .
git commit -m "feat: initial wp_intaker intake app"
git remote add origin https://github.com/<YOU>/wp_intaker.git
git push -u origin main
```

### 3. Configure FormSubmit
- Go to `https://formsubmit.co/<your-email>` once.
- The first submission (or request) triggers a confirmation email.
- Confirm via the email link FormSubmit sends.
- Set your FormSubmit-specific subject template and layout in `settings/defaults.json` (`_subject`, `_template`) or change to a custom email via Apps Script (see `docs/google-sheets-integration.md`).

### 4. Enable GitHub Pages
- Repo → Settings → Pages.
- Source: **Deploy from a branch** → Branch: `main` → Folder: `/src` → Save.
- Site URL becomes `https://<YOU>.github.io/wp_intaker/`.

### 5. Update the live settings (first time)
- Visit `https://<YOU>.github.io/wp_intaker/admin/` in your browser.
- Paste a GitHub fine-grained PAT with `Contents: Write` scope on this repo.
- The form auto-loads `settings.json` — edit and Save.

### 6. Share the intake link
Send this to clients:
```
https://<YOU>.github.io/wp_intaker/
```

## Updating settings later
Just visit `/admin/`, edit, Save. A new commit appears in your repo history.

## Custom domain (optional)
In GitHub Pages settings, add a custom domain (from Hostinger). Add CNAME record at your registrar pointing to `<YOU>.github.io`.

## Google Sheets records integration
See `docs/google-sheets-integration.md`.
