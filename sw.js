// Service Worker — 网络优先，离线兜底
const CACHE_NAME = 'pet-app-v3';

self.addEventListener('install', (e) => {
  // 跳过等待，立即激活新版
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // 清理所有旧版本缓存
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', (e) => {
  // 网络优先：先尝试从网络获取，失败了再用缓存
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 把网络响应存到缓存
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => {
        // 离线时从缓存读取
        return caches.match(e.request);
      })
  );
});
