// 유튜브 음악 검색 + 인앱 IFrame 플레이어 모듈
// 검색은 Vercel 서버사이드, 재생은 YouTube IFrame Player API로 LUMI 화면 안에서

let pendingVideoId = null;   // 검색 결과 → TTS 종료 후 app.js가 consume
let player = null;
let playerReady = false;
let queuedVideoId = null;    // 플레이어 준비 전에 들어온 재생 요청
let containerEl = null;

/**
 * YouTube IFrame Player 초기화
 * - <div id="youtube-player"></div>를 iframe으로 교체
 * - <div id="player-container">를 표시/숨김
 * 앱 시작 시 한 번 호출
 */
export function initYoutubePlayer() {
  containerEl = document.getElementById('player-container');
  const closeBtn = document.getElementById('player-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', stopPlayer);
  }

  // YouTube IFrame API 스크립트 로드 (한 번만)
  if (!window.YT && !document.getElementById('yt-iframe-api-script')) {
    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  // API 준비 콜백 (글로벌)
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('youtube-player', {
      width: '100%',
      height: '100%',
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => {
          playerReady = true;
          if (queuedVideoId) {
            showPlayer();
            player.loadVideoById(queuedVideoId);
            queuedVideoId = null;
          }
        },
        onError: (e) => {
          console.warn('[YouTube] 플레이어 에러:', e.data);
        },
      },
    });
  };
}

function showPlayer() {
  if (containerEl) containerEl.hidden = false;
}

function hidePlayer() {
  if (containerEl) containerEl.hidden = true;
}

/**
 * LUMI 화면 안에서 영상 재생 (TTS 종료 후 호출)
 */
export function playInPlayer(videoId) {
  if (!playerReady || !player) {
    queuedVideoId = videoId;
    return;
  }
  showPlayer();
  player.loadVideoById(videoId);
}

/** 재생 정지 + 플레이어 닫기 */
export function stopPlayer() {
  if (player && playerReady) {
    try { player.stopVideo(); } catch (e) { /* ignore */ }
  }
  hidePlayer();
}

/** 일시정지 */
export function pausePlayerVideo() {
  if (player && playerReady) {
    try { player.pauseVideo(); } catch (e) { /* ignore */ }
  }
}

/**
 * 유튜브 관련 음성 명령 처리
 */
export async function handleYoutube(intent, rawText) {
  const subAction = intent.subAction;

  if (subAction === 'stop') {
    stopPlayer();
    return '음악을 정지했습니다, 주인님.';
  }

  if (subAction === 'pause') {
    pausePlayerVideo();
    return '일시정지했습니다, 주인님.';
  }

  const query =
    intent.params?.query ||
    rawText.replace(/틀어\s*(줘|줘라)?|재생해?\s*(줘)?|들려\s*(줘)?/g, '').trim();
  if (!query) {
    return '무엇을 재생할까요, 주인님?';
  }

  try {
    const results = await searchYoutube(query);
    if (results.length === 0) {
      return `"${query}" 검색 결과가 없습니다, 주인님.`;
    }

    const video = results[0];
    pendingVideoId = video.id;
    return `${video.title}을 재생합니다, 주인님.`;
  } catch (error) {
    console.error('[YouTube] 검색 실패:', error);
    return '유튜브 검색 중 문제가 발생했습니다, 주인님.';
  }
}

/**
 * 유튜브 검색 (Vercel 프록시)
 */
export async function searchYoutube(query, maxResults = 5) {
  const params = new URLSearchParams({
    q: query,
    maxResults: maxResults.toString(),
  });

  const response = await fetch(`/api/youtube?${params}`);
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();
  return (data.items || []).map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.default?.url,
  }));
}

/**
 * 마지막 검색 결과의 videoId를 가져오고 큐를 비움
 */
export function consumePendingVideoId() {
  const id = pendingVideoId;
  pendingVideoId = null;
  return id;
}
