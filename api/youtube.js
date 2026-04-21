// Vercel Serverless Function — YouTube API 프록시
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY not configured' });
  }

  try {
    const { q, maxResults = 5 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      q,
      key: YOUTUBE_API_KEY,
      maxResults: maxResults.toString(),
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('YouTube API proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
