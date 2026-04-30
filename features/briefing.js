// 하루 브리핑 — 일정과 메모를 로컬에서 모아 텍스트로 요약
import { getSchedules } from './schedule.js';
import { getMemos } from './memo.js';

export async function handleBriefing(intent, rawText) {
  try {
    const data = await collectBriefingData();

    const dateStr = data.date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    const scheduleLine = data.schedules.length > 0
      ? `오늘 일정은 ${data.schedules.map(s => s.title).join(', ')}입니다.`
      : '오늘 등록된 일정은 없습니다.';

    const recentMemos = data.memos.slice(-3);
    const memoLine = recentMemos.length > 0
      ? `최근 메모는 ${recentMemos.map(m => m.content).join(', ')}입니다.`
      : '최근 메모도 없습니다.';

    return `네 주인님, ${dateStr} 브리핑입니다. ${scheduleLine} ${memoLine}`;
  } catch (error) {
    console.error('[Briefing] 브리핑 생성 실패:', error);
    return '죄송합니다 주인님, 브리핑을 준비하는 중 문제가 발생했습니다.';
  }
}

export async function collectBriefingData() {
  const today = new Date();
  const [schedules, memos] = await Promise.all([
    getSchedules(today),
    getMemos(),
  ]);
  return { schedules, memos, date: today };
}
