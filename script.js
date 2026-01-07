// --- 1. الإعدادات الجغرافية والإعدادات العامة ---
const LAT = 30.0444; 
const LNG = 31.2357;
let HIJRI_OFFSET = 0; 
let viewDate = new Date(2026, 0, 1); 




const holidays = [
    // --- مناسبات دينية دقيقة (2026) ---
    { name: "الإسراء والمعراج", d: 16, m: 1, y: 2026, type: "event", duration: 1 }, 
    { name: "ليلة النصف من شعبان", d: 3, m: 2, y: 2026, type: "event", duration: 1 },
    { name: "بداية شهر رمضان", d: 18, m: 2, y: 2026, type: "ramadan", duration: 30 },
    { name: "عيد الفطر المبارك", d: 20, m: 3, y: 2026, type: "eid", duration: 3 },
    { name: "صيام العشر من ذي الحجة", d: 18, m: 5, y: 2026, type: "hajj", duration: 9 }, 
    { name: "وقفة عرفات", d: 26, m: 5, y: 2026, type: "hajj", duration: 1 },
    { name: "عيد الأضحى المبارك", d: 27, m: 5, y: 2026, type: "eid", duration: 4 },
    { name: "رأس السنة الهجرية 1448", d: 16, m: 6, y: 2026, type: "event", duration: 1 },
    { name: "يوم عاشوراء", d: 25, m: 6, y: 2026, type: "event", duration: 1 },
    { name: "المولد النبوي الشريف", d: 25, m: 8, y: 2026, type: "event", duration: 1 },

    // --- 🎂 المناسبة الخاصة بالمعرض 🎂 ---
    { name: "عيد ميلاد معرض الصعيدي", d: 25, m: 10, y: 2026, type: "ramadan", duration: 1 } 
    // ملحوظة: خليت الـ type هو "ramadan" عشان يتلون بالأخضر المميز في اليوم ده
];






const monthsAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// --- 2. دوال التواريخ (قبطي وهجري) ---

function getCopticDate(date) {
    const base = new Date(2025, 8, 11);
    const diff = Math.floor((date - base) / 86400000);
    const months = ["توت", "بابه", "هاتور", "كيهك", "طوبة", "أمشير", "برمهات", "برمودة", "بشنس", "بؤونة", "أبيب", "مسرى", "نسئ"];
    let day = (diff % 30) + 1;
    let monthIdx = Math.floor(diff / 30) % 13;
    return { d: day, m: months[monthIdx] };
}


function getHijriDate(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const key = `${m}-${d}`;

    if (typeof HIJRI_FULL_DB !== 'undefined' && HIJRI_FULL_DB[key]) {
        return HIJRI_FULL_DB[key];
    }
    return { d: "--", m: "خطأ" };
}




// --- 3. حساب مواقيت الصلاة (من ملف البيانات الخارجي) ---

function calculatePrayers(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const key = `${m}-${d}`;
    
    // التأكد من أن PRAYER_DB معرفة وموجودة
    if (typeof PRAYER_DB !== 'undefined' && PRAYER_DB[key]) {
        const times = PRAYER_DB[key];
        document.getElementById("fajr").innerText = times[0];
        document.getElementById("dhuhr").innerText = times[1];
        document.getElementById("asr").innerText = times[2];
        document.getElementById("maghrib").innerText = times[3];
        document.getElementById("isha").innerText = times[4];
    } else {
        console.warn("بيانات الصلاة غير متوفرة لهذا اليوم: " + key);
    }
}

// --- 4. بناء التقويم ---


// --- 4. بناء التقويم مع خاصية "آلة الزمن" ---

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
    
    // المربعات الفاضية
    for(let i=0; i<offset; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = "day-card empty";
        grid.appendChild(emptyDiv);
    }
    
    // المربعات اللي فيها أيام
    for(let d=1; d<=daysInMonth; d++) {
        const curr = new Date(year, month, d);
        const hData = getHijriDate(curr); 
        
        const event = holidays.find(ev => {
            const s = new Date(ev.y, ev.m - 1, ev.d);
            const e = new Date(ev.y, ev.m - 1, ev.d);
            e.setDate(s.getDate() + (ev.duration || 1) - 1);
            return curr >= s && curr <= e;
        });
        
        const daySquare = document.createElement('div');
        let cls = "day-card";
        if (event) cls += ` highlighted ${event.type}-day`;
        if (new Date().toDateString() === curr.toDateString()) cls += " today";
        daySquare.className = cls;

        // --- ميزة آلة الزمن: لما يدوس على اليوم ---
        daySquare.onclick = () => {
            console.log("تم السفر إلى تاريخ: " + curr.toDateString());
            // استدعاء التحديث بالتاريخ المختار
            updateApp(curr); 
            
            // حركة جمالية (وميض)
            daySquare.style.transform = "scale(0.9)";
            setTimeout(() => daySquare.style.transform = "scale(1)", 100);
        };

        daySquare.innerHTML = `
            <span class="m-num">${d}</span>
            <span class="h-num">${hData.d}</span>
        `;
        
        grid.appendChild(daySquare);
    }
}




// --- 5. تحديث التطبيق (النسخة المتفاعلة مع آلة الزمن) ---

