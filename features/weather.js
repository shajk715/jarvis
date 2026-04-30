// 날씨 — 네이버 검색 페이지로 redirect
import { queueExternal } from '../utils/openExternal.js';

const WEATHER_KEYWORDS = ['날씨', '기온', '비', '눈', '추워', '더워'];

function extractPlace(text) {
  // "서울 날씨", "부산 기온" 같은 패턴에서 키워드 앞쪽 토큰을 장소로 추출
  const cleaned = text.replace(/오늘|내일|지금|좀|어때|알려|줘|요/g, '').trim();
  for (const kw of WEATHER_KEYWORDS) {
    const idx = cleaned.indexOf(kw);
    if (idx > 0) {
      return cleaned.slice(0, idx).trim();
    }
  }
  return '';
}

export function handleWeather(intent, rawText) {
  const place = extractPlace(rawText);
  const query = place ? `${place} 날씨` : '날씨';
  queueExternal(`https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`);
  return place
    ? `${place} 날씨를 열어드리겠습니다, 주인님.`
    : '날씨를 열어드리겠습니다, 주인님.';
}
