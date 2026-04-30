// 뉴스 — 네이버 뉴스 페이지로 redirect
import { queueExternal } from '../utils/openExternal.js';

export function handleNews(intent, rawText) {
  queueExternal('https://news.naver.com/');
  return '뉴스를 열어드리겠습니다, 주인님.';
}
