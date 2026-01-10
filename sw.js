const cacheName = 'saidi-roznama-2026-v5'; 
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './saidi-logo.png',
  './manifest.json',
  './prayer_data.js',
  './hijri_data.js'
];

// 1. مرحلة التثبيت: تخزين الملفات الأساسية
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('تم حفظ ملفات النتيجة في الذاكرة المؤقتة');
      return cache.addAll(assets);
    })
  );
});

// 2. مرحلة التفعيل: تنظيف الكاش القديم
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
});

// 3. جلب البيانات: استراتيجية ذكية للعمل بدون إنترنت
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cacheRes => {
      // لو الملف موجود في الكاش (الذاكرة) هاته، لو مش موجود روح حمله من الإنترنت
      return cacheRes || fetch(e.request).then(fetchRes => {
        return caches.open(cacheName).then(cache => {
          // حفظ الملفات الجديدة تلقائياً (مثل أي صور يضيفها المستخدم لاحقاً)
          if (e.request.url.startsWith('http')) {
             cache.put(e.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      // لو مفيش إنترنت والملف مش في الكاش، ممكن تظهر صفحة "أوفلاين" هنا
      if (e.request.url.indexOf('.html') > -1) {
        return caches.match('./index.html');
      }
    })
  );
});

