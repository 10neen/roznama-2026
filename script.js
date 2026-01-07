// --- 1. الإعدادات الجغرافية لمدينة القاهرة ---
const LAT = 30.0444; 
const LNG = 31.2357;
let HIJRI_OFFSET = 0; // لضبط الرؤية الشرعية (مثلاً +1 أو -1)

let viewDate = new Date(2026, 0, 1); 

// المناسبات الرسمية لعام 2026
const holidays = [
    { name: "شهر رمضان", d: 18, m: 2, y: 2026, type: "ramadan", duration: 30 },
    { name: "عيد الفطر", d: 20, m: 3, y: 2026, type: "eid", duration: 3 },
    { name: "صيام العشر والوقفة", d: 17, m: 5, y: 2026, type: "hajj", duration: 9 }, 
    { name: "عيد الأضحى", d: 26, m: 5, y: 2026, type: "eid", duration: 4 },
    { name: "رأس السنة الهجرية", d: 16, m: 6, y: 2026, type: "event", duration: 1 },
    { name: "المولد النبوي الشريف", d: 25, m: 8, y: 2026, type: "event", duration: 1 }
];

const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// --- 2. دوال التواريخ (قبطي، هجري يدوي ثابت) ---

function getCopticDate(date) {
    const base = new Date(2025, 8, 11);
    const diff = Math.floor((date - base) / 86400000);
    const months = ["توت", "بابه", "هاتور", "كيهك", "طوبة", "أمشير", "برمهات", "برمودة", "بشنس", "بؤونة", "أبيب", "مسرى", "نسئ"];
    let day = (diff % 30) + 1;
    let monthIdx = Math.floor(diff / 30) % 13;
    return { d: day, m: months[monthIdx] };
}

// دالة هجرية حسابية لا تعتمد على نظام تشغيل الموبايل (حل مشكلة التحول لميلادي)
function getHijriDate(date) {
    let jd = Math.floor(date.getTime() / 86400000) + 2440588;
    let l = jd - 1948440 + 10632 + HIJRI_OFFSET;
    let n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
    l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    let m = Math.floor((24 * l) / 709);
    let d = l - Math.floor((709 * m) / 24);
    const months = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    return { d: d, m: months[m - 1] };
}

// --- 3. حساب مواقيت الصلاة ---

function calculatePrayers(date) {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const getTZ = () => {
        const m = date.getMonth() + 1;
        if (m > 4 && m < 11) return 3; 
        if (m === 4) return date.getDate() >= 24 ? 3 : 2; 
        return 2;
    };
    const tz = getTZ();
    const phi = LAT * Math.PI / 180;
    const gamma = 2 * Math.PI / 365 * (dayOfYear - 1);
    const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2*gamma) - 0.040849 * Math.sin(2*gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2*gamma) + 0.000907 * Math.sin(2*gamma);
    const transit = 720 - (4 * (LNG - 15 * tz)) + eqtime;
    const getHA = (angle) => {
        const cosHA = (Math.sin(angle * Math.PI / 180) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
        return Math.acos(Math.max(-1, Math.min(1, cosHA))) * 180 / Math.PI * 4;
    };
    const format = (min, add = 0) => {
        const total = min + add;
        let h = Math.floor(total / 60);
        let m = Math.round(total % 60);
        if (m === 60) { h++; m = 0; }
        return `${h % 12 || 12}:${m.toString().padStart(2, '0')}`;
    };
    const asrAlt = Math.atan(1 / (1 + Math.tan(Math.abs(phi - decl))));
    const asrHA = getHA(asrAlt * 180 / Math.PI);

    document.getElementById("fajr").innerText = format(transit - getHA(-19.5));
    document.getElementById("dhuhr").innerText = format(transit);
    document.getElementById("asr").innerText = format(transit + asrHA);
    document.getElementById("maghrib").innerText = format(transit + getHA(-0.833), 2);
    document.getElementById("isha").innerText = format(transit + getHA(-17.5));
}

// --- 4. بناء التقويم المتجاوب ---

