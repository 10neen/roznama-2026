// الإعدادات الجغرافية
const LAT = 30.0444; 
const LNG = 31.2357;
let HIJRI_OFFSET = 0; 
let viewDate = new Date(); 

const holidays = [
    { name: "شهر رمضان", d: 18, m: 2, y: 2026, type: "ramadan", duration: 30 },
    { name: "عيد الفطر", d: 20, m: 3, y: 2026, type: "eid", duration: 3 },
    { name: "عيد الأضحى", d: 26, m: 5, y: 2026, type: "eid", duration: 4 }
];

const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// دالة التاريخ الهجري الصارمة (إجبار اللغة العربية)
function getHijriDate(date) {
    let adj = new Date(date);
    adj.setDate(date.getDate() + HIJRI_OFFSET);
    const fmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {day:'numeric', month:'long'});
    const parts = fmt.formatToParts(adj);
    return { 
        d: parts.find(p => p.type === 'day').value, 
        m: parts.find(p => p.type === 'month').value 
    };
}

// حساب مواقيت الصلاة (بإضافة فروق التوقيت المصري المحلي)
function calculatePrayers(date) {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const tz = (date.getMonth() > 3 && date.getMonth() < 9) ? 3 : 2; // التوقيت الصيفي التقريبي
    
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
        let h = Math.floor(min / 60) % 12 || 12;
        let m = Math.floor(min % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    // تطبيق فروق "المساحة المصرية" لعام 2026
    document.getElementById("fajr").innerText = format(transit - getHA(-19.5) - 2);
    document.getElementById("dhuhr").innerText = format(transit + 4);
    document.getElementById("asr").innerText = format(transit + getHA(25) + 2); 
    document.getElementById("maghrib").innerText = format(transit + getHA(-0.833) + 3);
    document.getElementById("isha").innerText = format(transit + getHA(-17.5) + 2);
}

function updateApp() {
    const now = new Date();
    // الساعة
    document.getElementById('clock').innerText = now.toLocaleTimeString('ar-EG', {hour12: true}).split(' ')[0];
    document.getElementById('ampm').innerText = now.getHours() >= 12 ? "مساءً" : "صباحاً";

    // التاريخ الميلادي
    document.getElementById('mDay').innerText = now.getDate();
    document.getElementById('mMonth').innerText = monthsAr[now.getMonth()];
    document.getElementById('dayName').innerText = weekDays[now.getDay()];

    // التاريخ الهجري
    const hj = getHijriDate(now);
    document.getElementById('hDay').innerText = hj.d;
    document.getElementById('hMonth').innerText = hj.m;

    calculatePrayers(now);
    celebrateOccasion(now);
}

function celebrateOccasion(now) {
    const header = document.querySelector('.card-header');
    const label = document.getElementById('occasionLabel');
    const event = holidays.find(ev => ev.d === now.getDate() && ev.m === (now.getMonth() + 1));

    if (event) {
        header.style.background = event.type === "ramadan" ? "#1b5e20" : "#d4af37";
        label.innerText = event.type === "ramadan" ? "🌙 رمضان كريم" : "🎉 عيد مبارك";
    } else {
        header.style.background = "#b71c1c";
        label.innerText = "";
    }
}

// زر المشاركة
document.getElementById('shareBtn').onclick = (e) => {
    e.preventDefault();
    const text = `نتيجة الصعيدي: اليوم ${document.getElementById('dayName').innerText} ${document.getElementById('mDay').innerText} ${document.getElementById('mMonth').innerText}`;
    if (navigator.share) {
        navigator.share({ title: 'نتيجة الصعيدي', text: text, url: window.location.href });
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`);
    }
};

setInterval(updateApp, 1000);
updateApp();
