// 하루 브리핑 모듈 - 일정/메모/날씨 종합 요약
import { getSchedules } from './schedule.js';
import { getMemos } from './memo.js';
import { askWithSearch } from '../core/gemini.js';

/**
 * 브리핑 관련 명령 처리
 * @param {Object} intent - 파싱된 의도 객체
 * @param {string} rawText - 원본 음성 텍스트
 * @returns {Promise<string>} 브리핑 응답 텍스트
 */
export async function handleBriefing(intent, rawText) {
  try {
    const data = await collectBriefingData();

    const dateStr = data.date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    const scheduleList = data.schedules.length > 0
      ? data.schedules.map(s => s.title).join(', ')
      : '없음';

    const recentMemos = data.memos.slice(-3);
    const memoList = recentMemos.length > 0
      ? recentMemos.map(m => m.content).join(', ')
      : '없음';

    const prompt = `오늘은 ${dateStr}입니다. 오늘 일정: ${scheduleList}. 최근 메모: ${memoList}. 현재 한국의 날씨와 주요 뉴스를 포함하여 간단한 아침 브리핑을 해주세요.`;

    const response = await askWithSearch(prompt);
    return response;
  } catch (error) {
    console.error('[Briefing] 브리핑 생성 실패:', error);
    return '죄송합니다 주인님, 브리핑을 준비하는 중 문제가 발생했습니다.';
  }
}

/**
 * 브리핑 데이터 수집
 * @returns {Promise<Object>} { schedules, memos, date }
 */
export async function collectBriefingData() {
  const today = new Date();
  const [schedules, memos] = await Promise.all([
    getSchedules(today),
    getMemos(),
  ]);
  return {
    schedules,
    memos,
    date: today,
  };
}
