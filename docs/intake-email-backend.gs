/**
 * AM Worx Intake - Email Backend
 * Receives form submissions + file attachments and forwards to studio Gmail.
 */

const STUDIO_EMAIL = 'amworxx@gmail.com';

function doPost(e) {
  try {
    // Body may arrive as text/plain (preferred for browser CORS) or application/json.
    // Just parse the raw text - same JSON regardless of declared content-type.
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

/**
 * CORS preflight handler.
 * Browser fetches with non-simple Content-Type (application/json) send an
 * OPTIONS request first. Without this handler Apps Script returns 405 and
 * the browser cancels the actual POST. This returns 200 + CORS headers so
 * the real POST goes through.
 */
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
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
