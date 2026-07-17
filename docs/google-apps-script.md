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
Open **`docs/intake-email-backend.gs`** (pure JavaScript, ASCII only) or copy-paste this entire block into the Apps Script editor:

```javascript
/**
 * AM Worx Intake - Email Backend
 * Receives form submissions + file attachments and forwards to studio Gmail.
 */

const STUDIO_EMAIL = 'amworxx@gmail.com';

function doPost(e) {
  try {
    const raw = e.postData.contents;
    const data = JSON.parse(raw);
    const form = data.form || {};
    const files = data.files || [];
    const requestTime = data.request_time || new Date().toLocaleString();

    const attachments = (files || []).map(function(f) {
      return Utilities.newBlob(
        Utilities.base64Decode(f.content),
        f.type || 'application/octet-stream',
        f.name
      );
    });

    const htmlBody = buildEmailHtml(form, requestTime);

    const fullName = form.full_name || 'Anonymous';
    const business = form.business_name ? ' - ' + form.business_name : '';
    const subject = 'New Website Request - ' + fullName + business;

    MailApp.sendEmail({
      to: STUDIO_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      attachments: attachments
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      attachments: attachments.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'OK',
    service: 'AM Worx Intake',
    email: STUDIO_EMAIL
  })).setMimeType(ContentService.MimeType.JSON);
}

function buildEmailHtml(form, requestTime) {
  const LABELS = {
    full_name: 'Full Name',
    business_name: 'Business Name',
    client_email: 'Email',
    client_phone: 'Phone',
    domain: 'Domain Name',
    domain_idea: 'Domain Idea',
    hosting: 'Web Hosting',
    email: 'Business Email',
    email_count: 'Email Accounts',
    setup_help: 'Setup Assistance',
    business_desc: 'Business Description',
    website_type: 'Website Type',
    page: 'Pages',
    other_pages: 'Other Pages',
    feature: 'Features',
    logo: 'Logo Status',
    content_text: 'Text Content',
    content_photos: 'Photos',
    brand_colors: 'Brand Colors',
    inspiration_links: 'Inspiration Links',
    timeline: 'Timeline',
    maintenance: 'Maintenance',
    budget: 'Budget Range',
    extra_notes: 'Extra Notes',
    calculated_total: 'Estimated Total'
  };

  const SECTIONS = [
    ['Personal Information', ['full_name', 'business_name', 'client_email', 'client_phone']],
    ['Domain & Hosting', ['domain', 'domain_idea', 'hosting', 'email', 'email_count', 'setup_help']],
    ['Business Information', ['business_desc']],
    ['Website Type & Pages', ['website_type', 'page', 'other_pages']],
    ['Features', ['feature']],
    ['Design & Content', ['logo', 'content_text', 'content_photos', 'brand_colors', 'inspiration_links']],
    ['Timeline & Maintenance', ['timeline', 'maintenance']],
    ['Budget', ['budget', 'extra_notes']]
  ];

  function row(label, val) {
    return '<tr><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:500;width:40%;vertical-align:top">' +
      label + '</td><td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#1f2937;vertical-align:top">' +
      (val || '-') + '</td></tr>';
  }

  function section(title) {
    return '<tr><td colspan="2" style="padding:14px;background:#f3f4f6;font-weight:600;color:#1f2937;font-size:15px;border-bottom:1px solid #d1d5db">' +
      title + '</td></tr>';
  }

  let htmlRows = '';

  SECTIONS.forEach(function(s) {
    const title = s[0];
    const fields = s[1];
    let hasContent = false;
    let sectionHtml = '';

    fields.forEach(function(key) {
      const value = form[key];
      if (value && (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '')) {
        hasContent = true;
        const label = LABELS[key] || key;
        let display;
        if (Array.isArray(value)) {
          display = value.join(', ');
        } else if (key === 'calculated_total') {
          display = '$' + value;
        } else {
          display = String(value);
        }
        sectionHtml += row(label, display);
      }
    });

    if (hasContent) {
      htmlRows += section(title);
      htmlRows += sectionHtml;
    }
  });

  const totalRow = '<tr><td colspan="2" style="padding:14px;background:#1f2937;color:#ffffff;font-weight:600;font-size:16px;text-align:right">' +
    'Estimated Total: $' + (form.calculated_total || '0') + '</td></tr>';

  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#eef1f5;font-family:Inter,Arial,sans-serif">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:30px 0"><tr><td align="center">' +
    '<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">' +
    '<tr><td style="padding:28px 32px 8px;background:linear-gradient(135deg,#1e3a5f,#2d5a87)">' +
    '<h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600">New Website Request</h1>' +
    '<p style="margin:6px 0 0;color:#b8d4f0;font-size:13px">Submitted ' + requestTime + '</p>' +
    '</td></tr>' +
    '<tr><td style="padding:0">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;line-height:1.5">' +
    htmlRows +
    totalRow +
    '<tr><td colspan="2" style="padding:16px 24px;border-top:1px solid #e5e7eb;font-size:13px;color:#6b7280">' +
    'Sent via AM Worx Intake System - <a href="mailto:amworxx@gmail.com" style="color:#6b7280">amworxx@gmail.com</a>' +
    '</td></tr>' +
    '</table></td></tr>' +
    '</table></td></tr></table>' +
    '</body></html>';
}
```

