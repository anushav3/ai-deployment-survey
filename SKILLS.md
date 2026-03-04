# AI Security Survey — Architecture & Skills Log

## Project Architecture

### File Storage
- **Google Drive** (`My Drive/career/startup/AI-Security/`) — local working directory
- **GitHub repo** (`anushav3/ai-deployment-survey`) — public repo, auto-deploys to Vercel on push to `main`

### Survey Files
| File | Purpose |
|---|---|
| `index.html` | **Single source of truth** — full multi-step survey (15 slides: 0=welcome, 1–13=questions, 14=name/email/company, 15=thank-you). Always edit only this file. |
| `server.js` | Local Node.js dev server only — gitignored, not used in production |
| `package.json` | Node.js project manifest, declares `@vercel/blob` dependency |
| `api/submit.js` | POST /api/submit → saves response as `responses/{id}.json` in Vercel Blob (`access: 'public'`) |
| `api/export.js` | GET /api/export?token=TOKEN → downloads all responses as UTF-8 BOM CSV. Protected by `EXPORT_TOKEN` env var. |
| `api/count.js` | GET /api/count → lists `responses/` prefix in Blob (used for response counter on thank-you slide) |
| `api/email.js` | POST /api/email → saves email opt-ins (legacy, kept for reference) |
| `RESPONSE_SAVE_README.md` | Local only (gitignored) — export curl command with token, column docs |
| `survey-responses.csv` | Local only (gitignored) — last downloaded CSV export |

> ⚠️ **Rule: Always edit only `index.html`.**
> One HTML file only — no duplicates.

---

## Deployment

- **Live URL:** `https://ai-deployment-survey.vercel.app` (Vercel — frontend + backend)
- **CI/CD:** Push to `main` → GitHub → Vercel auto-deploys (no `vercel` CLI needed)
- **Blob store:** `ai-deployment-survey-blob` (Public store) — store ID `store_yJUOdLaf7O5sOPvv`
- **Blob security:** Individual blob URLs are non-guessable (random hash). Export endpoint protected by `EXPORT_TOKEN` env var. Private blobs not supported on public store — do not attempt.
- **Env vars on Vercel:** `BLOB_READ_WRITE_TOKEN`, `EXPORT_TOKEN`

### Downloading responses (local only)
```bash
curl -s "https://ai-deployment-survey.vercel.app/api/export?token=<EXPORT_TOKEN>" -o survey-responses.csv
```
Token is in `RESPONSE_SAVE_README.md` (local, gitignored).

---

## Survey Structure — 15 Slides

| Slide | ID | Content |
|---|---|---|
| 0 | Welcome | Title, stats (73%/13 questions/100% confidential), Start button, terms note |
| 1 | Q1 | Role (chip select — single) |
| 2 | Q2 | Company size (option card — single, auto-advance) |
| 3 | Q3 | Industry (option card — single, auto-advance) |
| 4 | Q4 | AI journey stage (option card — single, auto-advance) |
| 5 | Q5 | Projects stuck (option card — single, auto-advance) |
| 6 | Q6 | Top 3 blockers (drag-drop tray — `clickToSelect`, max 3) |
| 7 | Q7 | Who decides AI budget (option card — single, auto-advance) |
| 8 | Q8 | How do you test AI before production (multi-select, min 1, Next button) |
| 9 | Q9 | Compliance/security driver (option card — single, auto-advance) |
| 10 | Q10 | Tools used (drag-drop tray — `clickToSelect`, max 6) |
| 11 | Q11 | AI/security budget (option card — single, auto-advance) |
| 12 | Q12 | Leadership sentiment (option card — single, auto-advance) |
| 13 | Q13 | Open-ended free text (textarea, mandatory) |
| 14 | Details | Full name (optional), Company (optional), Work email (mandatory — work only) |
| 15 | Thank you | Confirmation, share buttons, response counter, "Built by AI Readiness Lab" |

