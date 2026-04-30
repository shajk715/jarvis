# 🤖 LUMI — 개인 음성 AI 어시스턴트

> 모바일 웹 기반 개인 전용 음성 AI. "루미"라고 부르면 깨어나서 뭐든 음성으로 답해주는 어시스턴트.

---

## 📌 프로젝트 개요

| 항목 | 결정 |
|------|------|
| 플랫폼 | 모바일 웹 (Claude Code로 개발) |
| 호출 방식 | Wake word "루미" 감지 (Web Speech API) |
| 입출력 | 완전 음성 (텍스트 UI 최소화) |
| 말투 | "네, 주인님" 영화 루미 스타일 |
| 목소리 | 한국어 자연스러운 TTS |
| UI | 파동/애니메이션 있는 멋진 화면 |
| 보안 | 오픈 (개인 전용) |
| 데이터 저장 | localStorage (브라우저 로컬) |
| 사용자 | 개인 전용 |
| API 키 | 3개 (Claude, YouTube, Google Maps) |

---

## ✅ 기능 목록

### 핵심 기능
- 🎙️ **Wake word 감지** — "루미" 말하면 자동 활성화
- 🗣️ **음성 인식 (STT)** — 말 → 텍스트 변환
- 🔊 **음성 출력 (TTS)** — 텍스트 → 한국어 음성
- 🧠 **AI 대화** — Claude 기반 자유 대화

### 생산성 기능
- 📅 **일정 관리** — 추가 / 조회 / 삭제
- 📝 **메모** — 음성 메모 저장 / 조회
- ⏰ **타이머 / 알람** — 음성으로 설정
- ☀️ **하루 브리핑** — 아침마다 일정 + 날씨 + 뉴스 요약

### 정보 기능
- 🌤️ **날씨** — 실시간 날씨 안내
- 📰 **뉴스** — 최신 뉴스 브리핑
- 🌐 **번역** — 실시간 번역

### 외부 연동 기능
- 🎵 **음악** — 유튜브 연동 재생
- 🍜 **맛집 추천** — 근처 맛집 (Google Maps API)
- 🗺️ **길 안내** — 구글 지도 연동

---

## 🛠️ 기술 스택

| 역할 | 기술 |
|------|------|
| Wake word 감지 | Web Speech API (키 없음) |
| 음성 인식 (STT) | Web Speech API |
| 음성 출력 (TTS) | Web Speech API (한국어) |
| AI 대화 + 날씨/뉴스/번역 | Claude API (웹 검색 포함) |
| 음악 | YouTube Data API v3 |
| 지도 / 맛집 | Google Maps API |
| 데이터 저장 | localStorage |
| 개발 환경 | Claude Code |

---

## 🔑 필요한 API 키 (총 3개)

| API | 용도 | 발급처 |
|-----|------|--------|
| **Claude API 키** | AI 대화 + 날씨/뉴스 검색 + 번역 | https://console.anthropic.com |
| **YouTube Data API v3** | 음악 검색 및 재생 | Google Cloud Console |
| **Google Maps API 키** | 맛집 추천 + 길 안내 | Google Cloud Console |

> 💡 YouTube + Google Maps는 Google Cloud Console 하나에서 같이 발급 가능
> ⚠️ API 키는 절대 코드에 직접 넣지 말고 `.env` 파일에 저장할 것

### 제거된 API (Claude로 대체)
- ~~Picovoice~~ → Web Speech API (무료, 키 없음) — "루미" wake word 감지
- ~~OpenWeather API~~ → Claude 웹 검색으로 대체
- ~~News API~~ → Claude 웹 검색으로 대체
- ~~Google Translate API~~ → Claude가 직접 번역

---

## 📁 프로젝트 파일 구조

