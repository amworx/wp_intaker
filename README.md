# Website Survey — Client Intake Form

A self-contained, single-file website request form for **AM Worx Studio**. Collects client project details with live price estimation, then emails the submission summary.

## What it does
- **7-section survey**: Hosting/Domain, Business Info, Website Type & Pages, Features, Design & Content, Timeline & Maintenance, Budget
- **Live price estimate** — updates as the client fills out the form
- **Sticky price bar** — always visible as the client scrolls
- **Price breakdown modal** — detailed line-item cost breakdown
- **OTP email verification** — 6-digit code sent via EmailJS to verify client's email
- **File upload** — clients can upload logos, brand assets, or reference files
- **FormSubmit.co** — sends full submission to `amworxx@gmail.com`
- **EmailJS** — sends OTP codes + client confirmation emails (no activation emails to clients)
- **Summary display** — shows a full summary after submission with copy-to-clipboard
- **No build step** — single HTML file, ready to deploy

## Stack (all free)
| Concern | Tool |
|---|---|
| Hosting | GitHub Pages |
| Form receiver | FormSubmit.co (unlimited free, studio email) |
| OTP + client emails | EmailJS (200 free emails/month) |
| Design | Vanilla HTML / CSS / JS (no framework, no build) |
| Font | Inter (Google Fonts) |

## File layout
```
wp_intaker/
├── AGENTS.md
├── README.md
├── .gitignore
├── .nojekyll
├── index.html          ← single-file survey (at repo root for Pages)
├── docs/
│   └── field-coverage-report.md
├── memory/
├── plans/
└── tasks/
```

## Quick start
1. **FormSubmit** — Confirm your email at `https://formsubmit.co/amworxx@gmail.com` (one-time activation).
2. **EmailJS** — Sign up at [emailjs.com](https://www.emailjs.com/) (free), create:
   - An Email Service → copy **Service ID**
   - An OTP template (variables: `to_email`, `otp_code`, `from_name`) → copy **Template ID**
   - A client confirmation template (variables: `to_email`, `client_name`, `business_name`, `message`, `from_name`) → copy **Template ID**
   - Get your **Public Key** from Account → API Keys
3. **Configure `index.html`** — Update the 4 EmailJS values at the top of the JS section.
4. **Enable Pages** (Settings → Pages → source: `main`, folder: `/` (root)).
5. Share the Pages URL with clients.

## Pricing
Prices are embedded directly in the HTML `data-price` attributes and in the JS calculation engine. To update rates, edit:
- `data-price` attributes on each input in `index.html`
- JS logic in the `calculate()` function (~line 1428)

## Submission flow
1. Client enters their email and clicks **"Send Verification Code"**.
2. **EmailJS** sends a 6-digit OTP to the client's email (no activation required).
3. Client enters the code → email is **✓ Verified**.
4. Client fills out the rest of the 7-section survey.
5. Client clicks Submit.
6. **Studio email** — FormSubmit sends `amworxx@gmail.com` the full submission + uploaded files.
7. **Client email** — EmailJS sends a separate confirmation with a friendly overview.
8. A summary box appears on-screen with a "Copy to Clipboard" button as fallback.

## Notes
- All assets are self-contained in `index.html` (embedded CSS + JS). External dependencies: Google Font (Inter), EmailJS SDK.
- To use a custom domain, configure it in the GitHub Pages settings and update the `CNAME` file if needed.
