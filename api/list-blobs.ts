import { list } from '@vercel/blob';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Vercel Blob automatically uses the BLOB_READ_WRITE_TOKEN environment variable 
    // that Vercel injects into your project when you connected the Blob store.
    // We provide a fallback token just in case it's not set in development mode.
    const token = process.env.BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_9E1tZacB7uO0V3lv_zugyR9v199KiCsUZRPVmGLIJg1Z6Bo';
    
    const { blobs } = await list({
      token,
      limit: 100 // fetch up to 100 images
    });

    return res.status(200).json(blobs);
  } catch (error) {
    console.error('Blob list error:', error);
    return res.status(500).json({ error: 'Failed to list blobs', details: String(error) });
  }
}
