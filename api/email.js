const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const entry = {
      email:     email.trim().toLowerCase(),
      timestamp: new Date().toISOString(),
    };

    // Each email stored as its own file
    await put(`emails/${Date.now()}.json`, JSON.stringify(entry, null, 2), {
      access: 'private',
      contentType: 'application/json',
    });

    console.log(`Email saved: ${entry.email}`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Email error:', e);
    return res.status(400).json({ error: e.message });
  }
};
