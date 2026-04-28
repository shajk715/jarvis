// JARVIS 설정 예시 - config.js로 복사 후 Supabase 정보를 입력하세요
const CONFIG = {
  // Supabase
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key',

  // Gemini (API 키는 Vercel 서버사이드에서 관리)
  GEMINI_MODEL: 'gemini-2.0-flash',

  // TTS 설정
  TTS_LANG: 'ko-KR',
  TTS_RATE: 1.0,

  // 웨이크워드
  WAKE_WORD: '자비스',
};

export default CONFIG;
