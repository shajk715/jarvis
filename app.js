// JARVIS 앱 진입점 - 모듈 통합 및 초기화
import CONFIG from './config.js';
import { getCurrentUser, signIn, signUp, onAuthStateChange } from './auth.js';
import { initWakeWord, startWakeWordDetection, stopWakeWordDetection } from './core/wakeWord.js';
import { initSTT, startListening, stopListening } from './core/stt.js';
import { speak } from './core/tts.js';
import { parseIntent } from './utils/intentParser.js';
import { openExternal, consumePendingExternal } from './utils/openExternal.js';
import { handleSchedule } from './features/schedule.js';
import { handleMemo } from './features/memo.js';
import { handleTimer } from './features/timer.js';
import { handleBriefing } from './features/briefing.js';
import { handleYoutube, consumePendingVideoId, playInPlayer, initYoutubePlayer } from './features/youtube.js';
import { handleWeather } from './features/weather.js';
import { handleNews } from './features/news.js';
import { handleTranslate } from './features/translate.js';
// import { handleMaps } from './features/maps.js'; // 보류

// DOM 요소
const statusText = document.getElementById('status-text');
const orb = document.getElementById('orb');
const transcript = document.getElementById('transcript');
const responseText = document.getElementById('response-text');
const micBtn = document.getElementById('mic-btn');
const timeDisplay = document.getElementById('time-display');
const externalOpenBtn = document.getElementById('external-open-btn');

// 환경 감지: iOS standalone PWA는 사용자 제스처 없이 외부 링크 자동 열기 불가
const isIosStandalonePwa = (
  /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
  (window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches)
);

// 앱 상태
let isListening = false;
let ttsPrimed = false;

/**
 * iOS Safari/PWA는 SpeechSynthesis가 사용자 제스처 없이 호출되면 무음 처리됨.
 * 첫 사용자 탭 시점에 무음 utterance를 한 번 흘려 엔진을 깨워둔다.
 * 한 번 깨워두면 이후 wake word 콜백에서 호출돼도 정상 동작.
 */
function primeTts() {
  if (ttsPrimed || typeof speechSynthesis === 'undefined') return;
  try {
    speechSynthesis.cancel();
    speechSynthesis.resume();
    const u = new SpeechSynthesisUtterance('.');
    u.volume = 0;
    u.rate = 10;
    speechSynthesis.speak(u);
    ttsPrimed = true;
    console.log('[TTS] primed');
  } catch (e) {
    console.warn('[TTS] prime 실패:', e);
  }
}
document.addEventListener('click', primeTts, true);
document.addEventListener('touchstart', primeTts, true);

/**
 * 앱 초기화
 */
async function init() {
  updateClock();
  setInterval(updateClock, 1000);

  // 인증 체크
  const user = await getCurrentUser();
  if (!user) {
    showAuthScreen();
    setupAuthForm();
    return;
  }

  // 인증됨 - 앱 시작
  startApp();
}

/**
 * 인증 화면 표시
 */
function showAuthScreen() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

/**
 * 앱 화면 표시
 */
function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
}

/**
 * 인증 폼 설정
 */
function setupAuthForm() {
  let isSignUp = false;
  const form = document.getElementById('auth-form');
  const toggleBtn = document.getElementById('toggle-auth');
  const submitBtn = document.getElementById('auth-submit');
  const errorEl = document.getElementById('auth-error');

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;
    submitBtn.textContent = isSignUp ? '회원가입' : '로그인';
    toggleBtn.textContent = isSignUp ? '로그인' : '회원가입';
    toggleBtn.parentElement.childNodes[0].textContent = isSignUp ? '이미 계정이 있으신가요? ' : '계정이 없으신가요? ';
    errorEl.textContent = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    errorEl.textContent = '';

    try {
      if (isSignUp) {
        await signUp(email, password);
        errorEl.style.color = '#00e676';
        errorEl.textContent = '가입 완료! 이메일을 확인해주세요.';
      } else {
        await signIn(email, password);
        showApp();
        startApp();
      }
    } catch (err) {
      errorEl.style.color = '#ff4444';
      errorEl.textContent = err.message;
    }
  });
}

/**
 * 앱 시작 (인증 완료 후)
 */
function startApp() {
  showApp();

  // 마이크 버튼 이벤트
  micBtn.addEventListener('click', toggleMic);

  // 외부 페이지 열기 — 진짜 <a target="_blank"> 이므로 anchor 자체가 열기를 처리.
  // 핸들러는 탭 후 버튼만 정리.
  externalOpenBtn.addEventListener('click', () => {
    setTimeout(() => {
      externalOpenBtn.hidden = true;
      externalOpenBtn.removeAttribute('href');
    }, 100);
  });

  // STT 초기화 (interim 결과로 실시간 자막 표시)
  initSTT({
    onResult: handleVoiceResult,
    onInterim: (text) => {
      transcript.textContent = text;
      const guide = document.getElementById('guide-message');
      if (guide) guide.style.display = 'none';
    },
    onError: handleError,
  });

  // 웨이크워드 감지 초기화 및 시작
  initWakeWord({ onDetected: onWakeWordDetected });
  startWakeWordDetection();

  // 인앱 유튜브 플레이어 초기화 (IFrame API 비동기 로드)
  initYoutubePlayer();

  setStatus('대기 중');
}

