const { list, del } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  const secret = process.env.EXPORT_TOKEN;
  if (!secret || req.query.token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { blobs } = await list({ prefix: 'responses/' });
  if (blobs.length === 0) return res.status(200).json({ deleted: 0 });

  await Promise.all(blobs.map(b => del(b.url)));
  return res.status(200).json({ deleted: blobs.length });
};
