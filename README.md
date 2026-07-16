# Website Survey — Client Intake Form

A self-contained, single-file website request form for **AM Worx Studio**. Collects client project details with live price estimation, then emails the submission summary.

## What it does
- **7-section survey**: Hosting/Domain, Business Info, Website Type & Pages, Features, Design & Content, Timeline & Maintenance, Budget
- **Live price estimate** — updates as the client fills out the form
- **Sticky price bar** — always visible as the client scrolls
- **Price breakdown modal** — detailed line-item cost breakdown
- **FormSubmit.co integration** — sends submission to `amworxx@gmail.com` + CC's the client
- **Summary display** — shows a full summary after submission with copy-to-clipboard
- **No build step** — single HTML file, ready to deploy

## Stack (all free)
| Concern | Tool |
|---|---|
| Hosting | GitHub Pages |
| Form receiver | FormSubmit.co (unlimited free, supports `_cc`) |
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
├── memory/
│   ├── events.md
│   ├── lessons.md
│   ├── patterns.md
│   ├── decisions.md
│   └── playbooks.md
├── plans/
└── tasks/
```

## Quick start
1. Confirm your email at `https://formsubmit.co/amworxx@gmail.com` (one-time FormSubmit activation — check your inbox for the confirmation email).
2. Enable Pages (Settings → Pages → source: `main`, folder: `/` (root)).
3. Share the Pages URL with clients.

## Pricing
Prices are embedded directly in the HTML `data-price` attributes and in the JS calculation engine. To update rates, edit:
- `data-price` attributes on each input in `index.html`
- JS logic in the `calculate()` function (~line 1186)

## Submission flow
1. Client fills out the survey and clicks Submit.
2. **Studio email** — FormSubmit sends `amworxx@gmail.com` the full detailed submission with all answers + pricing.
3. **Client email** — A separate confirmation email is sent to the client (friendly summary, no pricing details).
4. A summary box appears on-screen with a "Copy to Clipboard" button as fallback.

## Notes
- All assets are self-contained in `index.html` (embedded CSS + JS). No external dependencies except the Google Font (Inter).
- To use a custom domain, configure it in the GitHub Pages settings and update the `CNAME` file if needed.
