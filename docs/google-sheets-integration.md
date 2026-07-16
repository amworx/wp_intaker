# Google Sheets Records Integration

This file explains how every submission gets a row in Google Sheets for free, no paid automation tool required.

## Recommended: FormSubmit → Google Apps Script Web App (free, no 3rd party)

### Step 1 — Create a Google Sheet
- New Google Sheet named `wp_intaker submissions`.
- First row headers (suggested):
  `Timestamp, Business, Name, Email, Phone, Site type, Pages, Features, Addons, Budget, Visitors, Launch date, Estimated total, Form answers (JSON)`

### Step 2 — Create an Apps Script bound to the sheet
- In the Sheet → Extensions → Apps Script.
- Replace the default `Code.gs` with the following:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = e.postData.type === "application/json" ? JSON.parse(e.postData.body) : e.parameter;

  const row = [
    new Date().toISOString(),
    data.business_name || "",
    data.client_name || "",
    data.client_email || "",
    data.client_phone || "",
    data.site_type || "",
    data.pages_estimate || "",
    (data.features || []).join(", "),
    (data.addons || []).join(", "),
    data.budget_range || "",
    data.visitors_estimate || "",
    data.launch_date || "",
    "", // total cannot be computed server-side unless you port the pricing rule; leave blank or estimate in a separate column via formula
    JSON.stringify(data),
  ];

  sheet.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
```

- Save project as `wp-intaker-ingest`.
- Deploy → Manage deployments → New deployment.
- Type: Web app.
- Execute as: Me.
- Who has access: Anyone (this is the public endpoint URL).
- Copy the **Web app URL**.

### Step 3 — Point FormSubmit at your Apps Script URL
In `settings/defaults.json`, change:
```
"endpoint": "https://formsubmit.co/your-email@example.com"
```
to:
```
"endpoint": "https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec"
```
Then in `admin/` (or edit JSON directly), set:
- `ownerEmail`: your email (for the `_cc` fallback email if you still want FormSubmit to handle duplicate emailing).
- OR handle email outbound in Apps Script using `MailApp.sendEmail` if you want zero FormSubmit dependency.

### FormSubmit alternative (simpler, if column limit OK)
- In FormSubmit dashboard, enable the Google Sheets integration (add-on style).
- FormSubmit writes a row per submission.
- Free tier works but you have less control over column structure.

## Notes
- `doPost` Apps Script endpoint has a 6-minute timeout; our payload is tiny, so fine.
- The sheet URL itself is private (Google login required) — treat it like your records DB.
- If GitHub API rate-limits your admin dashboard, the scripts here still work offline via direct JSON edit + git push.
