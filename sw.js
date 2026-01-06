// غيرنا الاسم لـ v2 عشان الموبايل يعرف إن فيه تحديث جديد
const cacheName = 'saidi-roznama-v2'; 
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './saidi-logo.png',
  './manifest.json',
];

// تثبيت ملفات الموقع
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
  // سطر مهم عشان التحديث يشتغل فوراً
  self.skipWaiting(); 
});

// جلب الملفات (نفس الكود بتاعك)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});

// تنظيف الكاش القديم
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
