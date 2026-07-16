# Patterns

Append-only. Patterns emerge from repeated successes that should reduce future reasoning cost.

---

## PAT-20260716-0001 — Single Source of Truth (`settings.json`) for static apps

A static site that needs runtime configurability without a backend should keep all swappable values (pricing, text, branding) in a single JSON file at the repo root, fetched at startup, and re-rendered into the DOM via templates.

Why it works: zero infra; version-controlled via Git; trivially reproducible; works on every static host (GitHub Pages, Netlify, Cloudflare Pages).

## PAT-20260716-0002 — Two-recipient free email via FormSubmit `_cc`

FormSubmit.co supports `cc` field in the form payload. Build a separate hidden field per second recipient and populate at submit time from the form's collected email.

## PAT-20260716-0003 — Mini-admin saves via GitHub Contents API

For static-site admin that doesn't justify a backend, use the GitHub Contents API to PUT a single file. Token is fine-grained (contents:write scoped to one repo) and held in browser `localStorage`.

## PAT-20260716-0004 — Live cost calc as a pure function

Make `calculateEstimate(answers, settings)` a pure function with no DOM access. This makes it trivially unit-testable, share-exportable, and reusable in PDF generation, summary emails, and the dashboard preview.
