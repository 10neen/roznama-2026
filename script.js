// --- الإعدادات العامة ---
const LAT = 30.07; 
const LNG = 31.21;
// تعديل التاريخ الهجري يدوياً: (0 لا تغيير، 1 زيادة يوم، -1 نقص يوم)
const HIJRI_OFFSET = 0; 

// مصفوفة المناسبات لعام 2026
const holidays = [
    { name: "شهر رمضان المبارك", d: 18, m: 2, y: 2026, type: "ramadan", duration: 30 },
    { name: "عيد الفطر المبارك", d: 20, m: 3, y: 2026, type: "eid", duration: 3 },
    { name: "العشر من ذي الحجة ووقفة عرفات", d: 17, m: 5, y: 2026, type: "ramadan", duration: 10 },
    { name: "عيد الأضحى المبارك", d: 27, m: 5, y: 2026, type: "eid", duration: 4 },
    { name: "المولد النبوي الشريف", d: 25, m: 8, y: 2026, type: "ramadan", duration: 1 }
];

const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// دالة مساعدة للحصول على التاريخ الهجري بدقة وضمان عدم التحول لميلادي
function getHijriDetails(date) {
    // إضافة الإزاحة اليدوية
    const adjusted = new Date(date);
    adjusted.setDate(date.getDate() + HIJRI_OFFSET);

    // استخدام nu-latn لضمان أرقام إنجليزية/لاتينية لسهولة التعامل، و ar-SA للأسماء العربية
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const parts = formatter.formatToParts(adjusted);
    let res = { day: "", month: "" };
    parts.forEach(p => {
        if (p.type === 'day') res.day = p.value;
        if (p.type === 'month') res.month = p.value;
    });
    return res;
}

function updateApp() {
    const now = new Date();
    
    // 1. تحديث الساعة
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('clock').innerText = `${h % 12 || 12}:${m}:${s}`;
    document.getElementById('ampm').innerText = h >= 12 ? "مساءً" : "صباحاً";

    // 2. التحقق من المناسبات
    const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentEvent = holidays.find(ev => {
        const start = new Date(ev.y, ev.m - 1, ev.d);
        const end = new Date(ev.y, ev.m - 1, ev.d + ev.duration);
        return todayStr >= start && todayStr < end;
    });

    const mainLeaf = document.getElementById('mainLeaf');
    const banner = document.getElementById('eventBanner');
    
    if (mainLeaf) {
        mainLeaf.className = 'calendar-leaf';
        if (currentEvent) {
            mainLeaf.classList.add(currentEvent.type + '-theme');
            banner.style.display = 'block';
            banner.innerText = currentEvent.name;
        } else {
            banner.style.display = 'none';
        }
    }

    // 3. ملء بيانات الورقة الرئيسية
    document.getElementById('dayName').innerText = weekDays[now.getDay()];
    document.getElementById('mDay').innerText = now.getDate();
    document.getElementById('mMonth').innerText = monthsAr[now.getMonth()];

    // التاريخ الهجري الرئيسي مع التصحيح
    const hData = getHijriDetails(now);
    document.getElementById('hDay').innerText = hData.day;
    document.getElementById('hMonth').innerText = hData.month;

    calculatePrayers(now);
}

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
        
        // حساب اليوم الهجري لهذا المربع مع التصحيح
        const hData = getHijriDetails(currentCheck);
        
        const event = holidays.find(ev => {
            const start = new Date(ev.y, ev.m - 1, ev.d);
            const end = new Date(ev.y, ev.m - 1, ev.d + ev.duration);
            return currentCheck >= start && currentCheck < end;
        });

        let cls = "day-card";
        if (event) cls += ` ${event.type}-day`;
        if (new Date().toDateString() === currentCheck.toDateString()) cls += " today";
        
        grid.innerHTML += `
            <div class="${cls}">
                <span class="m-num">${d}</span>
                <span class="h-num">${hData.day}</span>
            </div>`;
    }
}

// دالة الصلاة (كما هي)
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

// المستمعات (Listeners)
document.getElementById('prevMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };

setInterval(updateApp, 1000);
updateApp();
renderCalendar();
