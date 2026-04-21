// 의도 파악 및 라우팅 모듈 - 음성 텍스트에서 사용자 의도 추출

/**
 * 키워드 기반 의도 매핑
 */
const INTENT_KEYWORDS = {
  weather: ['날씨', '기온', '비', '눈', '추워', '더워'],
  news: ['뉴스', '소식', '최신'],
  translate: ['번역', '영어로', '일본어로', '중국어로', '뭐라고 해'],
  schedule: ['일정', '스케줄', '약속', '예약', '캘린더'],
  memo: ['메모', '기록', '노트', '적어', '저장'],
  timer: ['타이머', '알람', '알려줘', '분 뒤', '초 뒤', '시간 뒤'],
  briefing: ['브리핑', '오늘 일정', '요약', '하루'],
  youtube: ['노래', '음악', '유튜브', '재생', '틀어'],
  // maps: ['맛집', '근처', '지도', '길찾기', '어디', '장소', '카페', '식당'], // 보류
};

/**
 * 언어 매핑 (번역용)
 */
const LANG_MAP = {
  '영어': 'en',
  '일본어': 'ja',
  '중국어': 'zh',
  '프랑스어': 'fr',
  '스페인어': 'es',
  '독일어': 'de',
};

/**
 * 텍스트에서 의도 파악
 * @param {string} text - 인식된 음성 텍스트
 * @returns {Object} { action: string, subAction: string|null, params: Object }
 */
export function parseIntent(text) {
  const normalized = text.toLowerCase().trim();

  for (const [action, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return {
          action,
          subAction: detectSubAction(action, normalized),
          params: extractParams(action, normalized),
        };
      }
    }
  }

  // 매칭 안 되면 일반 대화로 처리
  return { action: 'chat', subAction: null, params: {} };
}

/**
 * 세부 액션 감지 (추가/조회/삭제 등)
 * @param {string} action - 주요 액션
 * @param {string} text - 정규화된 텍스트
 * @returns {string|null}
 */
function detectSubAction(action, text) {
  // 액션별 특화 서브액션
  if (action === 'youtube') {
    if (text.includes('꺼') || text.includes('정지') || text.includes('멈춰')) return 'stop';
    if (text.includes('일시정지') || text.includes('잠깐')) return 'pause';
  }

  if (action === 'timer') {
    if (text.includes('취소')) return 'cancel';
  }

  // 공통 서브액션
  if (text.includes('추가') || text.includes('등록') || text.includes('적어') || text.includes('설정')) return 'add';
  if (text.includes('삭제') || text.includes('취소') || text.includes('지워')) return 'delete';
  if (text.includes('보여') || text.includes('알려') || text.includes('뭐')) return 'list';
  return null;
}

/**
 * 텍스트에서 파라미터 추출
 * @param {string} action - 주요 액션
 * @param {string} text - 정규화된 텍스트
 * @returns {Object}
 */
function extractParams(action, text) {
  const params = { rawText: text };

  switch (action) {
    case 'timer': {
      // "N시간", "N분", "N초" 패턴 추출
      const hourMatch = text.match(/(\d+)\s*시간/);
      const minMatch = text.match(/(\d+)\s*분/);
      const secMatch = text.match(/(\d+)\s*초/);
      let seconds = 0;
      if (hourMatch) seconds += parseInt(hourMatch[1]) * 3600;
      if (minMatch) seconds += parseInt(minMatch[1]) * 60;
      if (secMatch) seconds += parseInt(secMatch[1]);
      if (seconds > 0) params.seconds = seconds;
      break;
    }

    case 'schedule': {
      // 날짜 패턴: "N월 N일", "내일", "모레"
      const dateMatch = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
      const timeMatch = text.match(/(\d{1,2})시\s*(?:(\d{1,2})분)?/);

      if (dateMatch) {
        const now = new Date();
        const month = parseInt(dateMatch[1]) - 1;
        const day = parseInt(dateMatch[2]);
        const date = new Date(now.getFullYear(), month, day);
        if (timeMatch) {
          date.setHours(parseInt(timeMatch[1]), timeMatch[2] ? parseInt(timeMatch[2]) : 0);
        }
        params.date = date.toISOString();
      } else if (text.includes('내일')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (timeMatch) {
          tomorrow.setHours(parseInt(timeMatch[1]), timeMatch[2] ? parseInt(timeMatch[2]) : 0);
        }
        params.date = tomorrow.toISOString();
      } else if (text.includes('모레')) {
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        if (timeMatch) {
          dayAfter.setHours(parseInt(timeMatch[1]), timeMatch[2] ? parseInt(timeMatch[2]) : 0);
        }
        params.date = dayAfter.toISOString();
      }

      // 제목 추출: "일정" 키워드 뒤의 텍스트 또는 따옴표 안의 텍스트
      const quoteMatch = text.match(/[""''](.+?)[""'']/);
      if (quoteMatch) {
        params.title = quoteMatch[1];
      } else {
        // "일정 추가 XXX", "약속 등록 XXX" 패턴
        const titleMatch = text.match(/(?:일정|약속|스케줄|예약)\s*(?:추가|등록)?\s+(.+?)(?:\s+\d{1,2}[월시]|\s*$)/);
        if (titleMatch) params.title = titleMatch[1].trim();
      }
      break;
    }

    case 'youtube': {
      // "XXX 틀어줘", "XXX 재생해줘", "XXX 노래"
      const playMatch = text.match(/(.+?)\s*(?:틀어|재생|들려|켜)/);
      if (playMatch) {
        let query = playMatch[1].trim();
        // "유튜브에서" 등 불필요한 접두어 제거
        query = query.replace(/^(?:유튜브에서|유튜브로)\s*/, '');
        if (query) params.query = query;
      }
      break;
    }

    case 'maps': {
      // "근처 XX 추천", "XX 맛집", "XX 어디"
      const nearbyMatch = text.match(/근처\s+(.+?)(?:\s+추천|\s+찾아|\s+알려|\s*$)/);
      const placeMatch = text.match(/(.+?)\s*(?:맛집|카페|식당|장소|어디)/);
      if (nearbyMatch) {
        params.keyword = nearbyMatch[1].trim();
      } else if (placeMatch) {
        params.keyword = placeMatch[1].trim();
      }
      break;
    }

    case 'translate': {
      // "XXX를 영어로", "XXX 영어로 번역"
      let targetLang = null;
      for (const [langName, langCode] of Object.entries(LANG_MAP)) {
        if (text.includes(langName + '로') || text.includes(langName)) {
          targetLang = langCode;
          break;
        }
      }
      if (targetLang) params.targetLang = targetLang;

      // 번역할 텍스트 추출
      const transMatch = text.match(/(.+?)(?:를|을)?\s*(?:영어|일본어|중국어|프랑스어|스페인어|독일어)로/);
      if (transMatch) {
        let transText = transMatch[1].trim();
        transText = transText.replace(/^(?:번역|통역)\s*/, '');
        if (transText) params.text = transText;
      }
      break;
    }

    default:
      break;
  }

  return params;
}
