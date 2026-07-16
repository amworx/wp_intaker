/* ============================================================
   wp_intaker — app.js
   Survey rendering, live cost calc, FormSubmit POST, jsPDF
   ============================================================ */

const SETTINGS_URL = "settings/defaults.json";
const FORM_ENDPOINT_TPL = (email) => `https://formsubmit.co/${encodeURIComponent(email)}`;

let settings = null;
const answers = {};

/* ── Helpers ────────────────────────────────────────────── */
function q(id) { return document.getElementById(id); }
function show(id) { q(id).classList.remove("hidden"); }
function hide(id) { q(id).classList.add("hidden"); }

function template(str, data) {
  return str.replace(/\{\{(\w+(\.\w+)*)\}\}/g, (_, path) => {
    const val = path.split(".").reduce((o, k) => (o || {})[k], data);
    return val !== undefined ? val : "";
  });
}

/* ── Cost engine (pure) ─────────────────────────────────── */
function calculateEstimate(ans, cfg) {
  const p = cfg.pricing;
  let lines = [];
  let total = 0;

  const basePages = 5;
  const pageCountString = ans.pages_estimate || "3–5";
  let pageCount = basePages;
  if (pageCountString === "1–2") pageCount = 2;
  else if (pageCountString === "3–5") pageCount = 5;
  else if (pageCountString === "6–10") pageCount = 10;
  else if (pageCountString === "11–20") pageCount = 15;
  else if (pageCountString === "20+") pageCount = 25;

  const baseLine = { label: p.base.label, amount: p.base.amount, type: "base" };
  lines.push(baseLine);
  total += p.base.amount;

  const extraPages = Math.max(0, pageCount - basePages);
  if (extraPages > 0) {
    const line = { label: `${extraPages} extra page${extraPages>1?"s":""}`, amount: extraPages * p.perExtraPage.amount, type: "page" };
    lines.push(line);
    total += line.amount;
  }

  const selectedFeatures = Array.isArray(ans.features) ? ans.features : [];
  selectedFeatures.forEach((fid) => {
    const feat = p.features.find((f) => f.id === fid);
    if (!feat) return;
    let count = 1;
    if (feat.type === "per_item") {
      if (fid === "multilang") count = Math.min(Math.max(parseInt(ans.multilang_count) || 1, 1), feat.max || 3);
      else if (fid === "maintenance_monthly") count = Math.min(Math.max(parseInt(ans.monthly_maintenance_months) || 1, 1), feat.max || 12);
    }
    const amount = feat.amount * count;
    const label = count > 1 ? `${feat.label} (×${count})` : feat.label;
    lines.push({ label, amount, type: "feature", id: fid, count });
    total += amount;
  });

  const selectedAddons = Array.isArray(ans.addons) ? ans.addons : [];
  selectedAddons.forEach((aid) => {
    const addon = p.addons.find((a) => a.id === aid);
    if (!addon) return;
    let count = 1;
    if (addon.type === "per_item") {
      if (aid === "copywriting") count = Math.min(Math.max(pageCount, 1), addon.max || 20);
      else if (aid === "maintenance_monthly") count = Math.min(Math.max(parseInt(ans.monthly_maintenance_months || "1"), 1), addon.max || 12);
    }
    const amount = addon.amount * count;
    const label = count > 1 ? `${addon.label} (×${count})` : addon.label;
    lines.push({ label, amount, type: "addon", id: aid, count });
    total += amount;
  });

  return { lines, total };
}

function renderedEstimateHTML(est) {
  if (!settings || !settings.pricing.showEstimate) return "";
  if (!est || est.lines.length === 0) return "<p>Answer a few questions to see your estimate.</p>";
  const fmt = (n) => `$${n.toLocaleString()}`;
  const rows = est.lines
    .map((l) => `<div class="line"><span>${l.label}</span><span>${fmt(l.amount)}</span></div>`)
    .join("");
  return `
    ${rows}
    <div class="line total"><span>Estimated range</span><span>$${est.total.toLocaleString()}</span></div>
    <p class="note">This is a guideline, not a fixed quote. Final price depends on content complexity, revisions, and timeline.</p>
    <div class="hosting">
      <strong>Hostinger plan:</strong>
      <ul style="margin:6px 0 0 18px; padding:0; color:var(--color-muted);">
        ${recommendedHostingHTML(settings.pricing.hostinger.tiers)}
      </ul>
    </div>
  `;
}

