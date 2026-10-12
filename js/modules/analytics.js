/**
 * MOMENTUM - İstatistik & Analitik Modülü (AnalyticsManager)
 * Seviye/unvan hesaplama, seri (streak) takibi, kategori dağılımı ve 6 aylık Isı Haritası (Heatmap).
 */

class AnalyticsManager {
  constructor() {
    this.titles = [
      'Çırak Başlangıç',           // Seviye 1
      'Odak Yolcusu',              // Seviye 2
      'Sabırlı Arayışçı',          // Seviye 3
      'Düzenli Uygulayıcı',        // Seviye 4
      'Zihin Çırağı',              // Seviye 5
      'İstikrarlı İrade',          // Seviye 6
      'Derinleşen Odak',           // Seviye 7
      'Alışkanlık Mimarı',         // Seviye 8
      'Akış Kaşifi (Flow)',        // Seviye 9
      'Disiplin Ustası',           // Seviye 10
      'Sessiz Çalışkan',           // Seviye 11
      'Odak Zanaatkarı',            // Seviye 12
      'Zihinsel Dayanıklılık',      // Seviye 13
      'Derin Çalışma Şövalyesi',    // Seviye 14
      'Zirve Performansçı',         // Seviye 15
      'Zaman Bükücü',               // Seviye 16
      'Sarsılmaz İrade',            // Seviye 17
      'Akış Ustası (Flow Master)',  // Seviye 18
      'Zihin Filozofu',             // Seviye 19
      'Durdurulamaz Güç',           // Seviye 20
      'Mutlak Konsantrasyon',       // Seviye 21
      'Odak Virtüözü',              // Seviye 22
      'Kozmik Zihin',               // Seviye 23
      'Efsanevi Usta',              // Seviye 24
      'Transandantal Bilge'         // Seviye 25+
    ];
  }

  formatDateIso(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  formatMinutesToHuman(mins) {
    if (!mins || mins <= 0) return '0 dk';
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0 && remainingMins > 0) {
      return `${hours} saat ${remainingMins} dk`;
    } else if (hours > 0) {
      return `${hours} saat`;
    } else {
      return `${remainingMins} dk`;
    }
  }

  calculateLevelInfo(totalMins, prefixTitle = '') {
    const TOTAL_MINUTES = 28800; // 480 saat
    const LEVEL_COUNT = 25;
    const GROWTH = 1.1577;

    const stepCount = LEVEL_COUNT - 1;
    const weights = Array.from({ length: stepCount }, (_, i) => Math.pow(GROWTH, i));
    const weightSum = weights.reduce((sum, w) => sum + w, 0);

    const levelIncrements = weights.map(w => (w / weightSum) * TOTAL_MINUTES);
    const levelThresholds = [0];
    for (let i = 0; i < stepCount; i++) {
      levelThresholds.push(Math.round(levelThresholds[i] + levelIncrements[i]));
    }
    levelThresholds[levelThresholds.length - 1] = TOTAL_MINUTES;

    const mins = Math.max(0, totalMins || 0);

    const getFormattedTitle = (lvl) => {
      const base = this.titles[Math.min(lvl - 1, this.titles.length - 1)];
      return prefixTitle ? `${prefixTitle} ${base}` : base;
    };

    if (mins >= TOTAL_MINUTES) {
      const lastCost = levelThresholds[stepCount] - levelThresholds[stepCount - 1];
      return {
        level: LEVEL_COUNT,
        titleName: getFormattedTitle(LEVEL_COUNT),
        costForNext: lastCost,
        minsInCurrent: lastCost,
        minsLeft: 0,
        percent: 100,
        isMaxLevel: true
      };
    }

    let level = 1;
    for (let i = 1; i < levelThresholds.length; i++) {
      if (mins < levelThresholds[i]) {
        level = i;
        break;
      }
    }

    const currentLevelStart = levelThresholds[level - 1];
    const nextLevelTarget = levelThresholds[level];
    const costForNext = nextLevelTarget - currentLevelStart;
    const minsInCurrent = mins - currentLevelStart;
    const percent = Math.min(100, Math.round((minsInCurrent / costForNext) * 100));
    const minsLeft = nextLevelTarget - mins;
    const titleName = getFormattedTitle(level);

    return {
      level,
      titleName,
      costForNext,
      minsInCurrent,
      minsLeft,
      percent,
      isMaxLevel: false
    };
  }

  isDateStreakQualified(dateStr, sessions) {
    return sessions.some(s => s.dateStr === dateStr);
  }

  isDatePerfectDay(dateStr, sessions) {
    const daySessions = sessions.filter(s => s.dateStr === dateStr);
    const hasSpor = daySessions.some(s => s.category === 'spor');
    const hasDers = daySessions.some(s => s.category === 'ders');
    const hasYar = daySessions.some(s => s.category === 'yaraticilik');
    return hasSpor && hasDers && hasYar;
  }

