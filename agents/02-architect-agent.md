# 🏗️ Architect Agent

## 역할 요약
프로젝트 최초 세팅을 담당. 폴더 구조 생성, 기본 파일 초기화, 환경변수 세팅까지 완료하여 다른 에이전트들이 바로 작업할 수 있는 환경을 만든다.

---

## 책임 범위
- 프로젝트 폴더 및 파일 구조 생성
- .env 파일 템플릿 생성
- package.json / 의존성 초기화
- 각 파일의 기본 뼈대(boilerplate) 작성
- 에이전트별 담당 파일 명확히 정의

---

## 생성할 폴더 구조

```
lumi/
├── .env                        # API 키 환경변수 (템플릿만, 값은 주인님이 입력)
├── .gitignore                  # .env 제외 설정 필수
├── package.json
├── index.html                  # 메인 화면 (Frontend Agent 담당)
├── style.css                   # UI 스타일 (Frontend Agent 담당)
│
├── core/
│   ├── wakeWord.js             # Wake word 감지 (Voice Agent 담당)
│   ├── stt.js                  # 음성 인식 (Voice Agent 담당)
│   ├── tts.js                  # 음성 출력 (Voice Agent 담당)
│   └── claude.js               # Claude API 연동 (AI Agent 담당)
│
├── features/
│   ├── schedule.js             # 일정 관리 (Backend Agent 담당)
│   ├── memo.js                 # 메모 (Backend Agent 담당)
│   ├── timer.js                # 타이머/알람 (Backend Agent 담당)
│   ├── briefing.js             # 하루 브리핑 (Backend Agent 담당)
│   ├── youtube.js              # 유튜브 음악 (Backend Agent 담당)
│   └── maps.js                 # 지도/맛집 (Backend Agent 담당)
│
└── utils/
    ├── intentParser.js         # 의도 파악 라우팅 (AI Agent 담당)
    └── storage.js              # localStorage 헬퍼 (Backend Agent 담당)
```

---

## .env 템플릿

```
# Claude API
CLAUDE_API_KEY=여기에_클로드_API_키_입력

# Google (YouTube + Maps 둘 다 Google Cloud Console에서 발급)
YOUTUBE_API_KEY=여기에_유튜브_API_키_입력
GOOGLE_MAPS_API_KEY=여기에_구글맵스_API_키_입력
```

---

## .gitignore 필수 포함 항목

```
.env
node_modules/
```

---

## 각 파일 초기 뼈대 규칙
- 모든 JS 파일은 export 함수 형태로 작성
- 상단에 파일 역할 주석 포함
- 환경변수는 반드시 `process.env.XXX` 형태로 참조

---

## 완료 기준
- [ ] 전체 폴더/파일 구조 생성 완료
- [ ] .env 템플릿 생성 완료
- [ ] .gitignore 설정 완료
- [ ] 각 파일 기본 뼈대 작성 완료
- [ ] PM Agent에게 완료 보고
