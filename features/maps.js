// 카카오맵 연동 모듈 - 맛집/장소 검색 + 길 안내
import CONFIG from '../config.js';

/**
 * 지도 관련 명령 처리
 * @param {Object} intent - 파싱된 의도 객체
 * @param {string} rawText - 원본 음성 텍스트
 * @returns {Promise<string>} 응답 텍스트
 */
export async function handleMaps(intent, rawText) {
  try {
    // 현재 위치 가져오기
    let location;
    try {
      location = await getCurrentLocation();
    } catch (e) {
      console.warn('[Maps] 위치 정보를 가져올 수 없어 기본 위치(서울) 사용:', e);
      location = { lat: 37.5665, lng: 126.978 }; // 서울시청 기본값
    }

    // 검색어 추출
    const keyword = intent.params?.keyword
      || rawText.replace(/찾아\s*(줘|줘라)?|검색해?\s*(줘)?|어디\s*(야|있어|에)?|알려\s*(줘)?|근처|주변/g, '').trim()
      || rawText;

    if (!keyword) {
      return '어떤 장소를 찾을까요, 주인님?';
    }

    // 카카오 로컬 검색
    const places = await searchPlaces(keyword, location.lat, location.lng);

    if (places.length === 0) {
      return `주인님, 근처에서 "${keyword}" 관련 장소를 찾지 못했습니다.`;
    }

    // 상위 3개 결과
    const top3 = places.slice(0, 3);
    const names = top3.map(p => p.place_name).join(', ');

    // 첫 번째 결과에 대한 길 안내 링크 생성
    const first = top3[0];
    const mapLink = getKakaoMapLink(first.place_name, first.y, first.x);

    return `주인님, 근처에 ${names}이 있습니다. 가장 가까운 ${first.place_name}까지 길 안내가 필요하시면 말씀해주세요.`;
  } catch (error) {
    console.error('[Maps] 장소 검색 실패:', error);
    return '죄송합니다 주인님, 장소 검색 중 문제가 발생했습니다.';
  }
}

/**
 * 카카오 로컬 키워드 검색
 * @param {string} query - 검색어
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {Promise<Array>} 검색 결과 목록
 */
export async function searchPlaces(query, lat, lng) {
  const params = new URLSearchParams({
    query,
    x: lng.toString(),
    y: lat.toString(),
    radius: '2000',
    sort: 'distance',
  });

  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
    {
      headers: {
        Authorization: `KakaoAK ${CONFIG.KAKAO_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Kakao API error: ${response.status}`);
  }

  const data = await response.json();
  return data.documents || [];
}

/**
 * 현재 위치 가져오기
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저에서는 위치 정보를 지원하지 않습니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`위치 정보를 가져올 수 없습니다: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5분 캐시
      }
    );
  });
}

/**
 * 카카오맵 길 안내 딥링크 생성
 * @param {string} placeName - 장소 이름
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @returns {string} 카카오맵 딥링크 URL
 */
export function getKakaoMapLink(placeName, lat, lng) {
  return `https://map.kakao.com/link/to/${encodeURIComponent(placeName)},${lat},${lng}`;
}
