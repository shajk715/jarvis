// JARVIS 설정 - 이 파일을 config.js로 복사한 후 API 키를 입력하세요
// cp config.example.js config.js
const CONFIG = {
  CLAUDE_API_KEY: '여기에_클로드_API_키_입력',
  CLAUDE_MODEL: 'claude-sonnet-4-20250514',
  YOUTUBE_API_KEY: '여기에_유튜브_API_키_입력',
  // KAKAO_API_KEY: '여기에_카카오_REST_API_키_입력', // 보류

  // TTS 설정
  TTS_LANG: 'ko-KR',
  TTS_RATE: 1.0,

  // 웨이크워드
  WAKE_WORD: '자비스',
};

export default CONFIG;
