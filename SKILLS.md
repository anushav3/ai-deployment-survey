# AI Security Survey — Architecture & Skills Log

## Project Architecture

### File Storage
- **Google Drive** (`My Drive/career/startup/AI-Security/`) — local working directory, synced via Google Drive desktop
- **GitHub repo** (`anushav3/ai-deployment-survey`) — source of truth, deployed via GitHub Pages

### Survey Files
| File | Purpose |
|---|---|
| `ai-deployment-survey.html` | Main multi-step survey form (13 questions, custom JS/CSS) |
| `index.html` | Landing page, also serves the survey on GitHub Pages root |
| `server.js` | Local Node.js server — saves responses to `responses.csv`, emails to `emails.csv` |
| `package.json` | Node.js project manifest, declares `@vercel/blob` dependency |
| `api/submit.js` | Vercel serverless function — POST /api/submit → saves response as `responses/{id}.json` in Blob |
| `api/email.js` | Vercel serverless function — POST /api/email → saves email as `emails/{id}.json` in Blob |
| `api/count.js` | Vercel serverless function — GET /api/count → lists `responses/` prefix in Blob |
| `survey-responses.json` | Legacy — from a previous storage approach, no longer written to |
| `survey-emails.json` | Legacy — from a previous storage approach |
| `responses.csv` | Local response storage (written by `server.js`) |

### Deployment
- **Frontend:** GitHub Pages → `https://anushav3.github.io/ai-deployment-survey/`
- **CI/CD:** `.github/workflows/static.yml` — deploys on push to `main`
- **Backend (local only):** `node server.js` → `http://localhost:3000`
- **Backend (Vercel — in progress):** `api/*.js` serverless functions + Vercel Blob storage

---

## Form Submission — What Has Been Tried

### ❌ GitHub Contents API (removed — security risk + cost)
- Survey HTML was POSTing responses directly to GitHub via the Contents API
- Required a GitHub PAT hardcoded in the client-side HTML
- Token was publicly visible to anyone who viewed page source
- **Only works on public repos** — private repo requires a paid GitHub plan
- **Removed:** PAT revoked, all GitHub API code stripped from `ai-deployment-survey.html`

### ❌ Google Apps Script web app
- Attempted as a serverless backend to receive POST requests and write to Google Sheets
- **Did not work — do not attempt again**

### ✅ Local server (`server.js`)
- `node server.js` runs on `http://localhost:3000`
- Survey POSTs to `/api/submit` → appends row to `responses.csv`
- Email opt-in POSTs to `/api/email` → appends row to `emails.csv`
- Works for local testing only — not accessible publicly

---

## Free Public Hosting

Need a free, always-on host so the deployed survey can save responses publicly.

### Options evaluated
| Option | Status | Notes |
|---|---|---|
| **Vercel** | 🔄 In progress | Serverless functions in `/api/*.js`, Vercel Blob for storage. Each response = one JSON file. KV deprecated — do not use. |
| **Render** | Not tried | Free Node.js hosting, filesystem is ephemeral (CSV resets on redeploy) |
| **Railway** | Not tried | Free $5/month credit, same ephemeral filesystem caveat |
| **Fly.io** | Not tried | Generous free tier |
| **Google Apps Script** | ❌ Did not work | Do not retry |
| **Formspree** | Not tried | No server needed, POSTs from static HTML, free 50/month |
| **Tally.so** | Not tried | Replaces custom form entirely, free unlimited responses |

### Vercel setup — remaining steps
1. Sign up at vercel.com with GitHub account
2. Import repo `anushav3/ai-deployment-survey`
3. In Vercel dashboard → **Storage** → **Blob** → create a store, connect to project
4. Vercel auto-injects `BLOB_READ_WRITE_TOKEN` env var
5. Push `package.json` + `api/` folder → Vercel auto-deploys
6. Test: POST to `https://your-project.vercel.app/api/submit`
7. View responses: Vercel dashboard → Storage → Blob → browse `responses/` folder

### ❌ Vercel KV — deprecated, not available
- Vercel removed native KV storage in late 2024
- Do not attempt to use `@vercel/kv` — it will not work
