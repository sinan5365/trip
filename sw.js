/* 출장기록 오프라인 실행용 (앱 화면을 휴대폰에 저장)
 * 앱을 수정해 다시 올릴 때는 VERSION 숫자를 하나 올리세요. */
const VERSION = 'v1';
const CACHE = 'trip-app-' + VERSION;
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('trip-app-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // 서버(Apps Script)·구글 드라이브 사진 등 다른 주소는 건드리지 않음
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // 인터넷이 되면 최신 화면, 안 되면 저장해 둔 화면
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
