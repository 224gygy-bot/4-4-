/* 꼬마 탐정 스도쿠 - 오프라인 지원
   인터넷이 되면 항상 최신 파일을 받고, 안 되면 저장해 둔 파일로 실행합니다. */
const CACHE = "kkoma-sudoku-v2";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(r => r || (e.request.mode === "navigate" ? caches.match("./index.html") : undefined))
      )
  );
});
