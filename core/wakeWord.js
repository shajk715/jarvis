// 웨이크워드("자비스") 감지 모듈
import CONFIG from '../config.js';

let recognition = null;
let callback = null;
let isRunning = false;

/**
 * 웨이크워드 감지 초기화
 * @param {Object} options
 * @param {Function} options.onDetected - 웨이크워드 감지 시 콜백
 */
export function initWakeWord({ onDetected }) {
  callback = onDetected;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error('[WakeWord] SpeechRecognition API를 지원하지 않는 브라우저입니다.');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript.trim();
      if (transcript.includes(CONFIG.WAKE_WORD)) {
        console.log(`[WakeWord] "${CONFIG.WAKE_WORD}" 감지됨:`, transcript);
        if (callback) {
          callback();
        }
        return;
      }
    }
  };

  recognition.onend = () => {
    // 감지 모드가 활성 상태이면 자동 재시작
    if (isRunning) {
      try {
        recognition.start();
      } catch (e) {
        console.warn('[WakeWord] 재시작 실패, 재시도 예정:', e.message);
        setTimeout(() => {
          if (isRunning) {
            try { recognition.start(); } catch (err) { /* ignore */ }
          }
        }, 300);
      }
    }
  };

  recognition.onerror = (event) => {
    console.warn('[WakeWord] 오류:', event.error);
    // 'aborted'나 'no-speech' 같은 일시적 오류는 onend에서 자동 재시작됨
    // 'not-allowed' 등 치명적 오류는 isRunning을 false로 전환
    if (event.error === 'not-allowed') {
      console.error('[WakeWord] 마이크 권한이 거부되었습니다.');
      isRunning = false;
    }
  };
}

/**
 * 웨이크워드 감지 시작
 */
export function startWakeWordDetection() {
  if (!recognition) {
    console.error('[WakeWord] 초기화되지 않았습니다. initWakeWord()를 먼저 호출하세요.');
    return;
  }
  if (isRunning) return;

  isRunning = true;
  try {
    recognition.start();
    console.log('[WakeWord] 감지 시작');
  } catch (e) {
    console.warn('[WakeWord] 시작 실패:', e.message);
  }
}

/**
 * 웨이크워드 감지 중지
 */
export function stopWakeWordDetection() {
  isRunning = false;
  if (recognition) {
    try {
      recognition.stop();
      console.log('[WakeWord] 감지 중지');
    } catch (e) {
      // 이미 중지된 상태일 수 있음
    }
  }
}
