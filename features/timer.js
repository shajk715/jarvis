// 타이머/알람 모듈
import { speak } from '../core/tts.js';

// 활성 타이머를 모듈 레벨에서 관리
const activeTimers = new Map();

/**
 * 타이머 관련 명령 처리
 * @param {Object} intent - 파싱된 의도 객체
 * @param {string} rawText - 원본 음성 텍스트
 * @returns {Promise<string>} 응답 텍스트
 */
export async function handleTimer(intent, rawText) {
  const subAction = intent.subAction;

  if (subAction === 'cancel') {
    if (activeTimers.size === 0) {
      return '취소할 타이머가 없습니다, 주인님.';
    }
    // 모든 활성 타이머 취소
    for (const [id] of activeTimers) {
      cancelTimer(id);
    }
    return '타이머를 취소했습니다, 주인님.';
  }

  // 기본: 타이머 설정
  const seconds = intent.params?.seconds;
  if (!seconds || seconds <= 0) {
    return '타이머 시간을 말씀해주세요, 주인님.';
  }

  const label = intent.params?.label || '타이머';
  const timerId = setTimer(seconds, label, () => {
    speak('주인님, 타이머가 완료되었습니다.');
  });

  // 사용자에게 보여줄 시간 포맷
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  let timeStr = '';
  if (minutes > 0) timeStr += `${minutes}분`;
  if (secs > 0) timeStr += ` ${secs}초`;
  timeStr = timeStr.trim();

  return `${timeStr} 타이머를 시작했습니다, 주인님.`;
}

/**
 * 타이머 설정
 * @param {number} seconds - 초 단위 시간
 * @param {string} [label] - 타이머 라벨
 * @param {Function} onComplete - 완료 시 콜백
 * @returns {string} 타이머 ID
 */
export function setTimer(seconds, label, onComplete) {
  const id = `timer_${Date.now()}`;
  const timeoutId = setTimeout(() => {
    activeTimers.delete(id);
    if (onComplete) onComplete();
  }, seconds * 1000);

  activeTimers.set(id, {
    id,
    timeoutId,
    label: label || '타이머',
    seconds,
    startedAt: Date.now(),
    endsAt: Date.now() + seconds * 1000,
  });

  return id;
}

/**
 * 타이머 취소
 * @param {string} timerId - 타이머 ID
 * @returns {boolean} 취소 성공 여부
 */
export function cancelTimer(timerId) {
  const timer = activeTimers.get(timerId);
  if (!timer) return false;
  clearTimeout(timer.timeoutId);
  activeTimers.delete(timerId);
  return true;
}

/**
 * 활성 타이머 목록 조회
 * @returns {Array} 활성 타이머 목록
 */
export function getActiveTimers() {
  return Array.from(activeTimers.values()).map(t => ({
    id: t.id,
    label: t.label,
    seconds: t.seconds,
    remainingMs: Math.max(0, t.endsAt - Date.now()),
  }));
}
