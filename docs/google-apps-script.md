# Google Apps Script Email Backend

This guide shows how to deploy a free Google Apps Script that delivers intake form submissions (HTML email + file attachments) directly to **amworxx@gmail.com** via Gmail — 100% free, 25MB attachments per email.

**Why Apps Script over FormSubmit/EmailJS:**
- FormSubmit's `/ajax/` endpoint silently drops file attachments
- EmailJS free tier limits you to text-only emails (no attachments)
- Apps Script + Gmail = native support for HTML body + attachments
- No third-party service, no rate limits (100 emails/day consumer Gmail quota)

---

## Setup (10 minutes)

### 1. Open Apps Script
Go to https://script.google.com → **New Project**

Name the project: `wp_intake_email_backend`

### 2. Paste the code
Delete everything in `Code.gs` and paste this:

```javascript
/**
 * AM Worx Intake — Email Backend
 * Receives form submissions + file attachments and forwards to studio Gmail.
 */

const STUDIO_EMAIL = 'amworxx@gmail.com';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const form = data.form || {};
    const files = data.files || [];
    const requestTime = data.request_time || new Date().toLocaleString();

    // Build attachments from incoming base64 files
    const attachments = (files || []).map(function(f) {
      return Utilities.newBlob(
        Utilities.base64Decode(f.content),
        f.type || 'application/octet-stream',
        f.name
      );
    });

    // Build a human-readable HTML email body
    const htmlBody = buildEmailHtml(form, requestTime);

    // Subject line
    const fullName = form.full_name || 'Anonymous';
    const business = form.business_name ? ' — ' + form.business_name : '';
    const subject = 'New Website Request — ' + fullName + business;

    // Send via Gmail
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
  // Field labels (human-readable)
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

  // Section groupings
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
      (val || '—') + '</td></tr>';
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

  // Estimated Total (always show at the end)
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
    'Sent via AM Worx Intake System · <a href="mailto:amworxx@gmail.com" style="color:#6b7280">amworxx@gmail.com</a>' +
    '</td></tr>' +
    '</table></td></tr>' +
    '</table></td></tr></table>' +
    '</body></html>';
}
```

### 3. Save and Deploy
1. **Save** the file (Ctrl+S / Cmd+S).
2. Click **Deploy** → **New deployment**
3. Gear icon → select **Web app**
4. Settings:
   - **Description**: `AM Worx Intake Email Backend`
   - **Execute as**: Me (your Gmail address)
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
7. Click **Authorize access** when prompted and grant Gmail send permission.

### 4. Test the deployment
Visit the URL in your browser. You should see JSON:
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
| 401 Unauthorized | Apps Script deployed as "Only myself" | Re-deploy with "Anyone" access |
| 404 Not Found | Old deployment URL | Re-deploy and copy latest URL |
| "Service invoked too many times" | Hit Gmail daily limit (100) | Resets at midnight Pacific |
| "Request contains too much data" | Total payload > 50MB | Compress files; reject large uploads client-side |
| HTML body shows raw HTML | Email client doesn't render HTML | Use Gmail (it does) |
| Files arrive as 0KB | base64 decoding error | Verify `Utilities.base64Decode` is called on raw base64 (no `data:` prefix) |
