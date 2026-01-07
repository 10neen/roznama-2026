// --- 1. الإعدادات الجغرافية لمدينة القاهرة ---
const LAT = 30.0444; 
const LNG = 31.2357;
let HIJRI_OFFSET = 0; 

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

// --- 2. دوال التواريخ (قبطي، هجري) ---

function getCopticDate(date) {
    const base = new Date(2025, 8, 11);
    const diff = Math.floor((date - base) / 86400000);
    const months = ["توت", "بابه", "هاتور", "كيهك", "طوبة", "أمشير", "برمهات", "برمودة", "بشنس", "بؤونة", "أبيب", "مسرى", "نسئ"];
    let day = (diff % 30) + 1;
    let monthIdx = Math.floor(diff / 30) % 13;
    return { d: day, m: months[monthIdx] };
}


function getHijriDate(date) {
    let adj = new Date(date);
    adj.setDate(date.getDate() + HIJRI_OFFSET);
    try {
        // 'ar-SA' تخبر المتصفح باللغة العربية
        // 'u-ca-islamic-uma' تجبره على التقويم الهجري الرسمي
        // 'nu-latn' تضمن ظهور الأرقام 1, 2, 3 لسهولة القراءة
        const fmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {
            day: 'numeric', 
            month: 'long'
        });

        const parts = fmt.formatToParts(adj);
        
        return { 
            d: parts.find(p => p.type === 'day').value, 
            m: parts.find(p => p.type === 'month').value 
        };
    } catch(e) { 
        return { d: "--", m: "--" }; 
    }
}




// --- 3. حساب مواقيت الصلاة بتوقيت القاهرة ---

function calculatePrayers(date) {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const getTZ = () => {
        const m = date.getMonth();
        if (m > 3 && m < 9) return 3;
        if (m === 3) return date.getDate() >= 24 ? 3 : 2; 
        if (m === 9) return date.getDate() <= 29 ? 3 : 2; 
        return 2;
    };
    const tz = getTZ();
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
    const asrAngle = 90 - (Math.atan(1 + Math.tan(Math.abs(LAT - (decl * 180 / Math.PI)) * Math.PI / 180)) * 180 / Math.PI);
    document.getElementById("asr").innerText = format(transit + getHA(asrAngle));
    document.getElementById("maghrib").innerText = format(transit + getHA(-0.833));
    document.getElementById("isha").innerText = format(transit + getHA(-17.5));
}

// --- 4. الاحتفالات والسمات الدينيه ---

function celebrateOccasion(now) {
    const mainCardHeader = document.querySelector('.card-header'); 
    const occasionLabel = document.getElementById('occasionLabel'); 
    if(!mainCardHeader || !occasionLabel) return;

    const todayEvent = holidays.find(ev => {
        return ev.d === now.getDate() && ev.m === (now.getMonth() + 1);
    });

    if (todayEvent) {
        if (todayEvent.type === "ramadan") {
            mainCardHeader.style.background = "linear-gradient(to bottom, #1b5e20, #2e7d32)";
            occasionLabel.innerText = "🌙 رمضان كريم";
        } else if (todayEvent.type === "eid") {
            mainCardHeader.style.background = "linear-gradient(to bottom, #d4af37, #f1c40f)";
            occasionLabel.innerText = "🎉 عيد مبارك";
        } else {
            mainCardHeader.style.background = "linear-gradient(to bottom, #1565c0, #1e88e5)";
            occasionLabel.innerText = "✨ " + todayEvent.name;
        }
    } else {
        mainCardHeader.style.background = ""; // يرجع للـ CSS الأصلي (الأحمر)
        occasionLabel.innerText = ""; 
    }
}

// --- 5. وظائف التحديث وبناء التقويم ---

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

function updateApp() {
    const now = new Date();
    // تحديث الساعة
    let h = now.getHours();
    document.getElementById('clock').innerText = `${h % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    document.getElementById('ampm').innerText = h >= 12 ? "مساءً" : "صباحاً";

    // تحديث التواريخ الرئيسية
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
    celebrateOccasion(now); // استدعاء دالة الاحتفال
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

// المستمعات
document.getElementById('prevMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };

// التشغيل الأولي
setInterval(updateApp, 1000);
updateApp();
renderCalendar();

document.getElementById('shareBtn').onclick = function(e) {
    e.preventDefault(); // منع أي تصرف تاني للزرار

    const title = "نتيجة الصعيدي 2026";
    const dayName = document.getElementById('dayName').innerText.split('\n')[0];
    const mDay = document.getElementById('mDay').innerText;
    const mMonth = document.getElementById('mMonth').innerText;
    
    const shareText = `شوف نتيجة النهاردة من نتيجة الصعيدي: اليوم هو ${dayName} ${mDay} ${mMonth}\n`;
    const url = window.location.href; // رابط موقعك

    // 1. محاولة فتح قائمة المشاركة الرسمية (للموبايل)
    if (navigator.share) {
        navigator.share({
            title: title,
            text: shareText,
            url: url
        }).then(() => {
            console.log('تمت المشاركة');
        }).catch((err) => {
            console.log('تم إلغاء المشاركة');
        });
    } 
    // 2. لو مفيش قائمة مشاركة (زي الكمبيوتر)، نفتح واتساب مباشرة
    else {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + url)}`;
        window.open(whatsappUrl, '_blank'); 
    }
};
