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
    document.getElementById("digital").innerText = `${h}:${m}:${s}`;
    document.getElementById("ampm").innerText = ampm;

    // اليوم والشهور
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    document.getElementById("day-name").innerText = days[now.getDay()];

    document.getElementById("gregorian-date").innerHTML = `
        <div class="date-num">${now.getDate()}</div>
        <div class="month-name">${monthsGr[now.getMonth()]}</div>
    `;

    try {
        const hOption = { day: 'numeric', month: 'long' };
        const hFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', hOption);
        const hParts = hFormatter.formatToParts(now);
        let hDay = hParts.find(p => p.type === 'day').value;
        let hMonth = hParts.find(p => p.type === 'month').value;
        document.getElementById("hijri-date").innerHTML = `
            <div class="date-num">${hDay}</div>
            <div class="month-name">${hMonth}</div>
        `;
    } catch (e) {
        document.getElementById("hijri-date").innerHTML = `<div class="date-num">--</div><div class="month-name">رجب</div>`;
    }

    updateCountdown(now);
}

function updateCountdown(now) {
    const holidays = [
        { name: "عيد الميلاد المجيد", d: 7, m: 0 },
        { name: "ثورة ٢٥ يناير", d: 25, m: 0 },
        { name: "بداية رمضان", d: 18, m: 1 },
        { name: "عيد الفطر", d: 20, m: 2 },
        { name: "عيد الأضحى", d: 27, m: 4 },
        { name: "٦ أكتوبر", d: 6, m: 9 }
    ];

    let next = holidays.find(h => new Date(2026, h.m, h.d) > now);
    if (next) {
        let diff = Math.ceil((new Date(2026, next.m, next.d) - now) / (1000 * 60 * 60 * 24));
        document.getElementById("countdown-banner").innerText = `باقي على ${next.name}: ${diff} يوم`;
    }
}

function renderCalendar(monthIndex) {
    const grid = document.getElementById("daysGrid");
    const monthTitle = document.getElementById("currentViewMonth");
    grid.innerHTML = "";
    
    const year = 2026;
    monthTitle.innerText = `${monthsGr[monthIndex]} ${year}`;

    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    let startOffset = (firstDay + 1) % 7; 
    for (let i = 0; i < startOffset; i++) grid.innerHTML += `<div></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
        let dateObj = new Date(year, monthIndex, d);
        let hFull = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', {day:'numeric'}).format(dateObj);
        let isToday = (new Date().toDateString() === dateObj.toDateString()) ? "today" : "";
        grid.innerHTML += `<div class="day-card ${isToday}"><span class="m-day">${d}</span><span class="h-day">${hFull}</span></div>`;
    }
}

document.getElementById("prevMonth").onclick = () => { if(currentMonthView > 0) renderCalendar(--currentMonthView); };
document.getElementById("nextMonth").onclick = () => { if(currentMonthView < 11) renderCalendar(++currentMonthView); };

updateClock();
setInterval(updateClock, 1000);
renderCalendar(currentMonthView);