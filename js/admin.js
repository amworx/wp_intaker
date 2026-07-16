/* ============================================================
   wp_intaker — admin.js
   Reads + writes src/settings/settings.json via GitHub API.
   Token in localStorage. Fine-grained token recommended.
   ============================================================ */

const LS = {
  token: "github_pat",
  repo: "github_repo",
  settings: "cached_settings",
};

function el(id) { return document.getElementById(id); }

function toast(node, msg, ok = true) {
  node.textContent = msg;
  node.className = "toast " + (ok ? "ok" : "err");
  node.style.display = "block";
}

function loadLS() {
  return {
    token: localStorage.getItem(LS.token) || "",
    repo: localStorage.getItem(LS.repo) || "",
  };
}
function saveLS({ token, repo }) {
  localStorage.setItem(LS.token, token);
  localStorage.setItem(LS.repo, repo);
}

function base64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function deb64(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

/* Fetch current file to obtain SHA (required for updates) */
async function getFile({ owner, repo, path }) {
  const { token } = loadLS();
  const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=main`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!r.ok) throw new Error(`GET ${r.status}`);
  return await r.json(); // { sha, content, ... }
}

async function putFile({ owner, repo, path, message, content, sha }) {
  const { token } = loadLS();
  const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ message, content: base64(content), sha, branch: "main" }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.message || `PUT ${r.status}`);
  }
  return r.json();
}

/* Auth */
async function saveAuth() {
  const token = el("github-token").value.trim();
  const repo = el("github-repo").value.trim(); // owner/name
  if (!token || !repo) {
    toast(el("auth-hint"), "Both fields are required.", false);
    return;
  }
  // Quick validation: try to fetch repo root to ensure creds work
  const [owner, name] = repo.split("/");
  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error("Invalid repo or token.");
    saveLS({ token, repo });
    toast(el("auth-hint"), "Saved. Loading settings…", true);
    loadSettings();
  } catch (e) {
    toast(el("auth-hint"), e.message, false);
  }
}

async function loadSettings() {
  const { repo } = loadLS();
  if (!repo) return;
  const [owner, name] = repo.split("/");
  try {
    const data = await getFile({ owner, repo: name, path: "settings/defaults.json" });
    const json = deb64(data.content);
    const cfg = JSON.parse(json);
    localStorage.setItem(LS.settings, json);
    bindForm(cfg);
    showEditor(cfg);
  } catch (e) {
    toast(el("auth-hint"), "Could not load settings: " + e.message, false);
  }
}

function bindForm(cfg) {
  el("s-studio-name").value = cfg.studio.name || "";
  el("s-owner").value = cfg.studio.owner || "";
  el("s-email").value = cfg.studio.email || "";
  el("s-reply").value = cfg.studio.replyTime || "";
  el("s-primary").value = cfg.studio.brand.primary || "#2563eb";
  el("s-dark").value = cfg.studio.brand.dark || "#0f172a";
  el("s-base").value = cfg.pricing.base.amount ?? 1200;
  el("s-extra").value = cfg.pricing.perExtraPage.amount ?? 250;
  el("s-form-email").value = cfg.form.endpointEmail || cfg.studio.email || "";
  // Preview URL
  el("preview-url").textContent = window.location.origin.replace(/\/admin\/?$/, "/");
}

function showEditor(cfg) {
  ["editor", "editor2", "editor3", "preview"].forEach((id) => el(id).style.display = "");
}

async function saveSettings() {
  const { token, repo } = loadLS();
  if (!token || !repo) {
    toast(el("save-toast"), "Missing admin credentials.", false);
    return;
  }
  const [owner, name] = repo.split("/");
  try {
    const data = await getFile({ owner, repo: name, path: "settings/defaults.json" });
    const cfg = JSON.parse(deb64(data.content));

    cfg.studio.name = el("s-studio-name").value.trim();
    cfg.studio.owner = el("s-owner").value.trim();
    cfg.studio.email = el("s-email").value.trim();
    cfg.studio.replyTime = el("s-reply").value.trim();
    cfg.studio.brand.primary = el("s-primary").value.trim();
    cfg.studio.brand.dark = el("s-dark").value.trim();
    cfg.pricing.base.amount = parseInt(el("s-base").value, 10) || cfg.pricing.base.amount;
    cfg.pricing.perExtraPage.amount = parseInt(el("s-extra").value, 10) || cfg.pricing.perExtraPage.amount;
    cfg.form.endpointEmail = el("s-form-email").value.trim();
    cfg.form.endpoint = `https://formsubmit.co/${encodeURIComponent(cfg.form.endpointEmail)}`;

    const newContent = JSON.stringify(cfg, null, 2);
    await putFile({
      owner,
      repo: name,
      path: "settings/defaults.json",
      message: `chore: update settings via admin (${new Date().toISOString().slice(0, 10)})`,
      content: newContent,
      sha: data.sha,
    });

    localStorage.setItem(LS.settings, newContent);
    toast(el("save-toast"), "Saved. Refresh the public form to see changes.", true);
  } catch (e) {
    toast(el("save-toast"), "Save failed: " + e.message, false);
  }
}

/* Events */
el("save-auth").addEventListener("click", saveAuth);
el("save-settings").addEventListener("click", saveSettings);

/* Bootstrap */
(function boot() {
  const { token, repo } = loadLS();
  if (token && repo) {
    el("auth-hint").textContent = "Credentials found. Loading…";
    loadSettings();
  }
})();