function recommendedHostingHTML(tiers) {
  // pick the cheapest tier that fits nothing — show all
  return tiers
    .map(
      (t) =>
        `<li><strong>${t.name}</strong> — $${t.monthly}/mo • ${t.storage} • ${t.bandwidth} • ${t.emails} email accounts</li>`
    )
    .join("");
}

/* ── Form rendering ─────────────────────────────────────── */
function renderSections() {
  const sectionsByGroup = {};
  Object.entries(settings.form.fields).forEach(([fid, f]) => {
    const sid = f.section;
    (sectionsByGroup[sid] ||= []).push({ fid, ...f });
  });

  const container = q("sections");
  const list = settings.form.sections.map((s, idx) => {
    const fields = (sectionsByGroup[s.id] || [])
      .map(({ fid, type, label, required, options, showIf, help, placeholder, min, max, default: def }) => {
        const req = required ? '<span class="required">*</span>' : "";
        const helpHTML = help ? `<small class="help">${help}</small>` : "";
        let control = "";

        if (type === "text" || type === "email" || type === "url" || type === "tel") {
          control = `<input type="${type}" id="field-${fid}" name="${fid}" placeholder="${placeholder || ""}" ${required ? "required" : ""} />`;
        } else if (type === "number") {
          control = `<input type="number" id="field-${fid}" name="${fid}" min="${min ?? 0}" max="${max ?? 9999}" value="${def ?? 0}" ${required ? "required" : ""} />`;
        } else if (type === "textarea") {
          control = `<textarea id="field-${fid}" name="${fid}" rows="3" placeholder="${placeholder || ""}" ${required ? "required" : ""}></textarea>`;
        } else if (type === "select") {
          const opts = (options || []).map((o) => `<option value="${o}">${o}</option>`).join("");
          control = `<select id="field-${fid}" name="${fid}" ${required ? "required" : ""}><option value="">Choose…</option>${opts}</select>`;
        } else if (type === "checkbox") {
          const items = (options || []).map((o) => {
            const val = typeof o === "string" ? o : o.value;
            const labelText = typeof o === "string" ? o : o.label;
            const sub = typeof o !== "string" && o.desc ? `<small>${o.desc}</small>` : "";
            return `
              <label class="check-item">
                <input type="checkbox" name="${fid}" value="${val}" />
                <span class="check-label">${labelText}${sub}</span>
              </label>`;
          }).join("");
          control = `<div class="check-group" id="field-${fid}">${items}</div>`;
        }

        const visCond = showIf ? ` data-show-if='${JSON.stringify(showIf)}'` : "";
        return `
          <div class="field" id="wrap-${fid}"${visCond}>
            <label for="field-${fid}">${label}${req}</label>
            ${control}
            ${helpHTML}
          </div>`;
      })
      .join("");

    return `
      <div class="section">
        <h2><span class="step">${idx + 1}</span> ${s.label}</h2>
        ${fields}
      </div>`;
  }).join("");

  container.innerHTML = list;

  // Wire events
  document.querySelectorAll("#sections input, #sections select, #sections textarea").forEach((el) => {
    el.addEventListener("input", onFieldChange);
    el.addEventListener("change", onFieldChange);
  });
}

function onFieldChange() {
  collectAnswers();
  refreshEstimate();
  applyVisibility();
}

function collectAnswers() {
  const fields = settings.form.fields;
  Object.keys(fields).forEach((fid) => {
    const f = fields[fid];
    const el = q(`field-${fid}`);
    if (!el) return;
    if (f.type === "checkbox") {
      answers[fid] = Array.from(el.querySelectorAll('input:checked')).map((i) => i.value);
    } else {
      answers[fid] = el.value.trim();
    }
  });
}

function refreshEstimate() {
  const est = calculateEstimate(answers, settings);
  q("estimate-body").innerHTML = renderedEstimateHTML(est);
}

/* ── Show/hide conditional fields ───────────────────────── */
function applyVisibility() {
  document.querySelectorAll("[data-show-if]").forEach((wrap) => {
    const { field, equals, contains } = JSON.parse(wrap.dataset.showIf);
    let show = false;
    if (equals !== undefined) show = answers[field] === equals;
    else if (contains !== undefined) show = (answers[field] || []).includes(contains);
    wrap.style.display = show ? "" : "none";
  });
}

