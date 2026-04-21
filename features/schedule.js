// 일정 관리 모듈 - localStorage 기반 일정 CRUD
import { storage } from '../utils/storage.js';

const SCHEDULE_KEY = 'schedules';

/**
 * 일정 관련 명령 처리
 * @param {Object} intent - 파싱된 의도 객체
 * @param {string} rawText - 원본 음성 텍스트
 * @returns {Promise<string>} 응답 텍스트
 */
export async function handleSchedule(intent, rawText) {
  const subAction = intent.subAction;

  if (subAction === 'add') {
    const title = intent.params?.title || rawText;
    const date = intent.params?.date ? new Date(intent.params.date) : new Date();
    const schedule = addSchedule(title, date);
    return `네, 주인님. ${schedule.title} 일정을 등록했습니다.`;
  }

  if (subAction === 'delete') {
    const schedules = storage.get(SCHEDULE_KEY, []);
    // rawText에서 키워드로 일정 찾기
    const found = schedules.find(s =>
      rawText.includes(s.title) || s.title.includes(rawText.replace(/일정.*삭제|삭제.*일정|취소/g, '').trim())
    );
    if (found) {
      removeSchedule(found.id);
      return `네, 주인님. "${found.title}" 일정을 삭제했습니다.`;
    }
    // 못 찾으면 가장 최근 일정 삭제
    if (schedules.length > 0) {
      const last = schedules[schedules.length - 1];
      removeSchedule(last.id);
      return `네, 주인님. "${last.title}" 일정을 삭제했습니다.`;
    }
    return '삭제할 일정이 없습니다, 주인님.';
  }

  // 'list' 또는 null: 오늘 일정 조회
  const today = new Date();
  const todaySchedules = getSchedules(today);
  if (todaySchedules.length === 0) {
    return '오늘 등록된 일정이 없습니다, 주인님.';
  }
  const list = todaySchedules.map(s => s.title).join(', ');
  return `오늘 일정은 ${todaySchedules.length}건입니다, 주인님. ${list}.`;
}

/**
 * 일정 추가
 * @param {string} title - 일정 제목
 * @param {Date} date - 일정 날짜/시간
 * @returns {Object} 생성된 일정 객체
 */
export function addSchedule(title, date) {
  const schedules = storage.get(SCHEDULE_KEY, []);
  const schedule = {
    id: Date.now(),
    title,
    datetime: date.toISOString(),
    createdAt: new Date().toISOString(),
  };
  schedules.push(schedule);
  storage.set(SCHEDULE_KEY, schedules);
  return schedule;
}

/**
 * 특정 날짜의 일정 조회
 * @param {Date} date - 조회할 날짜
 * @returns {Array} 일정 목록
 */
export function getSchedules(date) {
  const schedules = storage.get(SCHEDULE_KEY, []);
  if (!date) return schedules;
  const target = date.toISOString().slice(0, 10);
  return schedules.filter(s => s.datetime.slice(0, 10) === target);
}

/**
 * 일정 삭제
 * @param {string} id - 일정 ID
 * @returns {boolean} 삭제 성공 여부
 */
export function removeSchedule(id) {
  const schedules = storage.get(SCHEDULE_KEY, []);
  const filtered = schedules.filter(s => s.id !== id);
  if (filtered.length === schedules.length) return false;
  storage.set(SCHEDULE_KEY, filtered);
  return true;
}
