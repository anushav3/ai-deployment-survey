const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // List all files under responses/ prefix to get count
    const { blobs } = await list({ prefix: 'responses/' });
    return res.status(200).json({ count: blobs.length });
  } catch (e) {
    console.error('Count error:', e);
    return res.status(200).json({ count: 0 });
  }
};
