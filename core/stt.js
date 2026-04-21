// 음성 인식(STT) 모듈 - Web Speech API 기반
let recognition = null;
let onResultCallback = null;
let onInterimCallback = null;
let onErrorCallback = null;

/**
 * STT 초기화
 * @param {Object} options
 * @param {Function} options.onResult - 최종 인식 결과 콜백 (text: string)
 * @param {Function} [options.onInterim] - 중간 인식 결과 콜백 (text: string) — 말하는 동안 실시간 표시용
 * @param {Function} options.onError - 에러 콜백 (error: Error)
 */
export function initSTT({ onResult, onInterim, onError }) {
  onResultCallback = onResult;
  onInterimCallback = onInterim;
  onErrorCallback = onError;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error('[STT] SpeechRecognition API를 지원하지 않는 브라우저입니다.');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let interimText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        const finalText = transcript.trim();
        console.log('[STT] 최종 인식 결과:', finalText);
        if (onResultCallback) {
          onResultCallback(finalText);
        }
      } else {
        interimText += transcript;
      }
    }
    // 중간 결과를 실시간으로 전달
    if (interimText && onInterimCallback) {
      onInterimCallback(interimText.trim());
    }
  };

  recognition.onerror = (event) => {
    console.warn('[STT] 오류:', event.error);
    if (onErrorCallback) {
      onErrorCallback(new Error(event.error));
    }
  };

  recognition.onend = () => {
    console.log('[STT] 인식 종료');
  };
}

/**
 * 음성 인식 시작
 */
export function startListening() {
  if (!recognition) {
    console.error('[STT] 초기화되지 않았습니다. initSTT()를 먼저 호출하세요.');
    return;
  }
  try {
    recognition.start();
    console.log('[STT] 인식 시작');
  } catch (e) {
    console.warn('[STT] 시작 실패:', e.message);
  }
}

/**
 * 음성 인식 중지
 */
export function stopListening() {
  if (recognition) {
    try {
      recognition.stop();
      console.log('[STT] 인식 중지');
    } catch (e) {
      // 이미 중지된 상태일 수 있음
    }
  }
}

/**
 * 음성 인식 지원 여부 확인
 * @returns {boolean}
 */
export function isSTTSupported() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}
