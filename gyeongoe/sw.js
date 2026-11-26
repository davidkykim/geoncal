// 경외와 거룩 오프라인 지원: 앱 화면 파일은 네트워크 우선, 끊기면 저장해 둔 사본을 쓴다.
// 기록 데이터(Supabase)는 여기서 다루지 않는다. 앱이 기기에 따로 저장한다.
const CACHE = "gyeongoe-v6";
const SHELL = ["./", "index.html", "supabase.js", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "fonts/levelup-bold.woff2", "fonts/levelup-semibold.woff2"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("gyeongoe-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.hostname.endsWith("supabase.co")) return;
  const scope = new URL(self.registration.scope);
  const mine = u.origin === location.origin && u.pathname.startsWith(scope.pathname);
  const cacheable = mine || (/fonts\.(googleapis|gstatic)\.com/.test(u.hostname) || (u.hostname === "cdn.jsdelivr.net" && u.pathname.includes("/pretendard")));
  if (!cacheable) return;
  e.respondWith(
    // 앱 파일은 브라우저 저장본(최대 10분)을 건너뛰고 서버에 새 버전이 있는지 꼭 확인한다
    (mine ? fetch(new Request(e.request.url, { cache: "no-cache", credentials: "same-origin" })) : fetch(e.request)).then(r => {
      if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
