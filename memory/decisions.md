# Decisions

Append-only. Architecture & tooling decisions, with reasoning and rationale.

---

## DEC-20260716-0001 — Use vanilla HTML / CSS / JS, no framework

Reason: This is a single-purpose, ~3-page static site. A framework (React/Vue/Svelte) would add a build step, node_modules, and complexity without proportional value. Vanilla keeps the repo small, fast, and maintainable for 1 developer.

## DEC-20260716-0002 — Use FormSubmit.co as form receiver

Reason: Free tier is generous, supports `_cc` for 2-recipient emails, no signup, no API keys, just hit a URL endpoint. Alternative Formspree caps at 50/month on free tier.

Cost: zero.
Trade-off: relies on FormSubmit uptime; if it breaks we re-route to Formspree or self-host the form.

## DEC-20260716-0003 — Use GitHub Pages for hosting

Reason: Free, stable, free HTTPS, free subdomain route, easy to attach custom domain later. Good for low-traffic landing forms.

## DEC-20260716-0004 — Use jsPDF (CDN) for client-side PDF generation

Reason: Generates PDF on client; no server; no install. Email uses PDF preview + email body.

## DEC-20260716-0005 — `settings.json` as single source of truth

Reason: Lets a non-developer (you) tweak pricing and email text from `admin/`; the dashboard reads/writes this file via the GitHub API. Version control via Git means every change is auditable and reversible.

## DEC-20260716-0006 — Google Sheets as record store

Reason: Zero-infrastructure, free forever, easy to share/export. FormSubmit does not ship a Sheets adapter on free tier, so we'll wire one of these (apps-script route OR Zap-style free webhook — TBD in plan).