function updateApp(forcedDate = null) {
    // لو مبعوت تاريخ من الكليك نستخدمه، لو مفيش نستخدم تاريخ اللحظة
    const now = forcedDate || new Date(); 
    
    let h = now.getHours();
    
    // 1. تحديث الساعة
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        clockEl.innerText = `${h % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    }
    const ampmEl = document.getElementById('ampm');
    if (ampmEl) {
        ampmEl.innerText = h >= 12 ? "مساءً" : "صباحاً";
    }

    // 2. تحديث التاريخ الميلادي
    document.getElementById('mDay').innerText = now.getDate();
    document.getElementById('mMonth').innerText = monthsAr[now.getMonth()];
    document.getElementById('dayName').innerText = weekDays[now.getDay()];

    // 3. تحديث التاريخ الهجري (المرجع)
    const hj = getHijriDate(now);
    document.getElementById('hDay').innerText = hj.d;
    document.getElementById('hMonth').innerText = hj.m;

    // 4. تحديث التاريخ القبطي
    const cp = getCopticDate(now);
    document.getElementById('copticDay').innerText = cp.d;
    document.getElementById('copticMonth').innerText = cp.m;

    // 5. تحديث مواقيت الصلاة والعد التنازلي بناءً على التاريخ المختار
    calculatePrayers(now);
    updateCountdown(now);

    // 6. تشغيل التلوين التلقائي للكارت العلوي
    const topCard = document.querySelector('.main-card');
    const todayHoliday = holidays.find(h => h.d === now.getDate() && h.m === (now.getMonth() + 1));

    if (topCard) {
        if (todayHoliday) {
            if (todayHoliday.type === 'ramadan') topCard.style.background = 'linear-gradient(135deg, #1b5e20, #2e7d32)';
            else if (todayHoliday.type === 'eid') topCard.style.background = 'linear-gradient(135deg, #b71c1c, #c62828)';
            else if (todayHoliday.type === 'hajj') topCard.style.background = 'linear-gradient(135deg, #ef6c00, #fb8c00)';
            else if (todayHoliday.type === 'event') topCard.style.background = 'linear-gradient(135deg, #1565c0, #1e88e5)';
        } else {
            // اللون الأحمر الأصلي للمعرض
            topCard.style.background = 'linear-gradient(135deg, #8b0000, #b22222)'; 
        }
    }

    // 7. فحص مناسبة عيد ميلاد المعرض
    celebrateSaidiBirthday(now);
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
        const elName = document.getElementById('nextEventName');
        const elDays = document.getElementById('daysLeft');
        if(elName) elName.innerText = `المتبقي على ${nextEvent.name}`;
        if(elDays) elDays.innerText = days === 0 ? "اليوم!" : days;
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

document.getElementById('shareBtn').onclick = function(e) {
    e.preventDefault();
    const shareText = `شوف نتيجة النهاردة من نتيجة الصعيدي: ${document.getElementById('dayName').innerText} ${document.getElementById('mDay').innerText} ${document.getElementById('mMonth').innerText}`;
    if (navigator.share) {
        navigator.share({ title: "نتيجة الصعيدي 2026", text: shareText, url: window.location.href });
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + window.location.href)}`, '_blank');
    }
};


// 1. تشغيل التطبيق (المحرك الأساسي)
setInterval(updateApp, 1000);
updateApp();
renderCalendar();

// 2. تسجيل الخدمة للعمل بدون إنترنت
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}

// 3. دالة الاحتفالات والتلوين (منظمة جداً)
function celebrateSaidiBirthday() {
    const now = new Date();
    const isBirthday = (now.getDate() === 25 && (now.getMonth() + 1) === 10);

    // --- أولاً: كود تلوين الكارت العلوي (يعمل كل يوم) ---
    const todayHoliday = holidays.find(h => h.d === now.getDate() && h.m === (now.getMonth() + 1));
    const topCard = document.querySelector('.main-card');

    if (topCard) {
        if (todayHoliday) {
            if (todayHoliday.type === 'ramadan') topCard.style.background = 'linear-gradient(135deg, #1b5e20, #2e7d32)';
            else if (todayHoliday.type === 'eid') topCard.style.background = 'linear-gradient(135deg, #b71c1c, #c62828)';
            else if (todayHoliday.type === 'hajj') topCard.style.background = 'linear-gradient(135deg, #ef6c00, #fb8c00)';
            else if (todayHoliday.type === 'event') topCard.style.background = 'linear-gradient(135deg, #1565c0, #1e88e5)';
        } else {
            // اللون الأحمر الأصلي بتاع المعرض
            topCard.style.background = 'linear-gradient(135deg, #8b0000, #b22222)'; 
        }
    }

    // --- ثانياً: كود المفاجأة (يعمل يوم 25 أكتوبر فقط) ---
    if (isBirthday) {
        const clock = document.getElementById('clock');
        if(clock) clock.style.color = "#FFD700";

        if (!sessionStorage.getItem('birthdayAlert')) {
            alert("🎊 كل سنة وأنتم طيبين! 🎊\nالنهاردة عيد ميلاد معرض الصعيدي وعيد ميلاد صاحب المعرض.");
            sessionStorage.setItem('birthdayAlert', 'true');
        }
        document.body.style.boxShadow = "inset 0 0 100px rgba(255,215,0,0.2)";
    }
}



// استدعاء الدالة داخل updateApp عشان تتفحص كل ثانية
// أضف السطر ده جوه دالة updateApp() تحت خالص
celebrateSaidiBirthday();
