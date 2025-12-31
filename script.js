const monthsGr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
let currentMonthView = new Date().getMonth();

function updateClock() {
    const now = new Date();
    
    // الساعة
    let h = now.getHours();
    let ampm = h >= 12 ? 'مساءً' : 'صباحاً';
    h = h % 12 || 12;
    let m = now.getMinutes().toString().padStart(2, '0');
    let s = now.getSeconds().toString().padStart(2, '0');
    
    const digitalEl = document.getElementById("digital");
    if(digitalEl) {
        digitalEl.innerText = `${h}:${m}:${s}`;
        document.getElementById("ampm").innerText = ampm;
    }

    // التاريخ الميلادي
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    document.getElementById("day-name").innerText = days[now.getDay()];
    document.getElementById("gregorian-date").innerHTML = `
        <div class="date-num">${now.getDate()}</div>
        <div class="month-name">${monthsGr[now.getMonth()]}</div>
    `;

    // التاريخ الهجري (أم القرى)
    try {
        const hFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long' });
        const hParts = hFormatter.formatToParts(now);
        document.getElementById("hijri-date").innerHTML = `
            <div class="date-num">${hParts.find(p => p.type === 'day').value}</div>
            <div class="month-name">${hParts.find(p => p.type === 'month').value}</div>
        `;
    } catch (e) { console.error("Hijri Error", e); }

    updateCountdown(now);
}

function updateCountdown(now) {
    // ✅ التواريخ الصحيحة لعام 2026 (ميلادي بعد تحويل من الهجري)
    const holidays = [
        { name: "الإسراء والمعراج", d: 16, m: 0, y: 2026 },   // 16 يناير
        { name: "ليلة النصف من شعبان", d: 4, m: 1, y: 2026 }, // 4 فبراير
        { name: "بداية شهر رمضان", d: 19, m: 1, y: 2026 },    // 19 فبراير
        { name: "عيد الفطر المبارك", d: 20, m: 2, y: 2026 },  // 20 مارس
        { name: "وقفة عرفات", d: 26, m: 4, y: 2026 },         // 26 مايو
        { name: "عيد الأضحى المبارك", d: 27, m: 4, y: 2026 }, // 27 مايو
        { name: "رأس السنة الهجرية", d: 16, m: 5, y: 2026 }, // 16 يونيو
        { name: "يوم عاشوراء", d: 25, m: 5, y: 2026 },        // 25 يونيو
        { name: "المولد النبوي الشريف", d: 25, m: 7, y: 2026 } // 25 أغسطس
    ];

    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // فلترة المناسبات القادمة فقط
    let next = holidays.find(h => new Date(h.y, h.m, h.d) >= today);
    
    if (next) {
        let target = new Date(next.y, next.m, next.d);
        let diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
        
        const banner = document.getElementById("countdown-banner");
        if (diff === 0) {
            banner.innerText = `اليوم هو ${next.name}`;
        } else {
            banner.innerText = `باقي على ${next.name}: ${diff} يوم`;
        }
    }
}

function renderCalendar(monthIndex) {
    const grid = document.getElementById("daysGrid");
    const year = 2026;
    document.getElementById("currentViewMonth").innerText = `${monthsGr[monthIndex]} ${year}`;
    grid.innerHTML = "";

    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    let startOffset = (firstDay + 0) % 7; 
    for (let i = 0; i < startOffset; i++) grid.innerHTML += `<div></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
        let dateObj = new Date(year, monthIndex, d);
        let hDay = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day:'numeric'}).format(dateObj);
        let isToday = (new Date().toDateString() === dateObj.toDateString()) ? "today" : "";
        grid.innerHTML += `<div class="day-card ${isToday}"><span class="m-day">${d}</span><span class="h-day">${hDay}</span></div>`;
    }
}

document.getElementById("prevMonth").onclick = (e) => { e.stopPropagation(); if(currentMonthView > 0) renderCalendar(--currentMonthView); };
document.getElementById("nextMonth").onclick = (e) => { e.stopPropagation(); if(currentMonthView < 11) renderCalendar(++currentMonthView); };
document.getElementById("toggleCalendar").onclick = function() { this.classList.toggle("active"); };

updateClock();
setInterval(updateClock, 1000);
renderCalendar(currentMonthView);
