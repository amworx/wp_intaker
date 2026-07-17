# Google Apps Script Email Backend

This guide shows how to deploy a free Google Apps Script that delivers intake form submissions (HTML email + file attachments) directly to **amworxx@gmail.com** via Gmail — 100% free, 25MB attachments per email.

**Why Apps Script over FormSubmit/EmailJS:**
- FormSubmit's `/ajax/` endpoint silently drops file attachments
- EmailJS free tier limits you to text-only emails (no attachments)
- Apps Script + Gmail = native support for HTML body + attachments
- No third-party service, no rate limits (100 emails/day consumer Gmail quota)

---

## Setup (10 minutes)

### 1. Open the script file
Open **`docs/intake-email-backend.gs`** in this repo. It contains the complete Apps Script code (pure JavaScript, no markdown, no special characters). Copy the **entire file contents**.

### 2. Create the Apps Script project
1. Go to https://script.google.com → **New Project**
2. Name the project: `wp_intake_email_backend`
3. Delete the placeholder code in `Code.gs`
4. **Paste** the contents of `intake-email-backend.gs`
5. **Save** (Ctrl+S / Cmd+S)
6. **Authorize** when prompted — grant Gmail send permission

### 3. Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Gear icon → select **Web app**
3. Settings:
   - **Description**: `AM Worx Intake Email Backend`
   - **Execute as**: Me (your Gmail address)
   - **Who has access**: **Anyone**
4. Click **Deploy**
5. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

### 4. Test it works
Open the Web App URL in your browser. You should see JSON:
```json
{"status":"OK","service":"AM Worx Intake","email":"amworxx@gmail.com"}
```

### 5. Paste URL into `index.html`
Open `index.html` and find this line:
```js
const APPS_SCRIPT_URL = '';
```
Replace with your deployment URL:
```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

Commit, push to GitHub Pages. Done.

---

## Why a separate `.gs` file?

The Apps Script editor rejects markdown-formatted code because lines like `### 1. Open Apps Script` and `**bold text**` are not valid JavaScript. Copying directly from a markdown fence can also carry stray non-ASCII characters (em dashes, smart quotes) that some Internet connections re-encode when copy-pasting.

**`docs/intake-email-backend.gs`** is a pure JavaScript file with only ASCII characters — it's safe to copy-paste in one shot.

---

## Quotas and Limits

| Limit | Value |
|---|---|
| Email attachments per message | 25MB |
| Apps Script request body | 50MB |
| Consumer Gmail daily sends | 100 emails/day |
| Cost | $0 forever |

For an intake form receiving a handful of submissions per day, this is more than enough.

## How it Works

```
Client submits form
       ↓
Browser POSTs JSON (form data + base64 files) to Apps Script URL
       ↓
Apps Script parses JSON
       ↓
MailApp.sendEmail() to amworxx@gmail.com with HTML body + attachments
       ↓
Studio sees email in Gmail with everything attached
```

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| "SyntaxError: Invalid or unexpected token line: 1" | Pasted markdown instead of clean code | Copy from `docs/intake-email-backend.gs` instead of this README's code fence |
| 401 Unauthorized | Apps Script deployed as "Only myself" | Re-deploy with "Anyone" access |
| 404 Not Found | Old deployment URL | Re-deploy and copy latest URL |
| "Service invoked too many times" | Hit Gmail daily limit (100) | Resets at midnight Pacific |
| "Request contains too much data" | Total payload > 50MB | Compress files; reject large uploads client-side |
| HTML body shows raw HTML | Email client doesn't render HTML | Use Gmail (it does) |
| Files arrive as 0KB | base64 decoding error | Verify `Utilities.base64Decode` is called on raw base64 (no `data:` prefix) |