### 2. Create the Apps Script project
1. Go to https://script.google.com → **New Project**
2. Name: `wp_intake_email_backend`
3. **Paste the entire code block above** (the complete Google Apps Script template)
4. **Save** (Ctrl+S)

### 3. Deploy as Web App
1. Deploy → **New deployment** → Web app
2. Settings:
   - **Description**: `AM Worx Intake Email Backend`
   - **Execute as**: Me (your Gmail)
   - **Who has access**: **Anyone**
3. Click **Deploy** → Authorize Gmail permissions
4. **Copy Web App URL** (e.g., `https://script.google.com/macros/s/AKfycbxukV12ZeIvnonSy2UmcklocL9-_9SlbYpP6arSi43ZW2dA7MZj-UgjHcaIkm0GYUp-Tw/exec`)

### 4. Test it works
Visit URL → should return JSON:
```json
{"status":"OK","service":"AM Worx Intake","email":"amworxx@gmail.com"}
```

### 5. Paste URL into `index.html`
```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxukV12ZeIvnonSy2UmcklocL9-_9SlbYpP6arSi43ZW2dA7MZj-UgjHcaIkm0GYUp-Tw/exec';
```

Commit, push. Done.

---

## Client fetch configuration
The form now POSTs to the Apps Script URL with **`text/plain`** content type. This avoids CORS preflight requests (which can hang in email clients' popup blockers) and can succeed even when the browser doesn't allow CORS reads.

If JSON is readable, great — the email sends. If CORS blocks reading, the Apps Script still sent the email, and the client displays a graceful "Submitted (status uncertain — check inbox)" message.

```javascript
const resp = await fetch(APPS_SCRIPT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: JSON.stringify(payload)
});

// Try to read JSON response; if CORS blocks it, still treat as success
const data = await resp.json().catch(() => ({ success: true, text_only: true }));
```

### CSS class renamed
In the HTML, rename this class:

```html
<!-- OLD: -->
<div class="attachment-email">
<!-- NEW: -->
<div class="attachment-email-status">
```

---

## Quotas and Limits

| Limit | Value |
|---|---|
| Email attachments per message | 25MB |
| Apps Script request body | 50MB |
| Consumer Gmail daily sends | 100 emails/day |
| Cost | $0 forever |

For a typical intake form, all limits are far beyond realistic usage.

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

---

## Admin Dashboard

The project includes **`admin/index.html`** — a passcode-protected dashboard that reads submissions from the same Google Sheet via GET requests to the Apps Script Web App.

### Setup

The dashboard works automatically once the Apps Script is deployed **with the latest `intake-email-backend.gs`** (which includes `saveToSheet()`, `doGet()`, `getOrCreateSheet_()`). No additional deployment needed.

### Access

1. Navigate to `https://amworx.github.io/wp_intaker/admin/`
2. Enter the default passcode: **`amworx2026`**
3. Change the passcode in `admin/index.html`:

```js
const ADMIN_PASSCODE = 'amworx2026'; // ← change this
```

### Features

| Feature | Description |
|---|---|
| **Login gate** | Simple passcode protection (stored client-side — for convenience, not security) |
| **Stats bar** | Total / New / Reviewed counts |
| **Submissions table** | Name, business, date, estimate, file count, status |
| **Search** | Filter by Name, Business, or Email (client-side) |
| **Detail modal** | Click any row to see every field in a slide-in panel |
| **Mark reviewed** | Toggle submissions between "New" and "Reviewed" |
| **Delete** | Remove submissions from the Sheet |
| **Auto-refresh** | Polls the Sheet every 60 seconds |

### API Endpoints (used by dashboard)

All calls go to the same Apps Script URL with a `?action=` parameter:

| Action | Method | Description |
|---|---|---|
| `?action=list` | GET | Returns all submissions as JSON `{ success, headers, rows }` |
| `?action=reviewed&index=N` | GET | Toggles the Status column between "New" and "Reviewed" |
| `?action=delete&index=N` | GET | Deletes the row at reversed index N |

The `index` parameter is 0-based and corresponds to position in the reversed array (newest first), which is how the dashboard displays them. The Apps Script converts it back to the correct sheet row internally.

### Google Sheet

The first time a submission arrives, a Sheet named **"AM Worx - Submissions"** is auto-created in your Google Drive. The Sheet ID is stored in `PropertiesService.getScriptProperties()` so subsequent calls append to the same sheet.

Columns (28 total):

```
Timestamp | Full Name | Business | Email | Phone | Domain | Domain Idea | Hosting | Business Email | Email Accounts | Setup Help | Description | Website Type | Pages | Other Pages | Features | Logo | Text Content | Photos | Brand Colors | Inspiration | Timeline | Maintenance | Budget | Extra Notes | Estimated Total | Files | Status
```

---

## Quick troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| 401 Unauthorized | Apps Script deployed as "Only myself" | Re-deploy with "Anyone" access |
| 404 Not Found | Old deployment URL | Re-deploy and copy latest URL |
| "Service invoked too many times" | Hit Gmail daily limit (100) | Resets at midnight Pacific |
| "Request contains too much data" | Total payload > 50MB | Compress files; reject large uploads client-side |
| HTML body shows raw HTML | Email client doesn't render HTML | Use Gmail (it does) |
| Files arrive as 0KB | base64 decoding error | Verify `Utilities.base64Decode` is called on raw base64 (no `data:` prefix) |
