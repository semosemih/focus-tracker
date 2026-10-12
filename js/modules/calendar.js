/**
 * MOMENTUM - Takvim Modülü (CalendarManager)
 * Aylık takvim çizimi, gün bazlı seans geçmişi ve günün detayları.
 */

class CalendarManager {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    return this.currentDate;
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    return this.currentDate;
  }

  jumpToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    return this.selectedDate;
  }

  selectDate(date) {
    this.selectedDate = new Date(date);
    return this.selectedDate;
  }

  formatDateIso(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatMinutesToHuman(mins) {
    if (!mins || mins === 0) return '0 Dk';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}s ${m}d`;
    if (h > 0) return `${h} Saat`;
    return `${m} Dk`;
  }

  isDatePerfectDay(dateStr, sessions) {
    const daySessions = sessions.filter(s => s.dateStr === dateStr);
    const hasSpor = daySessions.some(s => s.category === 'spor');
    const hasDers = daySessions.some(s => s.category === 'ders');
    const hasYar = daySessions.some(s => s.category === 'yaraticilik');
    return hasSpor && hasDers && hasYar;
  }

  renderCalendar(gridEl, monthYearEl, sessions, onSelectDate) {
    if (!gridEl || !monthYearEl) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Pazartesi başlangıçlı indeks (0: Pzt, 6: Paz)
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6;

    const totalDays = lastDay.getDate();
    gridEl.innerHTML = '';

    // Önceki ayın günleri
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month';
      cell.innerHTML = `<span class="day-number">${prevMonthLastDay - i}</span>`;
      gridEl.appendChild(cell);
    }

    // Bu ayın günleri
    const today = new Date();
    const todayStr = this.formatDateIso(today);
    const selectedStr = this.formatDateIso(this.selectedDate);

    for (let d = 1; d <= totalDays; d++) {
      const thisDate = new Date(year, month, d);
      const dateStr = this.formatDateIso(thisDate);
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';

      if (dateStr === todayStr) cell.classList.add('today');
      if (dateStr === selectedStr) cell.classList.add('selected');
      if (this.isDatePerfectDay(dateStr, sessions)) cell.classList.add('streak-perfect');

      const daySessions = sessions.filter(s => s.dateStr === dateStr);
      let dotsHtml = '';
      if (daySessions.length > 0) {
        const cats = [...new Set(daySessions.map(s => s.category))];
        dotsHtml = `<div class="day-dots-container">` +
          cats.map(c => `<span class="dot-indicator ${c}"></span>`).join('') +
          `</div>`;
      }

      cell.innerHTML = `
        <span class="day-number">${d}</span>
        ${dotsHtml}
      `;

      cell.addEventListener('click', () => {
        this.selectedDate = thisDate;
        this.renderCalendar(gridEl, monthYearEl, sessions, onSelectDate);
        if (onSelectDate) onSelectDate(thisDate);
      });

      gridEl.appendChild(cell);
    }
  }

  renderDaySessions(date, sessions, domElements, onDeleteSession = null) {
    const { titleEl, badgeEl, minsEl, catsEl, listEl } = domElements;
    const dateStr = this.formatDateIso(date);
    const daySessions = sessions.filter(s => s.dateStr === dateStr);

    const isToday = (dateStr === this.formatDateIso(new Date()));
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateHuman = date.toLocaleDateString('tr-TR', options);

    if (titleEl) titleEl.textContent = isToday ? `Bugün (${dateHuman})` : dateHuman;
    if (badgeEl) badgeEl.textContent = `${daySessions.length} Seans`;

    const totalMins = daySessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
    if (minsEl) minsEl.textContent = this.formatMinutesToHuman(totalMins);

    const distinctCats = new Set(daySessions.map(s => s.category)).size;
    if (catsEl) catsEl.textContent = distinctCats;

    if (!listEl) return;
    listEl.innerHTML = '';

    if (daySessions.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <p>Bu güne ait tamamlanmış bir odak seansı bulunmuyor.</p>
        </div>
      `;
      return;
    }

    [...daySessions].reverse().forEach(s => {
      const timeStr = new Date(s.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const row = document.createElement('div');
      row.className = 'session-item-row';
      const catNames = { spor: 'Spor', ders: 'Ders', yaraticilik: 'Yaratıcılık' };

      const div = document.createElement('div');
      div.textContent = s.itemTitle || '';
      const safeTitle = div.innerHTML;

      row.innerHTML = `
        <div class="session-item-left">
          <div class="session-tag-icon" style="color: ${s.color || '#fff'}">${s.itemEmoji || '⚡'}</div>
          <div>
            <div class="session-meta-name">${safeTitle}</div>
            <div class="session-meta-sub">${catNames[s.category] || s.category} • ${timeStr}</div>
          </div>
        </div>
        <div class="session-mins-badge ${s.category}">+${this.formatMinutesToHuman(s.minutes)}</div>
      `;
      listEl.appendChild(row);
    });
  }
}

window.CalendarManager = CalendarManager;
