// localStorage 헬퍼 모듈 - 데이터 저장/조회/삭제

const PREFIX = 'jarvis_';

export const storage = {
  /**
   * 데이터 저장
   * @param {string} key - 저장 키
   * @param {*} value - 저장할 값 (자동 JSON 직렬화)
   */
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('[Storage] 저장 실패:', e);
    }
  },

  /**
   * 데이터 조회
   * @param {string} key - 조회 키
   * @param {*} [defaultValue=null] - 기본값
   * @returns {*} 저장된 값 또는 기본값
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('[Storage] 조회 실패:', e);
      return defaultValue;
    }
  },

  /**
   * 데이터 삭제
   * @param {string} key - 삭제할 키
   */
  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  /**
   * JARVIS 관련 모든 데이터 삭제
   */
  clearAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  },

  /**
   * 저장된 모든 키 목록 조회
   * @returns {string[]}
   */
  keys() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .map(k => k.slice(PREFIX.length));
  },
};
