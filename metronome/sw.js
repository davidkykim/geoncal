// 예전 주소의 오프라인 캐시를 지우고 스스로 해제합니다 (메트로놈은 worshipteams.github.io/worshipteams/metronome/으로 이전)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('metronome-')) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll()) c.navigate(c.url);
})()));
