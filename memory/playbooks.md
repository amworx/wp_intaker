# Playbooks

Reusable step-by-step workflows. When a workflow becomes repeated, capture it here and reuse, don't re-derive.

---

## PB-0001 — Project Initialization

Trigger: user requests create / init / bootstrap / start a project.
Steps:
1. Ask for container folder name.
2. Ask for project name.
3. Construct project root = container + project name.
4. Validate (folder does not yet contain project name; confirm with user).
5. Ask 4–5 stack questions (lock decisions early).
6. Create:
   - `AGENTS.md`
   - `docs/`, `plans/`, `tasks/`
   - `memory/events.lessons.patterns.decisions.playbooks.md`
   - `src/` per stack decisions
7. Log EVT in `memory/events.md`.
8. Confirm completion summary.

## PB-0002 — Static Site Live Cost Calc (intent: `intake_form_build`)

Trigger: client asks to scope via survey.
Steps:
1. Read `src/settings/settings.json`.
2. Render form fields from `settings.fields`.
3. Wire `oninput` listeners that re-run `calculateEstimate(answers, settings.framework)`.
4. Render breakdown to `<aside id="estimate">`.
5. On submit:
   - Compose FormSubmit endpoint via `https://formsubmit.co/ajax/<owner_email>`.
   - Add hidden `cc` field = client email.
   - Add `_subject` and `_template` directives.
   - POST JSON body.

## PB-0003 — Admin Settings Save

Trigger: user clicks "Save Settings" in `/admin/index.html`.
Steps:
1. Validate token exists in `localStorage` (else redirect to "Set up GitHub token" view).
2. Read current settings from local store.
3. Build GitHub Contents API PUT payload (base64-encoded content, sha required for updates).
4. POST `https://api.github.com/repos/{owner}/{repo}/contents/{path}`.
5. Refresh local settings view; show toast.
