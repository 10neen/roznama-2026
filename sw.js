const cacheName = 'saidi-roznama-2026';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './saidi-logo.png'
];

// تثبيت ملفات الموقع في ذاكرة الهاتف
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// جلب الملفات من الكاش في حال عدم وجود إنترنت
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
