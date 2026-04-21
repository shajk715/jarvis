// 일정 관리 모듈 - Supabase 기반 일정 CRUD
import { supabaseClient } from '../lib/supabase.js';

const TABLE = 'schedules';

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
    const schedule = await addSchedule(title, date);
    return `네, 주인님. ${schedule.title} 일정을 등록했습니다.`;
  }

  if (subAction === 'delete') {
    const schedules = await getSchedules();
    // rawText에서 키워드로 일정 찾기
    const found = schedules.find(s =>
      rawText.includes(s.title) || s.title.includes(rawText.replace(/일정.*삭제|삭제.*일정|취소/g, '').trim())
    );
    if (found) {
      await removeSchedule(found.id);
      return `네, 주인님. "${found.title}" 일정을 삭제했습니다.`;
    }
    // 못 찾으면 가장 최근 일정 삭제
    if (schedules.length > 0) {
      const last = schedules[schedules.length - 1];
      await removeSchedule(last.id);
      return `네, 주인님. "${last.title}" 일정을 삭제했습니다.`;
    }
    return '삭제할 일정이 없습니다, 주인님.';
  }

  // 'list' 또는 null: 오늘 일정 조회
  const today = new Date();
  const todaySchedules = await getSchedules(today);
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
 * @returns {Promise<Object>} 생성된 일정 객체
 */
export async function addSchedule(title, date) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const { data, error } = await supabaseClient
    .from(TABLE)
    .insert({ user_id: user.id, title, datetime: date.toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * 특정 날짜의 일정 조회 (날짜 없으면 전체)
 * @param {Date} [date] - 조회할 날짜
 * @returns {Promise<Array>} 일정 목록
 */
export async function getSchedules(date) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  let query = supabaseClient.from(TABLE).select('*').eq('user_id', user.id);
  if (date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    query = query.gte('datetime', start.toISOString()).lte('datetime', end.toISOString());
  }
  const { data, error } = await query.order('datetime', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * 일정 삭제
 * @param {number} id - 일정 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function removeSchedule(id) {
  const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
  return !error;
}
