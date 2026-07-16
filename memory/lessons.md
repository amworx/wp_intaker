# Lessons Learned

Append-only. Each lesson includes: problem, root cause, fix, prevention rule, severity.

---

## LES-20260716-0001 — Avoid hardcoding studio identity in code

- Problem: Tempting to write studio name, email, logo URL directly into HTML/JS.
- Root cause: Lookups by future you or new collaborators would feel lost.
- Fix: All identity + pricing lives in `src/settings/settings.json`. HTML templates pull by key.
- Prevention: When writing UI code, never inline a string that smells like a brand property; look it up via `settings.json`.
- Severity: low

## LES-20260716-0002 — Costs of free-tier SaaS reliance

- Problem: Many "free" survey tools cap recipients (only 1 notification email on the free tier).
- Root cause: Most form SaaS aligns free plans to lead-capture (you only) and gates client-facing copy.
- Fix: FormSubmit.co is unlimited and supports `_cc`, which is what this project uses.
- Prevention: Before adopting a free SaaS for two-way email, verify with documentation that the free tier allows `cc` to a second recipient.
- Severity: medium

## LES-20260716-0003 — Admin security trade-off when using GitHub API

- Problem: A mini-dashboard that saves to a repo via API needs an access token.
- Root cause: Static sites cannot hold a server secret.
- Fix: Token lives in browser `localStorage` and is fine-grained (only `Contents: Write` on this repo).
- Prevention: Document this trade-off in `docs/admin-security.md` so future-you understands the threat model (acceptable for solo studio use; NOT for multi-user teams).
- Severity: medium
