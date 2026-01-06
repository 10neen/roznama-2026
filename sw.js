const cacheName = 'saidi-roznama-2026';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './saidi-logo.png',
  './manifest.json', // إضافة ملف الـ manifest
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
      // إذا كان الملف في الكاش، يتم إرجاعه مباشرة، وإذا لم يكن يتم تحميله من الإنترنت
      return res || fetch(e.request).then(networkRes => {
        // تحديث الكاش عند الحصول على استجابة جديدة
        caches.open(cacheName).then(cache => {
          cache.put(e.request, networkRes.clone());
        });
        return networkRes;
      });
    })
  );
});

// تحديث الكاش عند تفعيل الخدمة
self.addEventListener('activate', e => {
  const cacheWhitelist = [cacheName];
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (!cacheWhitelist.includes(cache)) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

