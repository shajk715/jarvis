// 텍스트 음성 변환(TTS) 모듈 - Web Speech API 기반
import CONFIG from '../config.js';

let koreanVoice = null;

// 한국어 음성을 찾아 캐싱
function loadKoreanVoice() {
  const voices = speechSynthesis.getVoices();
  koreanVoice = voices.find(v => v.lang.startsWith('ko')) || null;
  if (koreanVoice) {
    console.log('[TTS] 한국어 음성 선택:', koreanVoice.name);
  }
}

// 음성 목록이 비동기로 로드되는 브라우저 대응
if (typeof speechSynthesis !== 'undefined') {
  loadKoreanVoice();
  speechSynthesis.addEventListener('voiceschanged', loadKoreanVoice);
}

/**
 * 텍스트를 음성으로 출력
 * @param {string} text - 읽을 텍스트
 * @returns {Promise<void>} 음성 출력 완료 시 resolve
 */
export function speak(text) {
  return new Promise((resolve, reject) => {
    if (!isTTSSupported()) {
      console.error('[TTS] speechSynthesis를 지원하지 않는 브라우저입니다.');
      resolve();
      return;
    }

    // 기존 발화 중단
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = CONFIG.TTS_LANG;
    utterance.rate = CONFIG.TTS_RATE;
    utterance.pitch = 1.0;

    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    utterance.onend = () => {
      console.log('[TTS] 발화 완료');
      resolve();
    };

    utterance.onerror = (event) => {
      // 'canceled'는 stopSpeaking() 호출 시 발생하므로 정상 처리
      if (event.error === 'canceled') {
        resolve();
      } else {
        console.warn('[TTS] 오류:', event.error);
        reject(new Error(event.error));
      }
    };

    speechSynthesis.speak(utterance);
    console.log('[TTS] 발화 시작:', text.substring(0, 30) + (text.length > 30 ? '...' : ''));
  });
}

/**
 * 현재 음성 출력 중지
 */
export function stopSpeaking() {
  if (isTTSSupported()) {
    speechSynthesis.cancel();
    console.log('[TTS] 발화 중지');
  }
}

/**
 * TTS 지원 여부 확인
 * @returns {boolean}
 */
export function isTTSSupported() {
  return 'speechSynthesis' in window;
}
