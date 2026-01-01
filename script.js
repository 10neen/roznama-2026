// إحداثيات الموقع (القاهرة والجيزة)
const LAT = 30.07; 
const LNG = 31.21;

// دالة عبقرية لتحويل الأرقام لهندية (١، ٢، ٣) وإلزام المتصفح بها
function toAr(num) {
    if (num === undefined || num === null) return "";
    const id = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return num.toString().replace(/[0-9]/g, w => id[+w]);
}

// دالة لفرض التاريخ الهجري ومنع المتصفح من تحويله لميلادي
function getSafeHijri(date, options) {
    // ar-SA-u-ca-islamic-uma: تفرض اللغة العربية، تقويم أم القرى
    // nu-arab: تفرض الأرقام العربية (١، ٢، ٣) وتمنع الأرقام الإنجليزية
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-arab', options).format(date);
}

const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const holidays = [
    { name: "شهر رمضان المبارك", d: 18, m: 2, y: 2026, type: "ramadan", duration: 30 },
    { name: "عيد الفطر المبارك", d: 20, m: 3, y: 2026, type: "eid", duration: 3 },
    { name: "العشر من ذي الحجة ووقفة عرفات", d: 17, m: 5, y: 2026, type: "ramadan", duration: 10 },
    { name: "عيد الأضحى المبارك", d: 27, m: 5, y: 2026, type: "eid", duration: 4 },
    { name: "المولد النبوي الشريف", d: 25, m: 8, y: 2026, type: "ramadan", duration: 1 }
];

function updateApp() {
    const now = new Date();
    
    // تحديث الساعة الرقمية
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('clock').innerText = `${toAr(h % 12 || 12)}:${toAr(m)}`;
    document.getElementById('ampm').innerText = h >= 12 ? "مساءً" : "صباحاً";

    // التحقق من المناسبات لتغيير سمة (Theme) الورقة
    const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const event = holidays.find(ev => {
        const start = new Date(ev.y, ev.m - 1, ev.d);
        const end = new Date(ev.y, ev.m - 1, ev.d + ev.duration);
        return todayStr >= start && todayStr < end;
    });

    const mainLeaf = document.getElementById('mainLeaf');
    const banner = document.getElementById('eventBanner');
    
    if(event) {
        mainLeaf.className = `calendar-leaf ${event.type}-theme`;
        banner.style.display = 'block';
        banner.innerText = event.name;
    } else {
        mainLeaf.className = 'calendar-leaf';
        banner.style.display = 'none';
    }

    // تحديث التاريخ الميلادي
    document.getElementById('dayName').innerText = weekDays[now.getDay()];
    document.getElementById('mDay').innerText = toAr(now.getDate());
    document.getElementById('mMonth').innerText = monthsAr[now.getMonth()];

    // تحديث التاريخ الهجري (الحل القاطع للموبايل)
    document.getElementById('hDay').innerText = getSafeHijri(now, {day:'numeric'});
    document.getElementById('hMonth').innerText = getSafeHijri(now, {month:'long'});

    calculatePrayers(now);
}

// حساب مواقيت الصلاة (القاهرة والجيزة)
function calculatePrayers(date) {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const isDST = (date.getMonth() > 3 && date.getMonth() < 10); // توقيت صيفي تقريبي
    const tz = isDST ? 3 : 2; 

    const gamma = 2 * Math.PI / 365 * (dayOfYear - 1);
    const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma);
    const transit = 720 - (4 * (LNG - 15 * tz)) + eqtime;

    const getHA = (angle) => {
        const phi = LAT * Math.PI / 180;
        const cosHA = (Math.sin(angle * Math.PI / 180) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
        return Math.acos(Math.max(-1, Math.min(1, cosHA))) * 180 / Math.PI * 4;
    };

    const formatTime = (min) => {
        let h = Math.floor(min / 60) % 12 || 12;
        let m = Math.floor(min % 60).toString().padStart(2, '0');
        return toAr(h) + ":" + toAr(m);
    };

    document.getElementById("fajr").innerText = formatTime(transit - getHA(-19.5));
    document.getElementById("dhuhr").innerText = formatTime(transit);
    document.getElementById("asr").innerText = formatTime(transit + getHA(90 - (Math.atan(1 + Math.tan(Math.abs(LAT - (decl * 180 / Math.PI)) * Math.PI / 180)) * 180 / Math.PI)));
    document.getElementById("maghrib").innerText = formatTime(transit + getHA(-0.833));
    document.getElementById("isha").innerText = formatTime(transit + getHA(-17.5));
}

// استكشاف النتيجة (الجدول السفلي)
let viewDate = new Date(2026, 0, 1);
function renderCalendar() {
    const grid = document.getElementById('daysGrid');
    grid.innerHTML = '';
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    document.getElementById('explorerTitle').innerText = `${monthsAr[month]} ${toAr(year)}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let offset = (firstDay + 1) % 7; 

    for(let i=0; i<offset; i++) grid.innerHTML += `<div class="day-card empty"></div>`;

    for(let d = 1; d <= daysInMonth; d++) {
        const dObj = new Date(year, month, d);
        
        // التاريخ الهجري داخل الجدول (بالأرقام العربية)
        const hDay = getSafeHijri(dObj, {day:'numeric'});
        
        const ev = holidays.find(h => {
            const s = new Date(h.y, h.m - 1, h.d);
            const e = new Date(h.y, h.m - 1, h.d + h.duration);
            return dObj >= s && dObj < e;
        });

        let cls = "day-card" + (ev ? ` ${ev.type}-day` : "");
        if(new Date().toDateString() === dObj.toDateString()) cls += " today";

        grid.innerHTML += `
            <div class="${cls}">
                <span class="m-num">${toAr(d)}</span>
                <span class="h-num">${hDay}</span>
            </div>`;
    }
}

// التنقل بين الشهور
document.getElementById('prevMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };

// زر المشاركة
document.getElementById('shareBtn').onclick = () => {
    const text = "نتيجة الصعيدي ٢٠٢٦ - مواقيت الصلاة والمناسبات:";
    if (navigator.share) {
        navigator.share({ title: 'نتيجة الصعيدي', text: text, url: window.location.href });
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`);
    }
};

// التشغيل
setInterval(updateApp, 1000);
updateApp();
renderCalendar();
