// 번역 — 파파고 페이지로 redirect (원문/언어 미리 채움)
import { queueExternal } from '../utils/openExternal.js';

// 인텐트 파서 langCode → Papago tk 파라미터
const PAPAGO_LANG = {
  en: 'en',
  ja: 'ja',
  zh: 'zh-CN',
  fr: 'fr',
  es: 'es',
  de: 'de',
};

export function handleTranslate(intent, rawText) {
  const targetCode = PAPAGO_LANG[intent.params?.targetLang] || 'en';
  const transText = (intent.params?.text || '').trim();

  if (!transText) {
    queueExternal(`https://papago.naver.com/?sk=ko&tk=${targetCode}`);
    return '파파고를 열어드리겠습니다, 주인님.';
  }

  const url = `https://papago.naver.com/?sk=ko&tk=${targetCode}&st=${encodeURIComponent(transText)}`;
  queueExternal(url);
  return '파파고에서 번역 결과를 보여드리겠습니다, 주인님.';
}
