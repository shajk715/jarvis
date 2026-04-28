// 유튜브 음악 검색 모듈 - Vercel 서버사이드 프록시 경유
// 검색만 서버에서 하고, 재생은 youtube.com 으로 직접 이동

let pendingNavigation = null;

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
    pendingNavigation = `https://www.youtube.com/watch?v=${video.id}`;
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
 * 마지막 검색 결과의 유튜브 URL을 가져오고 큐를 비움
 * (TTS 응답 후 페이지 이동에 사용)
 */
export function consumePendingNavigation() {
  const url = pendingNavigation;
  pendingNavigation = null;
  return url;
}