### Q8 — Testing Method Options (multi-select, A–H)
- A: Synthetic / generated test data
- B: In-house manually labelled datasets
- C: Real user data in a staging environment
- D: A/B testing or canary releases in production
- E: Red-teaming / adversarial prompt testing
- F: External QA or third-party evaluation
- G: LLM-as-a-judge / automated AI evaluation
- H: Winging it — no formal testing process yet

---

## CSV Export Schema

Columns in order:
```
id, timestamp, name, company, email,
q1_role, q2_company_size, q3_industry, q4_ai_journey,
q5_projects_stuck,
q6_blocker_1, q6_blocker_2, q6_blocker_3,
q7_decision_maker,
q8_testing_method_1, q8_testing_method_2, q8_testing_method_3,
q9_compliance_driver,
q10_tool_1, q10_tool_2, q10_tool_3, q10_tool_4, q10_tool_5, q10_tool_6,
q11_budget, q12_leadership_sentiment, q13_open_ended
```

- **Timestamp:** Friendly PST format e.g. `Mar 4, 2026, 9:37 AM PST` (via `America/Los_Angeles` timezone)
- **Q6, Q8, Q10:** Multi-answer fields stored as separate numbered columns (not a single comma-joined cell)

---

## Email Validation (slide 14)

- Format: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Blocked personal domains:** gmail.com, googlemail.com, yahoo.com (+ country variants), hotmail.com (+ variants), outlook.com, live.com, msn.com, aol.com, aim.com, icloud.com, me.com, mac.com, protonmail.com, pm.me, mail.com
- Error toast: *"Please use a work email — Gmail, Yahoo & Hotmail are not accepted"*

---

## Terms / Privacy (slide 0 & slide 15)

- **Welcome slide:** Small note below Start button — individual responses strictly confidential, only anonymized aggregate findings published once sufficient responses collected.
- **Thank-you slide:** Same message woven into confirmation copy, no specific response count mentioned.

---

## Input Interaction Patterns

| Pattern | Used for | Behaviour |
|---|---|---|
| `selectChip(qId, el)` | Q1 role | Toggle chip highlight, store value, no auto-advance |
| `selectSingle(qId, el)` | Q2–Q5, Q7, Q9, Q11, Q12 | Highlight card, store value, auto-advance after 300ms |
| `selectMulti(qId, el, max)` | Q8 | Toggle option, badge counter, Next button required |
| `clickToSelect(qId, el, max)` | Q6 (max 3), Q10 (max 6) | Drag-drop tray style, moves to selected tray |

### Keyboard Shortcuts
- **Enter / Space:** advance slide (all slides)
- **Letter keys (A–H):** single-select shortcut for slides `[2, 3, 4, 5, 7, 9, 11, 12]` — Q8 excluded (multi-select)
- **Backspace:** previous slide

---

## What Has Been Tried & Failed — Do Not Retry

| Approach | Why it failed |
|---|---|
| GitHub Contents API (PAT in HTML) | Token publicly visible in source, security risk |
| Google Apps Script web app | Did not work — do not attempt |
| Vercel KV | Deprecated by Vercel late 2024 |
| Vercel Blob `access: 'private'` | Not supported on public store — breaks all submissions with HTTP 400 |
| `Authorization: Bearer` header on blob fetch | Unnecessary (blobs are public URLs), breaks fetch |
| `vercel --prod` CLI deploy | Token not persisted locally — use git push instead |

---

## Purging Responses (when needed)

Create temporary `api/purge.js`, deploy, call, then delete and redeploy:

```js
const { list, del } = require('@vercel/blob');
module.exports = async function handler(req, res) {
  if (req.query.token !== process.env.EXPORT_TOKEN) return res.status(401).end();
  const { blobs } = await list({ prefix: 'responses/' });
  await Promise.all(blobs.map(b => del(b.url)));
  res.json({ deleted: blobs.length });
};
```
```bash
curl "https://ai-deployment-survey.vercel.app/api/purge?token=<EXPORT_TOKEN>"
```
