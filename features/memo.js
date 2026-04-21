// 메모 모듈 - localStorage 기반 메모 CRUD
import { storage } from '../utils/storage.js';

const MEMO_KEY = 'memos';

/**
 * 메모 관련 명령 처리
 * @param {Object} intent - 파싱된 의도 객체
 * @param {string} rawText - 원본 음성 텍스트
 * @returns {Promise<string>} 응답 텍스트
 */
export async function handleMemo(intent, rawText) {
  const subAction = intent.subAction;

  if (subAction === 'add') {
    // rawText에서 메모 내용 추출 (키워드 뒤의 텍스트)
    const content = rawText
      .replace(/메모해?\s*(줘|줘라|해|해줘)?|기록해?\s*(줘|해)?|적어\s*(줘|놔)?/g, '')
      .trim() || rawText;
    addMemo(content);
    return '메모했습니다, 주인님.';
  }

  if (subAction === 'list') {
    const memos = getMemos();
    if (memos.length === 0) {
      return '저장된 메모가 없습니다, 주인님.';
    }
    const recent = memos.slice(-3).reverse();
    const list = recent.map((m, i) => `${i + 1}. ${m.content}`).join('. ');
    return `최근 메모 ${recent.length}건입니다, 주인님. ${list}`;
  }

  if (subAction === 'delete') {
    const memos = getMemos();
    if (memos.length === 0) {
      return '삭제할 메모가 없습니다, 주인님.';
    }
    const last = memos[memos.length - 1];
    removeMemo(last.id);
    return `마지막 메모를 삭제했습니다, 주인님.`;
  }

  // subAction이 null이면 rawText를 그냥 메모로 저장
  const content = rawText.trim();
  if (content) {
    addMemo(content);
    return '메모했습니다, 주인님.';
  }
  return '메모할 내용을 말씀해주세요, 주인님.';
}

/**
 * 메모 추가
 * @param {string} content - 메모 내용
 * @param {string} [tag] - 태그 (선택)
 * @returns {Object} 생성된 메모 객체
 */
export function addMemo(content, tag) {
  const memos = storage.get(MEMO_KEY, []);
  const memo = {
    id: Date.now(),
    content,
    tag: tag || null,
    createdAt: new Date().toISOString(),
  };
  memos.push(memo);
  storage.set(MEMO_KEY, memos);
  return memo;
}

/**
 * 모든 메모 조회
 * @returns {Array} 메모 목록
 */
export function getMemos() {
  return storage.get(MEMO_KEY, []);
}

/**
 * 메모 검색
 * @param {string} keyword - 검색어
 * @returns {Array} 검색 결과
 */
export function searchMemos(keyword) {
  const memos = getMemos();
  return memos.filter(m => m.content.includes(keyword));
}

/**
 * 메모 삭제
 * @param {string} id - 메모 ID
 * @returns {boolean} 삭제 성공 여부
 */
export function removeMemo(id) {
  const memos = getMemos();
  const filtered = memos.filter(m => m.id !== id);
  if (filtered.length === memos.length) return false;
  storage.set(MEMO_KEY, filtered);
  return true;
}
