// 유튜브 음악 검색 모듈 - Vercel 서버사이드 프록시 경유
// 검색만 서버에서 하고, 재생은 OS별 딥링크로 YouTube 앱/웹을 직접 호출

let pendingVideoId = null;

/**
 * 유튜브 관련 명령 처리
 * @param {Object} intent - 파싱된 의도 객체
 * @param {string} rawText - 원본 음성 텍스트
 * @returns {Promise<string>} 응답 텍스트
 */
export async function handleYoutube(intent, rawText) {
  const subAction = intent.subAction;

  if (subAction === 'stop' || subAction === 'pause') {
    // 외부 유튜브 페이지/앱은 우리가 제어할 수 없음
    return '유튜브 앱에서 직접 멈춰주세요, 주인님.';
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
 * 유튜브 검색
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

/**
 * 디바이스에 맞춰 YouTube 앱(설치 시) 또는 웹페이지를 연다.
 * PWA 표준 동작: anchor 클릭이 location.href 보다 더 안정적으로 외부 핸들러를 트리거
 * - Android: intent URL → YouTube 앱 강제 호출, 미설치 시 브라우저 폴백
 * - iOS: youtube:// 스킴 → 앱 호출, 미설치 시 1.2초 후 웹으로 폴백
 * - Desktop/기타: 새 탭에서 웹페이지
 */
export function openYoutubeApp(videoId) {
  const ua = navigator.userAgent || '';
  const webUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const triggerLink = (href, target) => {
    const a = document.createElement('a');
    a.href = href;
    if (target) a.target = target;
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (/Android/i.test(ua)) {
    const fallback = encodeURIComponent(webUrl);
    const intentUrl = `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;S.browser_fallback_url=${fallback};end`;
    triggerLink(intentUrl);
    return;
  }

  if (/iPhone|iPad|iPod/i.test(ua)) {
    triggerLink(`youtube://www.youtube.com/watch?v=${videoId}`);
    setTimeout(() => {
      if (!document.hidden) {
        triggerLink(webUrl, '_blank');
      }
    }, 1200);
    return;
  }

  // 데스크톱/기타
  triggerLink(webUrl, '_blank');
}
