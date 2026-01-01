// إحداثيات بشتيل - الجيزة
const LAT = 30.07; const LNG = 31.21;

// مصفوفة المناسبات لعام 2026 (تلوين مستمر طوال فترة المناسبة)
const holidays = [
    { name: "شهر رمضان المبارك", d: 18, m: 2, y: 2026, type: "ramadan", duration: 30 },
    { name: "عيد الفطر المبارك", d: 20, m: 3, y: 2026, type: "eid", duration: 3 },
    { name: "العشر من ذي الحجة ووقفة عرفات", d: 17, m: 5, y: 2026, type: "ramadan", duration: 10 },
    { name: "عيد الأضحى المبارك", d: 27, m: 5, y: 2026, type: "eid", duration: 4 },
    { name: "المولد النبوي الشريف", d: 25, m: 8, y: 2026, type: "ramadan", duration: 1 }
];

const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function updateApp() {
    const now = new Date();
    
    // 1. تحديث الساعة (خط كبير)
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('clock').innerText = `${h % 12 || 12}:${m}:${s}`;
    document.getElementById('ampm').innerText = h >= 12 ? "مساءً" : "صباحاً";

    // 2. تلوين الورقة حسب المناسبة (احتفال كامل)
    const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentEvent = holidays.find(ev => {
        const start = new Date(ev.y, ev.m - 1, ev.d);
        const end = new Date(ev.y, ev.m - 1, ev.d + ev.duration);
        return todayStr >= start && todayStr < end;
    });

    const mainLeaf = document.getElementById('mainLeaf');
    const banner = document.getElementById('eventBanner');
    
    mainLeaf.className = 'calendar-leaf';
    if (currentEvent) {
        mainLeaf.classList.add(currentEvent.type + '-theme'); // إضافة ثيم رمضان أو العيد
        banner.style.display = 'block';
        banner.innerText = currentEvent.name;
    } else {
        banner.style.display = 'none';
    }

    // 3. ملء بيانات الورقة الرئيسية
    document.getElementById('dayName').innerText = weekDays[now.getDay()];
    document.getElementById('mDay').innerText = now.getDate();
    document.getElementById('mMonth').innerText = monthsAr[now.getMonth()];

    // التاريخ الهجري الرئيسي بدقة أم القرى
    const hDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', {day:'numeric', month:'long'}).format(now);
    const hParts = hDate.split(' ');
    document.getElementById('hDay').innerText = hParts[0];
    document.getElementById('hMonth').innerText = hParts[1];

    calculatePrayers(now);
}

// دالة رسم الجدول مع إضافة التاريخ الهجري الصغير تحت كل يوم ميلادي
let viewDate = new Date(2026, 0, 1);
function renderCalendar() {
    const grid = document.getElementById('daysGrid');
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
        
        // حساب اليوم الهجري لهذا المربع الصغير
        const hijriDay = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', {day:'numeric'}).format(currentCheck);
        
        const event = holidays.find(ev => {
            const start = new Date(ev.y, ev.m - 1, ev.d);
            const end = new Date(ev.y, ev.m - 1, ev.d + ev.duration);
            return currentCheck >= start && currentCheck < end;
        });

        let cls = "day-card";
        if (event) cls += ` ${event.type}-day`; // تلوين الخانة (أخضر لرمضان، وردي للعيد)
        if (new Date().toDateString() === currentCheck.toDateString()) cls += " today";
        
        grid.innerHTML += `
            <div class="${cls}">
                <span class="m-num">${d}</span>
                <span class="h-num">${hijriDay}</span>
            </div>`;
    }
}

// دالة الصلاة (نفس معادلاتك الدقيقة)
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

// أزرار التنقل والمشاركة
document.getElementById('prevMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };
document.getElementById('shareBtn').onclick = () => {
    const text = "تطبيق نتيجة الصعيدي 2026 - مواقيت الصلاة والنتيجة بدقة:";
    if (navigator.share) navigator.share({ title: 'نتيجة الصعيدي', text: text, url: window.location.href });
    else window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`);
};

setInterval(updateApp, 1000);
updateApp();
renderCalendar();