  calculateStreak(sessions) {
    if (!sessions || sessions.length === 0) return 0;

    const todayStr = this.formatDateIso(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDateIso(yesterday);

    const isTodayDone = this.isDateStreakQualified(todayStr, sessions);
    const isYesterdayDone = this.isDateStreakQualified(yesterdayStr, sessions);

    if (!isTodayDone && !isYesterdayDone) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date();

    if (!isTodayDone) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = this.formatDateIso(checkDate);
      if (this.isDateStreakQualified(dStr, sessions)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  getCategoryBreakdown(sessions) {
    const catMins = { spor: 0, ders: 0, yaraticilik: 0 };
    const catCounts = { spor: 0, ders: 0, yaraticilik: 0 };

    (sessions || []).forEach(s => {
      if (catMins[s.category] !== undefined) {
        catMins[s.category] += s.minutes || 0;
        catCounts[s.category]++;
      }
    });

    const totalMins = (sessions || []).reduce((acc, s) => acc + (s.minutes || 0), 0);
    const safeTotal = totalMins || 1;

    return {
      catMins,
      catCounts,
      totalMins,
      totalSessions: (sessions || []).length,
      percentages: {
        spor: Math.round((catMins.spor / safeTotal) * 100),
        ders: Math.round((catMins.ders / safeTotal) * 100),
        yaraticilik: Math.round((catMins.yaraticilik / safeTotal) * 100)
      }
    };
  }

  getSubcatItemsWithLevels(items, sessions, filter = 'all') {
    const allItems = [];
    ['spor', 'ders', 'yaraticilik'].forEach(cat => {
      const list = (items && items[cat]) || [];
      list.forEach(item => {
        const sessionMins = (sessions || [])
          .filter(s => s.itemId === item.id)
          .reduce((acc, s) => acc + (s.minutes || 0), 0);
        const sessionCount = (sessions || []).filter(s => s.itemId === item.id).length;
        const totalMins = Math.max(item.totalMinutes || 0, sessionMins);
        const totalCount = Math.max(item.sessionsCount || 0, sessionCount);

        const levelInfo = this.calculateLevelInfo(totalMins, item.title);

        allItems.push({
          ...item,
          totalMins,
          totalCount,
          levelInfo
        });
      });
    });

    const filtered = filter === 'all'
      ? allItems
      : allItems.filter(i => i.category === filter);

    filtered.sort((a, b) => {
      if (b.levelInfo.level !== a.levelInfo.level) {
        return b.levelInfo.level - a.levelInfo.level;
      }
      return b.totalMins - a.totalMins;
    });

    return filtered;
  }

  generateHeatmapData(sessions) {
    const today = new Date();
    const todayStr = this.formatDateIso(today);

    const dayMap = {};
    let totalPeriodSessions = 0;
    let maxDayMins = 0;
    let activeDaysCount = 0;

    (sessions || []).forEach(s => {
      if (!s.dateStr) return;
      if (!dayMap[s.dateStr]) {
        dayMap[s.dateStr] = { minutes: 0, count: 0, items: [] };
      }
      dayMap[s.dateStr].minutes += (s.minutes || 0);
      dayMap[s.dateStr].count += 1;
      if (s.itemTitle && !dayMap[s.dateStr].items.includes(s.itemTitle)) {
        dayMap[s.dateStr].items.push(s.itemTitle);
      }
    });

    const totalWeeks = 26;
    const currentDayOfWeek = (today.getDay() + 6) % 7;

    const endGridDate = new Date(today);
    endGridDate.setDate(today.getDate() + (6 - currentDayOfWeek));

    const startGridDate = new Date(endGridDate);
    startGridDate.setDate(endGridDate.getDate() - (totalWeeks * 7 - 1));

    const monthNamesTr = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    let lastMonth = -1;
    const monthOffsets = [];

    const days = [];
    let curr = new Date(startGridDate);

    for (let w = 0; w < totalWeeks; w++) {
      const weekMonday = new Date(curr);
      const mIdx = weekMonday.getMonth();
      if (mIdx !== lastMonth) {
        monthOffsets.push({ name: monthNamesTr[mIdx], weekIdx: w });
        lastMonth = mIdx;
      }

      for (let d = 0; d < 7; d++) {
        const dStr = this.formatDateIso(curr);
        const isFuture = curr > today;
        const info = dayMap[dStr] || { minutes: 0, count: 0, items: [] };

        if (!isFuture) {
          if (info.minutes > 0) activeDaysCount++;
          if (info.minutes > maxDayMins) maxDayMins = info.minutes;
          totalPeriodSessions += info.count;
        }

        days.push({
          dateStr: dStr,
          dateObj: new Date(curr),
          isFuture,
          info,
          isToday: dStr === todayStr
        });

        curr.setDate(curr.getDate() + 1);
      }
    }

    return {
      days,
      monthOffsets,
      activeDaysCount,
      maxDayMins,
      totalPeriodSessions
    };
  }
}

window.AnalyticsManager = AnalyticsManager;
