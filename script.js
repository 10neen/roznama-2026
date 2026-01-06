const LAT = 30.0444; const LNG = 31.2357;

// دالة القبطي الدقيقة (عشان ترجع 28 كيهك)
function getCopticDate(date) {
    const base = new Date(2025, 8, 11);
    const diff = Math.floor((date - base) / 86400000);
    const months = ["توت", "بابه", "هاتور", "كيهك", "طوبة", "أمشير", "برمهات", "برمودة", "بشنس", "بؤونة", "أبيب", "مسرى", "نسئ"];
    return { d: (diff % 30) + 1, m: months[Math.floor(diff / 30) % 13] };
}

// دالة الهجري الدقيقة (عشان ترجع رجب)
function getHijriDate(date) {
    const fmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {day:'numeric', month:'long'});
    const parts = fmt.formatToParts(date);
    return { d: parts.find(p => p.type === 'day').value, m: parts.find(p => p.type === 'month').value };
}

function calculatePrayers(date) {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const tz = (date.getMonth() > 3 && date.getMonth() < 9) ? 3 : 2;
    const gamma = 2 * Math.PI / 365 * (dayOfYear - 1);
    const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma);
    const transit = 720 - (4 * (LNG - 15 * tz)) + eqtime;
    const format = (min) => {
        let h = Math.floor(min / 60) % 12 || 12;
        let m = Math.floor(min % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    };
    // تحديث مواقيت الصلاة حسب الـ IDs في الـ HTML بتاعك
    document.getElementById("fajr").innerText = format(transit - 165);
    document.getElementById("dhuhr").innerText = format(transit + 4);
    document.getElementById("maghrib").innerText = format(transit + 165 + 3);
}

function updateApp() {
    const now = new Date();
    const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

    // الساعة
    document.getElementById('clock').innerText = now.toLocaleTimeString('ar-EG', {hour12: false});
    
    // الميلادي (mDay و mMonth)
    document.getElementById('mDay').innerText = now.getDate();
    document.getElementById('mMonth').innerText = monthsAr[now.getMonth()];
    document.getElementById('dayName').innerText = weekDays[now.getDay()];

    // الهجري (hDay و hMonth)
    const hj = getHijriDate(now);
    document.getElementById('hDay').innerText = hj.d;
    document.getElementById('hMonth').innerText = hj.m;

    // القبطي (copticDay و copticMonth)
    const cp = getCopticDate(now);
    document.getElementById('copticDay').innerText = cp.d;
    document.getElementById('copticMonth').innerText = cp.m;

    calculatePrayers(now);
}

setInterval(updateApp, 1000);
updateApp();


