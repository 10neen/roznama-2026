// --- الإعدادات العامة ---
const LAT = 30.07; 
const LNG = 31.21;
const HIJRI_OFFSET = 0; 

const holidays = [
    { name: "شهر رمضان المبارك", d: 18, m: 2, y: 2026, type: "ramadan", duration: 30 },
    { name: "عيد الفطر المبارك", d: 20, m: 3, y: 2026, type: "eid", duration: 3 },
    { name: "العشر من ذي الحجة ووقفة عرفات", d: 17, m: 5, y: 2026, type: "ramadan", duration: 10 },
    { name: "عيد الأضحى المبارك", d: 27, m: 5, y: 2026, type: "eid", duration: 4 },
    { name: "المولد النبوي الشريف", d: 25, m: 8, y: 2026, type: "ramadan", duration: 1 }
];

const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function getHijriDetails(date) {
    let jdDate = new Date(date);
    jdDate.setDate(jdDate.getDate() + HIJRI_OFFSET);
    let day = jdDate.getDate(), month = jdDate.getMonth() + 1, year = jdDate.getFullYear();
    if (month < 3) { year -= 1; month += 12; }
    let a = Math.floor(year / 100), b = 2 - a + Math.floor(a / 4);
    let jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
    let z = Math.floor(jd + 0.5), cyc = Math.floor((z - 1948439.5) / 10631), l = z - 1948439.5 - cyc * 10631;
    let j = Math.floor((l - 0.5) / 354.36667), m = Math.floor((l - Math.floor(j * 354.36667) + 28.5) / 29.5);
    let d = Math.floor(l - Math.floor(j * 354.36667) - Math.floor((m - 1) * 29.5) + 0.5);
    const islamicMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    return { day: d, month: islamicMonths[m - 1] };
}

function updateApp() {
    const now = new Date();
    
    // 1. الساعة
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('clock').innerText = `${h % 12 || 12}:${m}:${s}`;
    document.getElementById('ampm').innerText = h >= 12 ? "مساءً" : "صباحاً";

    // 2. المناسبات والعد التنازلي
    updateCountdown(now);

    // 3. الورقة الرئيسية
    document.getElementById('dayName').innerText = weekDays[now.getDay()];
    document.getElementById('mDay').innerText = now.getDate();
    document.getElementById('mMonth').innerText = monthsAr[now.getMonth()];
    const hData = getHijriDetails(now);
    document.getElementById('hDay').innerText = hData.day;
    document.getElementById('hMonth').innerText = hData.month;

    calculatePrayers(now);
}

function updateCountdown(now) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let nextEvent = null;
    let minDiff = Infinity;

    holidays.forEach(ev => {
        const evDate = new Date(ev.y, ev.m - 1, ev.d);
        const diff = evDate - today;
        if (diff >= 0 && diff < minDiff) {
            minDiff = diff;
            nextEvent = ev;
        }
    });

    if (nextEvent) {
        const days = Math.ceil(minDiff / (1000 * 60 * 60 * 24));
        document.getElementById('nextEventName').innerText = `المتبقي على ${nextEvent.name}`;
        document.getElementById('daysLeft').innerText = days === 0 ? "اليوم!" : days;
    }
}

// دالة المشاركة المُصلحة
function shareApp() {
    const shareData = {
        title: 'نتيجة الصعيدي 2026',
        text: 'تابع مواقيت الصلاة والتاريخ الهجري والمناسبات بدقة عبر تطبيق نتيجة الصعيدي 2026:',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(err => console.log('Error sharing', err));
    } else {
        // بديل في حال كان المتصفح لا يدعم Share API (مثل متصفح فيسبوك القديم)
        const waUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`;
        window.open(waUrl, '_blank');
    }
}

// ربط زر المشاركة (تأكد أن id الزر هو shareBtn)
if(document.getElementById('shareBtn')) {
    document.getElementById('shareBtn').onclick = shareApp;
}

// --- باقي الدوال (renderCalendar و calculatePrayers) تبقى كما هي في الكود السابق ---

let viewDate = new Date(2026, 0, 1);
function renderCalendar() {
    const grid = document.getElementById('daysGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    document.getElementById('explorerTitle').innerText = `${monthsAr[month]} ${year}`;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let offset = (firstDay + 1) % 7; 
    for(let i=0; i<offset; i++) grid.innerHTML += `<div class="day-card empty"></div>`;
    for(let d=1; d<=daysInMonth; d++) {
        const currentCheck = new Date(year, month, d);
        const hData = getHijriDetails(currentCheck);
        const event = holidays.find(ev => {
            const start = new Date(ev.y, ev.m - 1, ev.d);
            const end = new Date(ev.y, ev.m - 1, ev.d + ev.duration);
            return currentCheck >= start && currentCheck < end;
        });
        let cls = "day-card";
        if (event) cls += ` ${event.type}-day`;
        if (new Date().toDateString() === currentCheck.toDateString()) cls += " today";
        grid.innerHTML += `<div class="${cls}"><span class="m-num">${d}</span><span class="h-num">${hData.day}</span></div>`;
    }
}

function calculatePrayers(date) {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const tz = (date.getMonth() > 3 && date.getMonth() < 10) ? 3 : 2; 
    const gamma = 2 * Math.PI / 365 * (dayOfYear - 1);
    const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma);
    const transit = 720 - (4 * (LNG - 15 * tz)) + eqtime;
    const getHA = (angle) => {
        const phi = LAT * Math.PI / 180;
        const cosHA = (Math.sin(angle * Math.PI / 180) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
        return Math.acos(Math.max(-1, Math.min(1, cosHA))) * 180 / Math.PI * 4;
    };
    const format = (min) => {
        const h = Math.floor(min / 60) % 12 || 12;
        const m = Math.floor(min % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    };
    document.getElementById("fajr").innerText = format(transit - getHA(-19.5));
    document.getElementById("dhuhr").innerText = format(transit);
    document.getElementById("asr").innerText = format(transit + getHA(90 - (Math.atan(1 + Math.tan(Math.abs(LAT - (decl * 180 / Math.PI)) * Math.PI / 180)) * 180 / Math.PI)));
    document.getElementById("maghrib").innerText = format(transit + getHA(-0.833));
    document.getElementById("isha").innerText = format(transit + getHA(-17.5));
}

document.getElementById('prevMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };

setInterval(updateApp, 1000);
updateApp();
renderCalendar();
