const { list } = require('@vercel/blob');

const HEADERS = [
  'id', 'timestamp', 'name', 'email',
  'q1_role', 'q2_company_size', 'q3_industry', 'q4_ai_journey',
  'q5_projects_stuck', 'q6_top_blockers', 'q7_decision_maker',
  'q8_explainability_score', 'q9_compliance_driver', 'q10_current_tools',
  'q11_budget', 'q12_leadership_sentiment', 'q13_open_ended',
];

function friendlyTimestamp(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month:  'short',
    day:    'numeric',
    year:   'numeric',
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
}

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const str = Array.isArray(val) ? val.join(' | ') : String(val);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

module.exports = async function handler(req, res) {
  // ── Auth: require ?token=EXPORT_TOKEN ──────────────────────────────────
  const secret = process.env.EXPORT_TOKEN;
  if (!secret || req.query.token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // List all response blobs
    const { blobs } = await list({ prefix: 'responses/' });

    if (blobs.length === 0) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="survey-responses.csv"');
      return res.status(200).send('\uFEFF' + HEADERS.join(',') + '\n');
    }

    // Fetch each blob (public store — URLs are non-guessable by design)
    const rows = await Promise.all(
      blobs.map(async (blob) => {
        const r = await fetch(blob.url);
        return r.json();
      })
    );

    // Sort oldest → newest
    rows.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Build CSV rows
    const lines = rows.map((entry) => {
      const a = entry.answers || {};
      const row = {
        id:                      entry.id,
        timestamp:               friendlyTimestamp(entry.timestamp),
        name:                    a.name,
        email:                   a.email,
        q1_role:                 a.q1,
        q2_company_size:         a.q2,
        q3_industry:             a.q3,
        q4_ai_journey:           a.q4,
        q5_projects_stuck:       a.q5,
        q6_top_blockers:         a.q6,   // array → joined with " | "
        q7_decision_maker:       a.q7,
        q8_explainability_score: a.q8,
        q9_compliance_driver:    a.q9,
        q10_current_tools:       a.q10,  // array → joined with " | "
        q11_budget:              a.q11,
        q12_leadership_sentiment:a.q12,
        q13_open_ended:          a.q13,
      };
      return HEADERS.map((h) => csvEscape(row[h])).join(',');
    });

    // UTF-8 BOM so Excel auto-detects encoding
    const csv = '\uFEFF' + HEADERS.join(',') + '\n' + lines.join('\n') + '\n';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="survey-responses.csv"');
    return res.status(200).send(csv);
  } catch (e) {
    console.error('Export error:', e);
    return res.status(500).json({ error: e.message });
  }
};
