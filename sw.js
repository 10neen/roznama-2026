const cacheName = 'saidi-roznama-2026-v3'; 
const assets = [
  './',
  './index.html',
  './style.css',  // شلنا الـ v=5 من هنا
  './script.js',   // شلنا الـ v=5 من هنا
  './saidi-logo.png',
  './manifest.json',
  './prayer_data.js', // مهم جداً تضيف ملفات البيانات هنا عشان يشتغل أوفلاين
  './hijri_data.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      // استخدمنا cache.addAll والأسماء لازم تكون مطابقة للملفات في الفولدر
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
