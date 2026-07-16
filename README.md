# wp_intaker

A 100% free, static, client-facing business intake form for a WordPress + opencode studio.

## What it does
- Public survey link (hosted on GitHub Pages).
- Live cost estimate updates as the client answers.
- On submit, automatically emails you + the client a PDF estimate.
- Stores every response in Google Sheets (free integration).
- A password-protected `/admin/` page lets you tweak pricing rules and email copy without editing code.

## Stack (all free)
| Concern | Tool |
|---|---|
| Hosting | GitHub Pages |
| Form receiver | FormSubmit.co (unlimited free, supports `_cc`) |
| Records | Google Sheets |
| PDF | jsPDF (CDN) |
| Admin saves | GitHub Contents API |

## File layout
```
wp_intaker/
├── AGENTS.md
├── README.md
├── .gitignore
├── docs/
├── plans/
├── tasks/
├── memory/
├── index.html          # public survey (at repo root for Pages)
├── admin/
│   └── index.html      # mini-dashboard
├── css/
│   └── style.css
├── js/
│   ├── app.js          # survey logic + cost engine + PDF
│   └── admin.js        # dashboard read/write settings.json
└── settings/
    └── defaults.json   # initial pricing rules + studio profile
```

## Quick start
1. Open `settings/defaults.json` and replace placeholder studio name/email with yours. (Optional: do this via `/admin/` instead.)
2. Confirm your email at `https://formsubmit.co/YOUR_EMAIL` (one-time FormSubmit activation).
3. To use `/admin/`, generate a GitHub PAT (Settings → Developer Settings → Personal access tokens → Fine-grained → Contents: Write → scope to this repo only), then store it in the admin page.
4. Enable Pages (Settings → Pages → source: `main`, folder: `/` (root)).

## Cost calculation
The pricing engine is a single pure function in `js/app.js` — `calculateEstimate(answers, settings)`. Pricing rules live in `settings.json` so you can tune them without touching JS.

## Notes
- All third-party deps loaded via public CDN. There is no `node_modules`.
- Source of truth is `settings.json`. Source HTML and JS reference values via the loader.
