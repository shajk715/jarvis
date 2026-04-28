// JARVIS Service Worker - 오프라인 캐싱
const CACHE_VERSION = 'jarvis-v4';
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
  '/core/gemini.js',
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
  const isSameOrigin = url.origin === self.location.origin;

  // 외부 오리진(youtube.com 등)으로의 네비게이션은 SW가 절대 가로채면 안 됨
  // → 모바일 PWA에서 OS가 외부 앱(YouTube)으로 핸드오프하도록 양보
  if (!isSameOrigin && event.request.mode === 'navigate') {
    return;
  }

  // 외부 오리진 fetch(XHR)은 그대로 네트워크
  if (!isSameOrigin) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 같은 오리진의 /api/* 도 항상 네트워크
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 정적 자산은 캐시 우선
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