```
lumi/
├── .env                        # API 키 환경변수
├── index.html                  # 메인 화면
├── style.css                   # UI 스타일 (파동 애니메이션)
│
├── core/
│   ├── wakeWord.js             # "루미" 감지 (Picovoice)
│   ├── stt.js                  # 음성 → 텍스트 (Web Speech API)
│   ├── tts.js                  # 텍스트 → 음성 (Web Speech API)
│   └── claude.js               # Claude API + 루미 말투 프롬프트
│
├── features/
│   ├── schedule.js             # 일정 관리
│   ├── memo.js                 # 메모
│   ├── timer.js                # 타이머 / 알람
│   ├── briefing.js             # 하루 브리핑
│   ├── weather.js              # 날씨
│   ├── news.js                 # 뉴스
│   ├── translate.js            # 번역
│   ├── youtube.js              # 유튜브 음악
│   └── maps.js                 # 지도 / 맛집
│
└── utils/
    ├── intentParser.js         # 말 의도 파악 및 라우팅
    └── storage.js              # localStorage 헬퍼
```

---

## 👷 AI 에이전트 팀 구성

Claude Code 멀티 에이전트로 개발 역할 분담:

### 1. 📋 PM Agent
- 전체 기획 / 요구사항 정리
- 작업 순서 / 우선순위 결정
- 에이전트 간 작업 조율
- **담당 파일**: 없음 (총괄)

### 2. 🏗️ Architect Agent
- 기술 스택 확정
- 프로젝트 초기 구조 생성
- 에이전트별 작업 분배
- **담당 파일**: 전체 구조 설계

### 3. 🎨 Frontend Agent
- 파동 애니메이션 UI 구현
- 모바일 반응형 화면
- 상태 표시 (듣는 중 / 생각 중 / 말하는 중)
- **담당 파일**: `index.html`, `style.css`

### 4. ⚙️ Backend Agent
- 외부 API 연동 구현
- 환경변수 / API 키 관리
- **담당 파일**: `features/weather.js`, `features/news.js`, `features/translate.js`, `features/youtube.js`, `features/maps.js`

### 5. 🎙️ Voice Agent
- Web Speech API로 "루미" wake word 감지
- STT / TTS 구현
- 마이크 권한 처리
- **담당 파일**: `core/wakeWord.js`, `core/stt.js`, `core/tts.js`

### 6. 🧠 AI Agent
- Claude API 연동
- Intent parser 구현
- 루미 말투 시스템 프롬프트 작성
- **담당 파일**: `core/claude.js`, `utils/intentParser.js`

### 7. 🧪 QA Agent
- 전체 기능 테스트
- 버그 발견 및 수정
- 모바일 브라우저 호환성 체크
- **담당 파일**: 전체

---

## 🙋 사람이 직접 해야 하는 것 (개입 포인트)

AI 에이전트가 할 수 없어서 직접 해야 하는 작업들:

| 단계 | 작업 | 이유 |
|------|------|------|
| 시작 전 | API 키 발급 (3개) | 외부 서비스 가입 필요 |
| 개발 중 | 중요 방향 결정 시 확인 | 판단이 필요한 순간 |
| 완성 후 | 실제 음성으로 테스트 | 직접 말해봐야 함 |
| 완성 후 | 배포 위치 결정 | 어디에 올릴지 결정 |

---

## 🚀 개발 순서 (추천)

```
1단계: 환경 세팅 (Architect Agent)
  → 프로젝트 폴더 생성, 기본 파일 구조, .env 세팅

2단계: 음성 코어 (Voice Agent)
  → STT / TTS 먼저 동작 확인

3단계: Wake word (Voice Agent)
  → "루미" 감지 연동

4단계: AI 연결 (AI Agent)
  → Claude API + 루미 말투 프롬프트

5단계: UI (Frontend Agent)
  → 파동 애니메이션 화면

6단계: 기능 추가 (Backend Agent)
  → 날씨 → 타이머 → 일정/메모 → 유튜브 → 지도 순서로

7단계: 브리핑 + 번역 (Backend Agent)
  → 하루 브리핑, 실시간 번역

8단계: QA (QA Agent)
  → 전체 테스트 및 버그 수정
```

---

## 💬 루미 시스템 프롬프트 (초안)

```
당신은 "루미"입니다. 아이언맨의 루미처럼 주인님을 돕는 개인 AI 어시스턴트입니다.

규칙:
- 항상 "네, 주인님" 또는 "물론입니다, 주인님" 으로 시작하세요
- 답변은 간결하고 핵심만 말하세요 (음성이므로 너무 길면 안 됨)
- 한국어로 자연스럽고 품위 있게 말하세요
- 모르는 것은 솔직하게 말하세요
- 항상 주인님의 편에서 생각하세요
```
