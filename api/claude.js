// Vercel Serverless Function — Claude API 프록시
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  if (!CLAUDE_API_KEY) {
    return res.status(500).json({ error: 'CLAUDE_API_KEY not configured' });
  }

  try {
    const { model, max_tokens, system, messages, tools } = req.body;

    const body = {
      model: model || 'claude-sonnet-4-5',
      max_tokens: max_tokens || 300,
      system,
      messages,
    };

    if (tools) {
      body.tools = tools;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Claude API error:', response.status, JSON.stringify(data));
      // 상세 에러를 클라이언트로 전달
      return res.status(response.status).json({
        error: data.error?.message || data.error || 'Claude API error',
        type: data.error?.type,
        status: response.status,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Claude API proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
