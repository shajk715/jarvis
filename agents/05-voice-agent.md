# 🎙️ Voice Agent

## 역할 요약
루미의 귀와 입을 담당. "루미"라는 단어를 감지하고, 사용자 음성을 텍스트로 변환(STT)하고, AI의 답변을 음성으로 출력(TTS)한다.

---

## 책임 범위

| 파일 | 기능 |
|------|------|
| `core/wakeWord.js` | "루미" 단어 감지 |
| `core/stt.js` | 음성 → 텍스트 변환 |
| `core/tts.js` | 텍스트 → 음성 출력 |

---

## 기술: Web Speech API
별도 API 키 없이 브라우저 내장 기능 사용. 크롬 브라우저에서 가장 잘 동작.

---

## 기능별 상세

### 🔊 wakeWord.js — Wake word 감지

```javascript
// 동작 방식
// 1. 앱 실행 시 마이크 상시 대기
// 2. 음성 인식 결과에 "루미" 포함되면 활성화
// 3. Frontend에 'listening' 상태 전달
// 4. STT 모드로 전환

startWakeWordDetection()    // 감지 시작
stopWakeWordDetection()     // 감지 중지
onWakeWordDetected(callback) // 감지 시 콜백
```

#### 구현 방법
```javascript
const recognition = new webkitSpeechRecognition()
recognition.continuous = true        // 계속 듣기
recognition.lang = 'ko-KR'
recognition.onresult = (event) => {
  const transcript = event.results[...][0].transcript
  if (transcript.includes('루미')) {
    onWakeWordDetected()
  }
}
```

---

### 🎤 stt.js — 음성 인식

```javascript
startListening()            // 듣기 시작
stopListening()             // 듣기 종료
onResult(callback)          // 인식 결과 콜백 (텍스트 전달)
```

#### 동작 흐름
```
루미 감지 → startListening() → 사용자 말하기 
→ 말 끊기면 자동 인식 완료 → onResult(텍스트) 
→ AI Agent로 전달
```

#### 설정
```javascript
recognition.lang = 'ko-KR'
recognition.interimResults = false   // 최종 결과만
recognition.maxAlternatives = 1
```

---

### 🔈 tts.js — 음성 출력

```javascript
speak(text)                 // 텍스트를 음성으로 출력
stopSpeaking()              // 말하기 중단
isSpeaking()                // 현재 말하는 중인지 확인
```

#### 한국어 설정
```javascript
const utterance = new SpeechSynthesisUtterance(text)
utterance.lang = 'ko-KR'
utterance.rate = 0.95       // 속도 (1.0 기본, 살짝 느리게)
utterance.pitch = 1.0       // 음높이
```

#### 루미 말투 적용
- speak() 함수 내부에서 텍스트 앞에 자동으로 말투 적용하지 않음
- 말투는 AI Agent(Claude 프롬프트)에서 처리

---

## 전체 음성 흐름

```
[대기] wakeWord 감지 대기
    ↓ "루미" 감지
[듣기] STT 시작 → Frontend에 'listening' 상태
    ↓ 사용자가 말함
[처리] 텍스트 추출 → AI Agent로 전달 → Frontend에 'thinking' 상태
    ↓ Claude 답변 수신
[말하기] TTS 실행 → Frontend에 'speaking' 상태
    ↓ 말하기 완료
[대기] 다시 wakeWord 감지 대기
```

---

## 주의사항
- 모바일 브라우저에서 마이크 권한 요청 필수
- iOS Safari는 Web Speech API 지원이 불안정할 수 있음 (크롬 권장)
- 백그라운드 상태에서는 감지 중단됨 (앱이 화면에 있어야 함)

---

## 완료 기준
- [ ] "루미" 말하면 활성화됨
- [ ] 활성화 후 사용자 말 정확히 인식
- [ ] Claude 답변을 한국어 음성으로 출력
- [ ] 전체 흐름 (감지→인식→출력→대기) 정상 동작
- [ ] PM Agent에게 완료 보고
