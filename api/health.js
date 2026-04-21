// 상태 확인 엔드포인트 - API 키/환경변수 설정 여부 확인
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.status(200).json({
    status: 'ok',
    hasClaudeKey: !!process.env.CLAUDE_API_KEY,
    claudeKeyLength: process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.length : 0,
    hasYoutubeKey: !!process.env.YOUTUBE_API_KEY,
    youtubeKeyLength: process.env.YOUTUBE_API_KEY ? process.env.YOUTUBE_API_KEY.length : 0,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
}
