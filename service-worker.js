// JARVIS Service Worker - 오프라인 캐싱
const CACHE_VERSION = 'jarvis-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/auth.js',
  '/config.js',
  '/manifest.json',
  '/core/wakeWord.js',
  '/core/stt.js',
  '/core/tts.js',
  '/core/claude.js',
  '/features/schedule.js',
  '/features/memo.js',
  '/features/timer.js',
  '/features/briefing.js',
  '/features/youtube.js',
  '/utils/intentParser.js',
  '/utils/storage.js',
  '/lib/supabase.js',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// 설치: 정적 자산 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] 일부 자산 캐싱 실패:', err);
      });
    })
  );
  self.skipWaiting();
});

// 활성화: 이전 캐시 제거
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 요청 처리
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API 요청 (Claude/YouTube/Supabase)은 항상 네트워크 우선
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('anthropic.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('youtube.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 정적 자산은 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // 동일 출처 자산만 추가 캐싱
          if (response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // 오프라인이고 네비게이션 요청이면 index.html로 폴백
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
