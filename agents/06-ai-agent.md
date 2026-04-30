# 🧠 AI Agent

## 역할 요약
루미의 두뇌. 사용자가 말한 내용을 분석해서 어떤 기능을 써야 할지 판단하고, Claude API를 통해 답변을 생성한다. 모든 답변은 "네, 주인님" 루미 스타일로 나온다.

---

## 책임 범위

| 파일 | 기능 |
|------|------|
| `core/claude.js` | Claude API 연동 + 답변 생성 |
| `utils/intentParser.js` | 사용자 말 의도 파악 및 기능 라우팅 |

---

## 기능별 상세

### 🤖 claude.js — Claude API 연동

```javascript
askClaude(userMessage, context)   // Claude에게 질문 → 답변 반환
askClaudeWithSearch(query)        // 웹 검색 포함 질문 (날씨, 뉴스용)
```

#### API 설정
```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-5',
    max_tokens: 300,          // 음성이므로 짧게
    system: LUMI_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  })
})
```

---

### 🎭 루미 시스템 프롬프트

```
당신은 "루미(LUMI)"입니다. 주인님을 돕는 개인 AI 어시스턴트입니다.

[말투 규칙]
- 항상 "네, 주인님" 또는 "물론입니다, 주인님"으로 시작하세요
- 존댓말을 쓰되 격식보다는 자연스럽고 품위 있게
- 답변은 2~3문장 이내로 짧고 핵심만 (음성으로 듣는 것이므로)
- 모를 때는 "확인이 어렵습니다, 주인님" 이라고 솔직하게

[행동 규칙]
- 주인님의 편에서 생각하기
- 불필요한 설명 없이 바로 답변
- 항상 한국어로 답변
```

---

### 🗺️ intentParser.js — 의도 파악 및 라우팅

사용자가 말한 텍스트를 분석해서 어떤 기능을 실행할지 결정한다.

```javascript
parseIntent(text)   // 텍스트 → { intent, params } 반환
```

#### 의도 분류표

| 키워드 예시 | Intent | 호출할 기능 |
|------------|--------|-------------|
| "일정 추가", "약속 잡아줘" | `schedule_add` | schedule.js |
| "오늘 일정", "내일 뭐 있어" | `schedule_get` | schedule.js |
| "메모해줘", "기억해줘" | `memo_add` | memo.js |
| "메모 읽어줘", "아까 메모" | `memo_get` | memo.js |
| "타이머", "분 후에 알려줘" | `timer` | timer.js |
| "날씨", "오늘 날씨" | `weather` | claude.js (웹검색) |
| "뉴스", "오늘 뉴스" | `news` | claude.js (웹검색) |
| "번역해줘", "영어로" | `translate` | claude.js |
| "음악", "노래 틀어줘" | `music_play` | youtube.js |
| "음악 꺼줘", "정지" | `music_stop` | youtube.js |
| "맛집", "뭐 먹을까" | `restaurant` | maps.js |
| "길 알려줘", "어떻게 가" | `directions` | maps.js |
| "브리핑", "오늘 요약" | `briefing` | briefing.js |
| 그 외 | `chat` | claude.js (일반 대화) |

#### 구현 방식
- 1차: 키워드 매칭 (빠름)
- 2차: 키워드 애매할 때 Claude에게 의도 분류 요청

---

## 전체 처리 흐름

```
사용자 텍스트 입력
    ↓
intentParser.parseIntent(text)
    ↓
┌─────────────────────────────┐
│ intent에 따라 분기           │
├─────────────────────────────┤
│ schedule → schedule.js      │
│ memo     → memo.js          │
│ timer    → timer.js         │
│ weather  → claude (검색)    │
│ music    → youtube.js       │
│ maps     → maps.js          │
│ chat     → claude (대화)    │
└─────────────────────────────┘
    ↓
결과 텍스트 생성
    ↓
claude.js로 루미 말투 입혀서 최종 답변
    ↓
Voice Agent (TTS)로 전달
```

---

## 완료 기준
- [ ] Claude API 연동 및 답변 수신
- [ ] 루미 시스템 프롬프트 적용 (말투 확인)
- [ ] 의도 파악 정확도 80% 이상
- [ ] 날씨/뉴스 웹 검색 동작
- [ ] 전체 라우팅 흐름 정상 동작
- [ ] PM Agent에게 완료 보고
