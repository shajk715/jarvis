// 유튜브 음악 재생 모듈 - YouTube Data API v3
import CONFIG from '../config.js';

// 현재 재생 상태 관리
let currentVideoId = null;

/**
 * 유튜브 관련 명령 처리
 * @param {Object} intent - 파싱된 의도 객체
 * @param {string} rawText - 원본 음성 텍스트
 * @returns {Promise<string>} 응답 텍스트
 */
export async function handleYoutube(intent, rawText) {
  const subAction = intent.subAction;

  if (subAction === 'stop') {
    stopVideo();
    return '음악을 멈추겠습니다, 주인님.';
  }

  if (subAction === 'pause') {
    pauseVideo();
    return '일시정지했습니다, 주인님.';
  }

  // 기본: 검색 후 재생
  const query = intent.params?.query || rawText.replace(/틀어\s*(줘|줘라)?|재생해?\s*(줘)?|들려\s*(줘)?/g, '').trim();
  if (!query) {
    return '무엇을 재생할까요, 주인님?';
  }

  try {
    const results = await searchYoutube(query);
    if (results.length === 0) {
      return `"${query}" 검색 결과가 없습니다, 주인님.`;
    }

    const video = results[0];
    playVideo(video.id);
    return `${video.title}을 재생합니다, 주인님.`;
  } catch (error) {
    console.error('[YouTube] 검색 실패:', error);
    return '유튜브 검색 중 문제가 발생했습니다, 주인님.';
  }
}

/**
 * 유튜브 검색
 * @param {string} query - 검색어
 * @param {number} [maxResults=5] - 최대 결과 수
 * @returns {Promise<Array>} 검색 결과 목록
 */
export async function searchYoutube(query, maxResults = 5) {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: query,
    key: CONFIG.YOUTUBE_API_KEY,
    maxResults: maxResults.toString(),
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();
  return (data.items || []).map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.default?.url,
  }));
}

/**
 * 유튜브 영상 재생 (임베드 iframe)
 * @param {string} videoId - 영상 ID
 */
export function playVideo(videoId) {
  currentVideoId = videoId;
  let playerDiv = document.getElementById('youtube-player');

  if (!playerDiv) {
    playerDiv = document.createElement('div');
    playerDiv.id = 'youtube-player';
    document.body.appendChild(playerDiv);
  }

  playerDiv.hidden = false;
  playerDiv.innerHTML = `<iframe
    width="100%"
    height="250"
    src="https://www.youtube.com/embed/${videoId}?autoplay=1"
    frameborder="0"
    allow="autoplay; encrypted-media"
    allowfullscreen
    style="border-radius: 12px;"
  ></iframe>`;
}

/**
 * 재생 중지 - iframe 제거
 */
function stopVideo() {
  const playerDiv = document.getElementById('youtube-player');
  if (playerDiv) {
    playerDiv.innerHTML = '';
    playerDiv.hidden = true;
  }
  currentVideoId = null;
}

/**
 * 일시정지 (iframe 교체로 구현)
 */
function pauseVideo() {
  const playerDiv = document.getElementById('youtube-player');
  if (playerDiv && currentVideoId) {
    // autoplay 없이 현재 위치에서 멈춤
    playerDiv.innerHTML = `<iframe
      width="100%"
      height="250"
      src="https://www.youtube.com/embed/${currentVideoId}"
      frameborder="0"
      allow="encrypted-media"
      allowfullscreen
      style="border-radius: 12px;"
    ></iframe>`;
  }
}