/* ── Submit & PDF ───────────────────────────────────────── */
function buildFormPayload() {
  const payload = new URLSearchParams();
  Object.entries(answers).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((item) => payload.append(k, item));
    else payload.append(k, v || "");
  });

  const owner = settings.studio.email;
  const client = answers.client_email || "";
  payload.append("_subject", `New project inquiry — ${answers.business_name || "Client"}`);
  payload.append("_cc", client);
  payload.append("_template", "table");
  payload.append("_captcha", "false");
  payload.append("_next", window.location.href);

  return payload;
}

function generatePDF(answers, est) {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const M = 50;
    let y = 60;

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(settings.studio.name, M, y);
    y += 22;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Project estimate — generated ${new Date().toLocaleDateString()}`, M, y);
    y += 20;

    doc.setDrawColor(226, 232, 240);
    doc.line(M, y, W - M, y);
    y += 18;

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("Client", M, y); y += 16;
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Name: ${answers.client_name || ""}`, M + 10, y); y += 14;
    doc.text(`Email: ${answers.client_email || ""}`, M + 10, y); y += 14;
    if (answers.client_phone) { doc.text(`Phone: ${answers.client_phone}`, M + 10, y); y += 14; }

    y += 10;
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("Project summary", M, y); y += 16;
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const brief = [
      `Type: ${answers.site_type || "—"}`,
      `Pages: ${answers.pages_estimate || "—"}`,
      `Budget: ${answers.budget_range || "—"}`,
      `Launch: ${answers.launch_date || "—"}`,
      `Visitors: ${answers.visitors_estimate || "—"}`,
    ];
    brief.forEach((t) => { doc.text(t, M + 10, y); y += 14; });

    if ((answers.features || []).length) {
      doc.text(`Features: ${(answers.features || []).join(", ")}`, M + 10, y);
      y += 14;
    }
    if ((answers.addons || []).length) {
      doc.text(`Add-ons: ${(answers.addons || []).join(", ")}`, M + 10, y);
      y += 14;
    }

    y += 10;
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("Estimate breakdown", M, y); y += 16;
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    (est.lines || []).forEach((l) => {
      doc.text(`${l.label}: $${l.amount.toLocaleString()}`, M + 10, y);
      y += 14;
    });
    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(M + 10, y, W - M - 10, y);
    y += 14;
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(`Estimated total: $${(est.total || 0).toLocaleString()}`, M + 10, y);

    doc.save(`estimate-${(answers.business_name || "client").replace(/[^a-z0-9]+/gi, "-")}.pdf`);
  } catch (e) {
    console.warn("PDF generation failed", e);
  }
}

async function submitForm(e) {
  e.preventDefault();
  collectAnswers();
  const submitBtn = q("intake").querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting…";

  const endpoint = FORM_ENDPOINT_TPL(settings.form.endpointEmail || settings.studio.email);
  const payload = buildFormPayload();

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: payload,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const est = calculateEstimate(answers, settings);
    generatePDF(answers, est);

    alert("Thanks! We received your answers. A copy of your estimate has been downloaded, and we'll email you at " + (answers.client_email || "your email") + ".");
    // Redirect to thanks-like state
    q("intake").innerHTML = `<div class="section"><h2>Submitted ✓</h2><p>We'll be in touch ${settings.studio.replyTime}. Check your inbox for a copy of your estimate PDF.</p></div>`;
    hide(q("estimate"));
  } catch (err) {
    console.error(err);
    alert("Submission failed. Please email us directly at " + settings.studio.email);
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit my answers →";
  }
}

/* ── Bootstrap ──────────────────────────────────────────── */
async function init() {
  try {
    const res = await fetch(SETTINGS_URL + "?v=" + Date.now());
    if (!res.ok) throw new Error("settings fetch failed");
    settings = await res.json();

    // apply studio name + brand to shell
    document.title = template("Project Intake — {{studio.name}}", settings);
    q(".logo").textContent = settings.studio.name;
    document.documentElement.style.setProperty("--color-primary", settings.studio.brand.primary);
    document.documentElement.style.setProperty("--color-dark", settings.studio.brand.dark);
    document.documentElement.style.setProperty("--color-light", settings.studio.brand.light);

    renderSections();
    refreshEstimate();
    hide(q("loading"));
    show(q("app"));

    q("intake").addEventListener("submit", submitForm);
  } catch (e) {
    console.error(e);
    hide(q("loading"));
    show(q("error"));
  }
}

init();
