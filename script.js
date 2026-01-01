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

/**
 * دالة التحويل الحسابي القاطع (تمنع التحول لميلادي نهائياً)
 */
function getHijriDetails(date) {
    let jdDate = new Date(date);
    // إضافة الإزاحة اليدوية للتصحيح
    jdDate.setDate(jdDate.getDate() + HIJRI_OFFSET);

    let day = jdDate.getDate();
    let month = jdDate.getMonth() + 1;
    let year = jdDate.getFullYear();

    if (month < 3) {
        year -= 1;
        month += 12;
    }

    let a = Math.floor(year / 100);
    let b = 2 - a + Math.floor(a / 4);
    let jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;

    let z = Math.floor(jd + 0.5);
    let cyc = Math.floor((z - 1948439.5) / 10631);
    let l = z - 1948439.5 - cyc * 10631;
    let j = Math.floor((l - 0.5) / 354.36667);
    let m = Math.floor((l - Math.floor(j * 354.36667) + 28.5) / 29.5);
    let d = Math.floor(l - Math.floor(j * 354.36667) - Math.floor((m - 1) * 29.5) + 0.5);

    const islamicMonths = [
        "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
        "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
    ];

    return {
        day: d,
        month: islamicMonths[m - 1]
    };
}

function updateApp() {
    const now = new Date();
    
    // 1. تحديث الساعة
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('clock').innerText = `${h % 12 || 12}:${m}:${s}`;
    document.getElementById('ampm').innerText = h >= 12 ? "مساءً" : "صباحاً";

    // 2. التحقق من المناسبات (تلوين الثيم)
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

    // 3. ملء بيانات الورقة الرئيسية (ميلادي)
    document.getElementById('dayName').innerText = weekDays[now.getDay()];
    document.getElementById('mDay').innerText = now.getDate();
    document.getElementById('mMonth').innerText = monthsAr[now.getMonth()];

    // 4. التاريخ الهجري الرئيسي (من الدالة الحسابية)
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
        
        // حساب اليوم الهجري لهذا المربع
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

// دالة حساب مواقيت الصلاة
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

// أزرار التحكم
document.getElementById('prevMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };

// بدء التشغيل
setInterval(updateApp, 1000);
updateApp();
renderCalendar();