/**
 * 마이크 토글
 */
function toggleMic() {
  if (isListening) {
    stopListening();
    startWakeWordDetection();
    setStatus('대기 중');
    orb.className = 'idle';
    micBtn.classList.remove('active');
  } else {
    stopWakeWordDetection();
    startListening();
    setStatus('듣는 중...');
    orb.className = 'listening';
    micBtn.classList.add('active');
  }
  isListening = !isListening;
}

/**
 * 웨이크워드 감지 시 호출
 */
function onWakeWordDetected() {
  if (!isListening) {
    toggleMic();
  }
}

/**
 * 음성 인식 결과 처리
 * @param {string} text - 인식된 텍스트
 */
async function handleVoiceResult(text) {
  // 음성 인식이 완료되었으므로 즉시 듣기 상태 해제
  stopListening();
  isListening = false;
  micBtn.classList.remove('active');

  // 이전 명령에서 떠있을 수 있는 외부 열기 버튼 숨김
  externalOpenBtn.hidden = true;
  externalOpenBtn.removeAttribute('href');

  transcript.textContent = text;
  const guide = document.getElementById('guide-message');
  if (guide) guide.style.display = 'none';
  setStatus('처리 중...');
  orb.className = 'thinking';

  try {
    // 의도 파악
    const intent = parseIntent(text);

    // 의도에 따라 기능 라우팅
    let result;
    switch (intent.action) {
      case 'schedule':
        result = await handleSchedule(intent, text);
        break;
      case 'memo':
        result = await handleMemo(intent, text);
        break;
      case 'timer':
        result = await handleTimer(intent, text);
        break;
      case 'briefing':
        result = await handleBriefing(intent, text);
        break;
      case 'youtube':
        result = await handleYoutube(intent, text);
        break;
      // case 'maps': // 보류
      //   result = await handleMaps(intent, text);
      //   break;
      case 'weather':
        result = handleWeather(intent, text);
        break;
      case 'news':
        result = handleNews(intent, text);
        break;
      case 'translate':
        result = handleTranslate(intent, text);
        break;
      default:
        // AI 자유 대화 제거 — 매칭되지 않은 명령은 안내 후 종료
        result = '잘 이해하지 못했습니다, 주인님. 다시 말씀해 주세요.';
        break;
    }

    // 결과 표시 및 음성 출력
    responseText.textContent = result;
    setStatus('응답 중...');
    orb.className = 'speaking';
    await speak(result);

    // 유튜브 검색 결과가 있으면 TTS 직후 인앱 플레이어로 재생
    const videoId = consumePendingVideoId();
    if (videoId) {
      playInPlayer(videoId);
    }

    // 외부 페이지 열기가 큐에 있으면 처리
    // - iOS PWA(standalone): 사용자가 anchor를 직접 탭해야 Safari로 빠짐
    // - 그 외(Android/desktop): 자동 click 트리거. 사용자가 화면에 머물면 버튼으로도 다시 열 수 있음
    const externalUrl = consumePendingExternal();
    if (externalUrl) {
      externalOpenBtn.href = externalUrl;
      externalOpenBtn.hidden = false;
      if (!isIosStandalonePwa) {
        externalOpenBtn.click();
      }
    }
  } catch (err) {
    handleError(err);
  }

  orb.className = 'idle';
  setStatus('대기 중');
  startWakeWordDetection();
}

/**
 * 상태 텍스트 업데이트
 * @param {string} msg
 */
function setStatus(msg) {
  statusText.textContent = msg;
  // 상태 메시지에 따라 CSS 클래스를 적용
  if (msg === '듣는 중...') {
    statusText.className = 'listening';
  } else if (msg === '처리 중...') {
    statusText.className = 'thinking';
  } else if (msg === '응답 중...') {
    statusText.className = 'speaking';
  } else {
    statusText.className = '';
  }
}

/**
 * 에러 처리
 * @param {Error} err
 */
function handleError(err) {
  console.error('[JARVIS]', err);
  responseText.textContent = '오류가 발생했습니다: ' + err.message;
}

/**
 * 시계 업데이트
 */
function updateClock() {
  const now = new Date();
  timeDisplay.textContent = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 앱 시작
document.addEventListener('DOMContentLoaded', init);
