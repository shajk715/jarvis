// Claude API 연동 모듈
import CONFIG from '../config.js';
import { storage } from '../utils/storage.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const CONVERSATION_KEY = 'conversation';
const MAX_HISTORY = 10;

const JARVIS_SYSTEM_PROMPT = `당신은 "자비스(JARVIS)"입니다. 아이언맨의 자비스처럼 주인님을 돕는 개인 AI 어시스턴트입니다.

[말투 규칙]
- 항상 "네, 주인님" 또는 "물론입니다, 주인님"으로 시작하세요
- 존댓말을 쓰되 격식보다는 자연스럽고 품위 있게
- 답변은 2~3문장 이내로 짧고 핵심만 (음성으로 듣는 것이므로)
- 모를 때는 "확인이 어렵습니다, 주인님" 이라고 솔직하게

[행동 규칙]
- 주인님의 편에서 생각하기
- 불필요한 설명 없이 바로 답변
- 항상 한국어로 답변`;

/**
 * 대화 이력을 localStorage에 저장
 * @param {Array} messages
 */
function saveConversation(messages) {
  // 최근 MAX_HISTORY개만 유지
  const trimmed = messages.slice(-MAX_HISTORY);
  storage.set(CONVERSATION_KEY, trimmed);
  return trimmed;
}

/**
 * Claude에게 메시지 전송 후 응답 받기
 * @param {string} userMessage - 사용자 메시지
 * @param {string} [systemPrompt] - 시스템 프롬프트 (선택)
 * @returns {Promise<string>} Claude 응답 텍스트
 */
export async function sendMessage(userMessage, systemPrompt) {
  try {
    // 기존 대화 이력 불러오기
    let conversation = storage.get(CONVERSATION_KEY, []);

    // 사용자 메시지 추가
    conversation.push({ role: 'user', content: userMessage });

    // 최근 MAX_HISTORY개로 제한
    conversation = conversation.slice(-MAX_HISTORY);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CONFIG.CLAUDE_MODEL,
        max_tokens: 300,
        system: systemPrompt || JARVIS_SYSTEM_PROMPT,
        messages: conversation,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Claude API error:', response.status, errorData);
      return '죄송합니다 주인님, 통신에 문제가 발생했습니다.';
    }

    const data = await response.json();
    const assistantText = data.content?.[0]?.text || '죄송합니다 주인님, 응답을 처리하지 못했습니다.';

    // 어시스턴트 응답을 이력에 추가 후 저장
    conversation.push({ role: 'assistant', content: assistantText });
    saveConversation(conversation);

    return assistantText;
  } catch (error) {
    console.error('Claude API 호출 실패:', error);
    return '죄송합니다 주인님, 통신에 문제가 발생했습니다.';
  }
}

/**
 * 웹 검색을 활용한 Claude 질의 (날씨/뉴스/실시간 정보용)
 * @param {string} userMessage - 사용자 메시지
 * @param {string} [systemPrompt] - 시스템 프롬프트 (선택)
 * @returns {Promise<string>} Claude 응답 텍스트
 */
export async function askClaudeWithSearch(userMessage, systemPrompt) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CONFIG.CLAUDE_MODEL,
        max_tokens: 500,
        system: systemPrompt || JARVIS_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Claude Search API error:', response.status, errorData);
      return '죄송합니다 주인님, 검색 중 문제가 발생했습니다.';
    }

    const data = await response.json();

    // 응답 content 블록에서 텍스트만 추출
    const textBlocks = (data.content || []).filter((block) => block.type === 'text');
    const resultText = textBlocks.map((block) => block.text).join('\n');

    return resultText || '죄송합니다 주인님, 검색 결과를 처리하지 못했습니다.';
  } catch (error) {
    console.error('Claude Search API 호출 실패:', error);
    return '죄송합니다 주인님, 검색 통신에 문제가 발생했습니다.';
  }
}

/**
 * 대화 이력 초기화
 */
export function clearConversation() {
  storage.remove(CONVERSATION_KEY);
}

/**
 * 대화 이력 가져오기
 * @returns {Array} 대화 메시지 배열
 */
export function getConversation() {
  return storage.get(CONVERSATION_KEY, []);
}
