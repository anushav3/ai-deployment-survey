# AI Deployment Survey — Response Export

Survey responses are stored in Vercel Blob and can be downloaded as a CSV at any time.

## Download latest responses

The export endpoint requires a secret token set in Vercel environment variables.

```bash
curl -s "https://ai-deployment-survey.vercel.app/api/export?token=YOUR_EXPORT_TOKEN" -o survey-responses.csv
```

Replace `YOUR_EXPORT_TOKEN` with the value of the `EXPORT_TOKEN` environment variable set in the Vercel dashboard.

This will overwrite `survey-responses.csv` in the current folder with all responses to date.

## CSV columns

| Column | Description |
|---|---|
| `id` | Unique response ID (Unix timestamp in ms) |
| `timestamp` | Submission time (UTC) |
| `name` | Respondent full name |
| `email` | Respondent work email |
| `q1_role` | Role (e.g. Founder, ML Engineer) |
| `q2_company_size` | Company size |
| `q3_industry` | Industry |
| `q4_ai_journey` | Where org is on the AI journey |
| `q5_projects_stuck` | Number of AI projects stuck before production |
| `q6_top_blockers` | Top 3 blockers (pipe-separated) |
| `q7_decision_maker` | Who has final say on AI going to production |
| `q8_explainability_score` | Confidence score 0–10 |
| `q9_compliance_driver` | Compliance deadlines driving decisions (pipe-separated) |
| `q10_current_tools` | Tools currently in use (pipe-separated) |
| `q11_budget` | Budget status for AI governance/security tooling |
| `q12_leadership_sentiment` | How leadership talks about AI risk |
| `q13_open_ended` | Free-text: last AI project that got stuck |

## Links

- **Live survey**: https://ai-deployment-survey.vercel.app
- **Export endpoint**: https://ai-deployment-survey.vercel.app/api/export
- **Vercel project**: https://vercel.com/dashboard
