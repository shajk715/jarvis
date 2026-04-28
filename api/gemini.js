// Vercel Serverless Function — Gemini API 프록시 (Google AI)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { model, contents, systemInstruction, generationConfig, tools } = req.body || {};
    const modelName = model || 'gemini-2.0-flash';

    const body = { contents };
    if (systemInstruction) body.systemInstruction = systemInstruction;
    if (generationConfig) body.generationConfig = generationConfig;
    if (tools) body.tools = tools;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', response.status, JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || 'Gemini API error',
        status: response.status,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Gemini API proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
