// Vercel Serverless Function for Instant HTTP 307 Server-Side Redirects
// This bypasses client HTML rendering completely - Chrome directly receives HTTP 307 Location Header!

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.redirect(307, '/');
  }

  try {
    // Ultra-fast Server-to-Server fetch from Firebase Realtime Database
    const dbUrl = `https://qrcode-d2c90-default-rtdb.firebaseio.com/qrcodes/${id}.json`;
    const response = await fetch(dbUrl);
    const data = await response.json();

    if (data && data.active !== false && data.destinationUrl) {
      // Non-blocking background scan count update
      fetch(dbUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scans: (data.scans || 0) + 1,
          lastScannedAt: Date.now()
        })
      }).catch(() => {});

      // Set Cache-Control headers so Vercel doesn't cache stale destination URLs
      res.setHeader('Cache-Control', 's-maxage=0, max-age=0, must-revalidate, no-cache, no-store');
      
      // HTTP 307 Temporary Redirect straight to target URL!
      return res.redirect(307, data.destinationUrl);
    }
  } catch (error) {
    console.error('Serverless redirect error:', error);
  }

  // Fallback to client app if link is paused or not found
  return res.redirect(307, `/#/r/${id}`);
}
