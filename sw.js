// 1. تغيير اسم الكاش (إضافة v2) بيجبر المتصفح يمسح القديم ويحمل الجديد
const cacheName = 'saidi-roznama-2026-v2'; 
const assets = [
  './',
  './index.html',
  './style.css?v=5', // ربطنا نفس الإصدار اللي في الـ HTML
  './script.js?v=5',
  './saidi-logo.png',
  './manifest.json',
];

// تثبيت الملفات
self.addEventListener('install', e => {
  // skipWaiting بيخلي التحديث يشتغل فوراً أول ما يترفع
  self.skipWaiting();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// تفعيل الكاش الجديد ومسح القديم تماماً
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
});

// جلب الملفات (استراتيجية: الشبكة أولاً ثم الكاش)
// دي أفضل عشان التحديثات تظهر فوراً لو في إنترنت
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
