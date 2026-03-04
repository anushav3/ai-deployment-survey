const { list, del } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  const secret = process.env.EXPORT_TOKEN;
  if (!secret || req.query.token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { blobs } = await list({ prefix: 'responses/' });
    if (blobs.length === 0) {
      return res.status(200).json({ deleted: 0, message: 'Nothing to delete' });
    }

    await del(blobs.map((b) => b.url));

    return res.status(200).json({ deleted: blobs.length, message: `Deleted ${blobs.length} response(s)` });
  } catch (e) {
    console.error('Purge error:', e);
    return res.status(500).json({ error: e.message });
  }
};
