// --- 1. الإعدادات الجغرافية والإعدادات العامة ---
const LAT = 30.0444; 
const LNG = 31.2357;
let HIJRI_OFFSET = 0; 
let viewDate = new Date(2026, 0, 1); 


const holidays = [
    // --- مناسبات إسلامية 2026 ---
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

    // --- إجازات قومية ومناسبات عامة 2026 ---
    { name: "عيد الميلاد المجيد", d: 7, m: 1, y: 2026, type: "event", duration: 1 },
    { name: "ثورة 25 يناير / عيد الشرطة", d: 25, m: 1, y: 2026, type: "event", duration: 1 },
    { name: "عيد الأم", d: 21, m: 3, y: 2026, type: "event", duration: 1 },
    { name: "شم النسيم", d: 13, m: 4, y: 2026, type: "event", duration: 1 },
    { name: "عيد تحرير سيناء", d: 25, m: 4, y: 2026, type: "event", duration: 1 },
    { name: "عيد العمال", d: 1, m: 5, y: 2026, type: "event", duration: 1 },
    { name: "ثورة 30 يونيو", d: 30, m: 6, y: 2026, type: "event", duration: 1 },
    { name: "ثورة 23 يوليو", d: 23, m: 7, y: 2026, type: "event", duration: 1 },
    { name: "عيد القوات المسلحة (6 أكتوبر)", d: 6, m: 10, y: 2026, type: "event", duration: 1 },
    { name: "عيد ميلاد معرض الصعيدي", d: 25, m: 10, y: 2026, type: "event", duration: 1 }
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

// دالة تحويل الوقت لنظام 12 ساعة
function formatTime12(timeStr) {
    if (!timeStr) return "--:--";
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? "م" : "ص";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

// --- 3. حساب مواقيت الصلاة (نظام 12 ساعة + تلوين الصلاة القادمة) ---
function calculatePrayers(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const key = `${m}-${d}`;
    
    if (typeof PRAYER_DB !== 'undefined' && PRAYER_DB[key]) {
        const times = PRAYER_DB[key];
        const prayerIds = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
        
        // مسح التلوين القديم
        prayerIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.parentElement.classList.remove("next-prayer-highlight");
        });

        // توزيع المواقيت 12 ساعة
        prayerIds.forEach((id, index) => {
            document.getElementById(id).innerText = formatTime12(times[index]);
        });

        // تلوين الصلاة القادمة
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            const currentTime = now.getHours() * 60 + now.getMinutes();
            let nextIndex = -1;
            for (let i = 0; i < times.length; i++) {
                const [h, min] = times[i].split(':').map(Number);
                if ((h * 60 + min) > currentTime) { nextIndex = i; break; }
            }
            if (nextIndex === -1) nextIndex = 0; 
            const nextId = prayerIds[nextIndex];
            document.getElementById(nextId).parentElement.classList.add("next-prayer-highlight");
        }
    }
}

// --- 4. بناء التقويم ---
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

    for(let i=0; i<offset; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = "day-card empty";
        grid.appendChild(emptyDiv);
    }
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
        daySquare.onclick = () => { updateApp(curr); daySquare.style.transform = "scale(0.9)"; setTimeout(() => daySquare.style.transform = "scale(1)", 100); };
        daySquare.innerHTML = `<span class="m-num">${d}</span><span class="h-num">${hData.d}</span>`;
        grid.appendChild(daySquare);
    }
}

// --- 5. تحديث التطبيق ---
function updateApp(forcedDate = null) {
    const now = forcedDate || new Date(); 
    let h = now.getHours();
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.innerText = `${h % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const ampmEl = document.getElementById('ampm');
    if (ampmEl) ampmEl.innerText = h >= 12 ? "مساءً" : "صباحاً";

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
    celebrateSaidiBirthday(now);
}

function updateCountdown(now) {
    let nextEvent = null;
    let minDiff = Infinity;
    holidays.forEach(ev => {
        const evDate = new Date(ev.y, ev.m - 1, ev.d);
        const diff = evDate - now;
        if (diff > 0 && diff < minDiff) { minDiff = diff; nextEvent = ev; }
    });
    if (nextEvent) {
        const days = Math.ceil(minDiff / (1000 * 60 * 60 * 24));
        document.getElementById('nextEventName').innerText = `المتبقي على ${nextEvent.name}`;
        document.getElementById('daysLeft').innerText = days === 0 ? "اليوم!" : days;
    }
}

// دالة الاحتفالات والتلوين
function celebrateSaidiBirthday(now) {
    const isBirthday = (now.getDate() === 25 && (now.getMonth() + 1) === 10);
    const todayHoliday = holidays.find(h => h.d === now.getDate() && h.m === (now.getMonth() + 1));
const topCard = document.querySelector('.calendar-leaf');

    if (topCard) {
        if (todayHoliday) {
            const colors = { ramadan: '#1b5e20', eid: '#b71c1c', hajj: '#ef6c00', event: '#1565c0' };
            topCard.style.borderTop = `5px solid ${colors[todayHoliday.type] || '#8b0000'}`;
        } else {
            topCard.style.borderTop = `5px solid #8b0000`; 
        }
    }

    if (isBirthday) {
        const clock = document.getElementById('clock');
        if(clock) clock.style.color = "#FFD700";
        if (!sessionStorage.getItem('birthdayAlert')) {
            alert("🎊 كل سنة وأنتم طيبين! 🎊\nالنهاردة عيد ميلاد معرض الصعيدي.");
            sessionStorage.setItem('birthdayAlert', 'true');
        }
    }
}

// المستمعات والتشغيل
document.getElementById('prevMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); };
document.getElementById('shareBtn').onclick = (e) => {
    e.preventDefault();
    const shareText = `نتيجة الصحابة: ${document.getElementById('dayName').innerText} ${document.getElementById('mDay').innerText} ${document.getElementById('mMonth').innerText}`;
    if (navigator.share) navigator.share({ title: "نتيجة الصحابة 2026", text: shareText, url: window.location.href });
    else window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + window.location.href)}`, '_blank');


};

setInterval(updateApp, 1000);
updateApp();
renderCalendar();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
}
