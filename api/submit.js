const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { answers } = req.body;
    if (!answers) return res.status(400).json({ error: 'Missing answers' });

    const id = Date.now();
    const entry = {
      id,
      timestamp: new Date().toISOString(),
      answers,
    };

    // Each response stored as its own file — no race conditions
    await put(`responses/${id}.json`, JSON.stringify(entry, null, 2), {
      access: 'private',
      contentType: 'application/json',
    });

    console.log(`[${entry.timestamp}] Response ${id} saved → Blob`);
    return res.status(200).json({ ok: true, id });
  } catch (e) {
    console.error('Submit error:', e);
    return res.status(400).json({ error: e.message });
  }
};
