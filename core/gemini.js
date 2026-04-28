// Gemini API 연동 모듈 (Vercel 서버사이드 프록시 경유)
import CONFIG from '../config.js';
import { storage } from '../utils/storage.js';

const API_URL = '/api/gemini';
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

function saveConversation(messages) {
  const trimmed = messages.slice(-MAX_HISTORY);
  storage.set(CONVERSATION_KEY, trimmed);
  return trimmed;
}

// 내부 형식({role, content}) → Gemini 형식({role, parts})
function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || '').join('').trim();
}

/**
 * Gemini에게 메시지 전송 후 응답 받기
 */
export async function sendMessage(userMessage, systemPrompt) {
  try {
    let conversation = storage.get(CONVERSATION_KEY, []);
    conversation.push({ role: 'user', content: userMessage });
    conversation = conversation.slice(-MAX_HISTORY);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONFIG.GEMINI_MODEL,
        contents: toGeminiContents(conversation),
        systemInstruction: { parts: [{ text: systemPrompt || JARVIS_SYSTEM_PROMPT }] },
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Gemini] API 에러:', response.status, errorData);
      const errMsg = errorData.error || `HTTP ${response.status}`;
      return `죄송합니다 주인님, 통신에 문제가 발생했습니다. (${errMsg})`;
    }

    const data = await response.json();
    const assistantText = extractText(data) || '죄송합니다 주인님, 응답을 처리하지 못했습니다.';

    conversation.push({ role: 'assistant', content: assistantText });
    saveConversation(conversation);
    return assistantText;
  } catch (error) {
    console.error('Gemini API 호출 실패:', error);
    return '죄송합니다 주인님, 통신에 문제가 발생했습니다.';
  }
}

/**
 * 웹 검색(Google Search Grounding) 사용 질의 — 날씨/뉴스/실시간 정보용
 */
export async function askWithSearch(userMessage, systemPrompt) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONFIG.GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemPrompt || JARVIS_SYSTEM_PROMPT }] },
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        tools: [{ googleSearch: {} }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Gemini Search] API 에러:', response.status, errorData);
      return await sendMessage(userMessage, systemPrompt);
    }

    const data = await response.json();
    const text = extractText(data);
    if (!text) {
      console.warn('[Gemini Search] 텍스트 없음, 일반 대화로 폴백');
      return await sendMessage(userMessage, systemPrompt);
    }
    return text;
  } catch (error) {
    console.error('[Gemini Search] 호출 실패:', error);
    try {
      return await sendMessage(userMessage, systemPrompt);
    } catch {
      return '죄송합니다 주인님, 통신에 문제가 발생했습니다.';
    }
  }
}

export function clearConversation() {
  storage.remove(CONVERSATION_KEY);
}

export function getConversation() {
  return storage.get(CONVERSATION_KEY, []);
}
