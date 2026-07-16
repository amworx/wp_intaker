# Deployment Guide — wp_intaker

## Prerequisites
- A GitHub account and the repo already pushed.
- FormSubmit.co (no account needed, just your email).

## 1. Enable GitHub Pages
- Repo → **Settings** → **Pages**.
- **Source:** `Deploy from a branch`.
- **Branch:** `main` → folder: `/ (root)` → **Save**.
- Wait ~1 minute. Your URL: `https://amworx.github.io/wp_intaker/`

## 2. Activate FormSubmit (5 seconds)
Visit `https://formsubmit.co/amworxx@gmail.com` — confirm via the email they send.

## 3. Update your settings
Visit `https://amworx.github.io/wp_intaker/admin/` — paste a GitHub fine-grained PAT (Contents: Write scope on this repo only) and save your edits.

## 4. Share the intake link
```
https://amworx.github.io/wp_intaker/
```

## Custom domain (optional)
In GitHub Pages settings, add a custom domain (from Hostinger). Add a CNAME record pointing to `amworx.github.io`.

## Google Sheets records integration
See `docs/google-sheets-integration.md`.
