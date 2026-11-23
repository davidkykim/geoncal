// 건캘 오프라인 지원: 앱 화면 파일은 네트워크 우선, 끊기면 저장해 둔 사본을 쓴다.
// 일정 데이터(Supabase)는 여기서 다루지 않는다. 앱이 기기에 따로 저장한다.
const CACHE = "geonkal-v3";
const SHELL = ["./", "index.html", "supabase.js", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "widget.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("geonkal-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.hostname.endsWith("supabase.co")) return;
  if (u.pathname.includes("/gyeongoe/")) return; // 경외와 거룩 앱은 자기 sw.js가 맡는다
  if (u.pathname.includes("/metronome/")) return; // 메트로놈 앱은 자기 sw.js가 맡는다
  if (u.pathname.includes("/salary/")) return; // 급여 계산기 앱은 자기 sw.js가 맡는다
  if (u.pathname.includes("/worship/")) return; // 찬양팀 앱은 자기 sw.js가 맡는다
  const cacheable = u.origin === location.origin || /cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.hostname);
  if (!cacheable) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