function renderCalendar() {
    const grid = document.getElementById('daysGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    document.getElementById('explorerTitle').innerText = `${monthsAr[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // ضبط الإزاحة لتبدأ من يوم "السبت" كأول عمود
    let offset = (firstDay + 1) % 7; 
    
    for(let i=0; i<offset; i++) grid.innerHTML += `<div class="day-card empty"></div>`;
    
    for(let d=1; d<=daysInMonth; d++) {
        const curr = new Date(year, month, d);
        const hData = getHijriDate(curr); 
        
        const event = holidays.find(ev => {
            const s = new Date(ev.y, ev.m - 1, ev.d);
            const e = new Date(ev.y, ev.m - 1, ev.d);
            e.setDate(s.getDate() + ev.duration - 1);
            return curr >= s && curr <= e;
        });
        
        let cls = "day-card";
        if (event) cls += ` highlighted ${event.type}-day`;
        if (new Date().toDateString() === curr.toDateString()) cls += " today";
        
        grid.innerHTML += `
            <div class="${cls}">
                <span class="m-num">${d}</span>
                <span class="h-num">${hData.d}</span>
            </div>`;
    }
}

// --- 5. تحديث التطبيق ---

function updateApp() {
    const now = new Date();
    let h = now.getHours();
    
    document.getElementById('clock').innerText = `${h % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    document.getElementById('ampm').innerText = h >= 12 ? "مساءً" : "صباحاً";

    document.getElementById('mDay').innerText = now.getDate();
    document.getElementById('mMonth').innerText = monthsAr[now.getMonth()];
    document.getElementById('dayName').innerText = weekDays[now.getDay()];

    const hj = getHijriDate(now);
    document.getElementById('hDay').innerText = hj.d;
    document.getElementById('hMonth').innerText = hj.m;

    const cp = getCopticDate(now);
    document.getElementById('copticDay').innerText = cp.d;
    document.getElementById('copticMonth').innerText = cp.m;

    calculatePrayers(now);
    updateCountdown(now);
    celebrateOccasion(now);
}

function updateCountdown(now) {
    let nextEvent = null;
    let minDiff = Infinity;
    holidays.forEach(ev => {
        const evDate = new Date(ev.y, ev.m - 1, ev.d);
        const diff = evDate - now;
        if (diff > 0 && diff < minDiff) {
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

function celebrateOccasion(now) {
    const mainCardHeader = document.querySelector('.leaf-header'); 
    const occasionLabel = document.getElementById('occasionLabel'); 
    if(!mainCardHeader || !occasionLabel) return;
    const todayEvent = holidays.find(ev => ev.d === now.getDate() && ev.m === (now.getMonth() + 1));

    if (todayEvent) {
        if (todayEvent.type === "ramadan") mainCardHeader.style.background = "linear-gradient(90deg, #1b5e20, #2e7d32)";
        else if (todayEvent.type === "eid") mainCardHeader.style.background = "linear-gradient(90deg, #d4af37, #b8860b)";
        else mainCardHeader.style.background = "linear-gradient(90deg, #1565c0, #1e88e5)";
        occasionLabel.innerText = todayEvent.name;
    } else {
        mainCardHeader.style.background = ""; 
        occasionLabel.innerText = ""; 
    }
}

// المستمعات
document.getElementById('prevMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };

setInterval(updateApp, 1000);
updateApp();
renderCalendar();



// ... أي كواد تانية ...

// كود المشاركة (اللي أنت بعته)
document.getElementById('shareBtn').onclick = function(e) {
    e.preventDefault();
    const shareText = `شوف نتيجة النهاردة من نتيجة الصعيدي: ${document.getElementById('dayName').innerText} ${document.getElementById('mDay').innerText} ${document.getElementById('mMonth').innerText}`;
    if (navigator.share) {
        navigator.share({ title: "نتيجة الصعيدي 2026", text: shareText, url: window.location.href });
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + window.location.href)}`, '_blank');
    }
};

// كود الربط (اللازم إضافته الآن)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}
