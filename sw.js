const CACHE_NAME = 'saidi-cache-v2'; // قمنا بتغيير الإصدار لـ v2 لإجبار المتصفح على التحديث
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json', // أضفنا المانيفست للذاكرة
  './saidi-logo.png'
];

// التثبيت وحذف الكاش القديم تلقائياً
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); // يجعل التحديث مفعلاً فوراً دون انتظار إغلاق المتصفح
});

// تفعيل السيرفس وركر وتنظيف الكاش القديم (مهم جداً!)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
