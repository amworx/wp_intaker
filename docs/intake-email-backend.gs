/**
 * AM Worx Intake - Email Backend + Sheet Storage
 * 
 * Receives form submissions, forwards to studio Gmail WITH attachments,
 * AND stores every submission in a Google Sheet for the admin dashboard.
 *
 * On first run it auto-creates the Sheet.
 * You can find it in your Google Drive: "AM Worx - Submissions".
 */

const STUDIO_EMAIL = 'amworxx@gmail.com';
const SHEET_NAME = 'AM Worx - Submissions';

// ─── POST ───────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const raw = e.postData.contents;
    const data = JSON.parse(raw);
    const form = data.form || {};
    const files = data.files || [];
    const requestTime = data.request_time || new Date().toLocaleString();

    // 1. Build attachments and send email
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

    // 2. Store in Google Sheet
    try {
      saveToSheet(form, files, requestTime);
    } catch (sheetErr) {
      // Don't fail the response if sheet write fails
      console.warn('Sheet write failed:', sheetErr.message);
    }

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

// ─── GET ────────────────────────────────────────────────────────────────────
function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';

  // Admin: list submissions from Sheet
  if (action === 'list') {
    try {
      const ss = getOrCreateSheet_();
      const sheet = ss.getActiveSheet();
      const data = sheet.getDataRange().getValues();
      if (data.length < 2) {
        return jsonResponse({ success: true, headers: [], rows: [] });
      }
      const headers = data[0];
      const rows = data.slice(1).reverse(); // newest first
      return jsonResponse({ success: true, headers: headers, rows: rows });
    } catch (err) {
      return jsonResponse({ success: false, error: err.message });
    }
  }

  // Admin: delete a submission by row index
  if (action === 'delete') {
    try {
      const index = parseInt(e.parameter.index, 10);
      if (isNaN(index) || index < 0) throw new Error('Invalid index');
      const ss = getOrCreateSheet_();
      const sheet = ss.getActiveSheet();
      // index is 0-based from the reversed list on the client, so:
      // row in sheet = data.length - index
      const data = sheet.getDataRange().getValues();
      const rowNum = data.length - index; // +1 for header
      if (rowNum < 2) throw new Error('Row not found');
      sheet.deleteRow(rowNum);
      return jsonResponse({ success: true });
    } catch (err) {
      return jsonResponse({ success: false, error: err.message });
    }
  }

  // Admin: mark as reviewed
  if (action === 'reviewed') {
    try {
      const index = parseInt(e.parameter.index, 10);
      if (isNaN(index) || index < 0) throw new Error('Invalid index');
      const ss = getOrCreateSheet_();
      const sheet = ss.getActiveSheet();
      const data = sheet.getDataRange().getValues();
      const rowNum = data.length - index;
      if (rowNum < 2) throw new Error('Row not found');
      const lastCol = sheet.getLastColumn();
      const currentVal = sheet.getRange(rowNum, lastCol).getValue();
      sheet.getRange(rowNum, lastCol).setValue(currentVal === 'Reviewed' ? '' : 'Reviewed');
      return jsonResponse({ success: true });
    } catch (err) {
      return jsonResponse({ success: false, error: err.message });
    }
  }

  // Default: health check
  return jsonResponse({
    status: 'OK',
    service: 'AM Worx Intake'
  });
}

function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── SHEET STORAGE ──────────────────────────────────────────────────────────

function getOrCreateSheet_() {
  const props = PropertiesService.getScriptProperties();
  let sheetId = props.getProperty('SHEET_ID');

  if (!sheetId) {
    const ss = SpreadsheetApp.create(SHEET_NAME);
    sheetId = ss.getId();
    props.setProperty('SHEET_ID', sheetId);

    // Set up headers
    const sheet = ss.getActiveSheet();
    sheet.setFrozenRows(1);
    sheet.getRange('1:1').setFontWeight('bold');
    sheet.appendRow([
      'Timestamp', 'Full Name', 'Business', 'Email', 'Phone',
      'Domain', 'Domain Idea', 'Hosting', 'Business Email', 'Email Accounts', 'Setup Help',
      'Description',
      'Website Type', 'Pages', 'Other Pages',
      'Features',
      'Logo', 'Text Content', 'Photos', 'Brand Colors', 'Inspiration',
      'Timeline', 'Maintenance',
      'Budget', 'Extra Notes', 'Estimated Total',
      'Files', 'Status'
    ]);
  }

  return SpreadsheetApp.openById(sheetId);
}

function saveToSheet(form, files, requestTime) {
  const ss = getOrCreateSheet_();
  const sheet = ss.getActiveSheet();

  function get(key) { return form[key] || ''; }
  function all(key) {
    const v = form[key];
    if (v == null) return '';
    if (Array.isArray(v)) return v.join(', ');
    return String(v);
  }

  const fileNames = (files || []).map(function(f) { return f.name; }).join('; ');

  sheet.appendRow([
    requestTime,
    get('full_name'),
    get('business_name'),
    get('client_email'),
    get('client_phone'),
    get('domain'),
    get('domain_idea'),
    get('hosting'),
    get('email'),
    get('email_count'),
    get('setup_help'),
    get('business_desc'),
    get('website_type'),
    all('page'),
    get('other_pages'),
    all('feature'),
    get('logo'),
    get('content_text'),
    get('content_photos'),
    get('brand_colors'),
    get('inspiration_links'),
    get('timeline'),
    get('maintenance'),
    get('budget'),
    get('extra_notes'),
    get('calculated_total') ? '$' + get('calculated_total') : '',
    fileNames,
    'New'
  ]);
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── EMAIL HTML BUILDER ─────────────────────────────────────────────────────

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
