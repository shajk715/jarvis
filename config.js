// JARVIS 설정
const CONFIG = {
  // Supabase
  SUPABASE_URL: 'https://qtisdsgrrsvewiikjxzp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_zHP6m4Kz6ipcBNp2b9DWpg_b9vLKS4r',

  // Gemini (API 키는 Vercel 서버사이드에서 관리)
  GEMINI_MODEL: 'gemini-2.0-flash',

  // TTS 설정
  TTS_LANG: 'ko-KR',
  TTS_RATE: 1.0,

  // 웨이크워드
  WAKE_WORD: '루미',
};

export default CONFIG;
