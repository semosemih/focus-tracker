/**
 * MOMENTUM - Odak & Gelişim Sistemi
 * Macbook için Yerel, Sade ve Güçlü Kişisel Takip Uygulaması
 */

// ==========================================
// 1. VERİ YAPISI & BAŞLANGIÇ VERİLERİ
// ==========================================

const COLOR_PALETTE = [
  { name: 'Adaçayı / Matcha', hex: '#3ecf8e' },
  { name: 'Lavanta / İndigo', hex: '#7c8cf8' },
  { name: 'Bal Kehribar', hex: '#eab308' },
  { name: 'Gül Kurusu / Terracotta', hex: '#e06c75' },
  { name: 'Sisli Okyanus', hex: '#38bdf8' },
  { name: 'Sakin Leylak', hex: '#a78bfa' },
  { name: 'Duman Grisi', hex: '#94a3b8' },
  { name: 'Sıcak Şeftali / Kil', hex: '#fb923c' }
];

const EMOJI_LIST = ['⚡', '🏃‍♂️', '💪', '🧘‍♂️', '🚴‍♂️', '📚', '💻', '🧠', '✍️', '📖', '🎨', '🎵', '💡', '🚀', '🎯', '✨', '☕', '🔥'];

const DEFAULT_ITEMS = {
  spor: [
    { id: 'spor-1', category: 'spor', title: 'Kardiyo & Koşu', emoji: '🏃‍♂️', color: '#3ecf8e', sessionsCount: 0, totalMinutes: 0 },
    { id: 'spor-2', category: 'spor', title: 'Kuvvet & Ağırlık', emoji: '💪', color: '#38bdf8', sessionsCount: 0, totalMinutes: 0 },
    { id: 'spor-3', category: 'spor', title: 'Esneme & Mobilite', emoji: '🧘‍♂️', color: '#3ecf8e', sessionsCount: 0, totalMinutes: 0 },
    { id: 'spor-4', category: 'spor', title: 'Bisiklet & Yürüyüş', emoji: '🚴‍♂️', color: '#38bdf8', sessionsCount: 0, totalMinutes: 0 }
  ],
  ders: [
    { id: 'ders-1', category: 'ders', title: 'Matematik & Analiz', emoji: '🧠', color: '#7c8cf8', sessionsCount: 0, totalMinutes: 0 },
    { id: 'ders-2', category: 'ders', title: 'Kodlama & Proje', emoji: '💻', color: '#a78bfa', sessionsCount: 0, totalMinutes: 0 },
    { id: 'ders-3', category: 'ders', title: 'İngilizce / Dil', emoji: '✍️', color: '#38bdf8', sessionsCount: 0, totalMinutes: 0 },
    { id: 'ders-4', category: 'ders', title: 'Kitap Okuma', emoji: '📖', color: '#eab308', sessionsCount: 0, totalMinutes: 0 }
  ],
  yaraticilik: [
    { id: 'yar-1', category: 'yaraticilik', title: 'Çizim & Tasarım', emoji: '🎨', color: '#eab308', sessionsCount: 0, totalMinutes: 0 },
    { id: 'yar-2', category: 'yaraticilik', title: 'Müzik & Enstrüman', emoji: '🎵', color: '#fb923c', sessionsCount: 0, totalMinutes: 0 },
    { id: 'yar-3', category: 'yaraticilik', title: 'Yaratıcı Yazarlık', emoji: '✍️', color: '#e06c75', sessionsCount: 0, totalMinutes: 0 },
    { id: 'yar-4', category: 'yaraticilik', title: 'Fikir & Beyin Fırtınası', emoji: '💡', color: '#a78bfa', sessionsCount: 0, totalMinutes: 0 }
  ]
};

const MOTIVATION_QUOTES = [
  "Disiplin, ne istediğin ile şu an ne istediğin arasındaki seçimdir.",
  "Büyük başarılar, her gün tekrarlanan küçük disiplinlerin toplamıdır.",
  "Başlamak için mükemmel olmak zorunda değilsin, ama mükemmel olmak için başlamak zorundasın.",
  "Bugün kendine ayırdığın bu zaman, gelecekteki benliğine en büyük armağanın.",
  "Zor olan başlamaktır, başladıktan sonra momentum seni taşır.",
  "Tutarlılık, sıradanlığı ustalığa dönüştüren gizli güçtür.",
  "Kendini fethettiğin her an, dünyayı fethetmeye bir adım daha yaklaşırsın.",
  "Zihnin durmak istediğinde bir adım daha at; gerçek gelişim o eşikte başlar.",
  "Sessizce ve derinden çalış, gürültüyü başarın çıkarsın.",
  "Her seans, olmak istediğin insanın heykeline vurulan usta bir çekiç darbesidir."
];

// ==========================================
// 2. UYGULAMA DURUMU (STATE)
// ==========================================

class MomentumApp {
  constructor() {
    this.activeCategory = 'spor';
    this.activeView = 'cards';
    this.items = this.loadItems();
    this.sessions = this.loadSessions();

    // Zamanlayıcı durumu
    this.timer = {
      activeItem: null,
      durationMinutes: 30,
      totalSeconds: 30 * 60,
      remainingSeconds: 30 * 60,
      targetEndTime: null,
      isRunning: false,
      intervalId: null
    };

    // Ses ve Ambiyans durumu
    this.audioCtx = null;
    this.ambientNoiseNode = null;
    this.isAmbientPlaying = false;

    // Takvim durumu
    this.calendarCurrentDate = new Date();
    this.selectedCalendarDate = new Date();

    this.initDOM();
    this.bindEvents();
    this.render();
    this.initSync();
  }

  // LocalStorage & Eşitleme İşlemleri
  loadItems() {
    const saved = localStorage.getItem('momentum_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Eski parlak tonları yeni mat/pastel İskandinav tonlarına yumuşakça güncelle
        const colorMap = {
          '#10b981': '#3ecf8e',
          '#6366f1': '#7c8cf8',
          '#f59e0b': '#eab308',
          '#0ea5e9': '#38bdf8',
          '#8b5cf6': '#a78bfa',
          '#f43f5e': '#e06c75',
          '#ec4899': '#fb923c'
        };
        ['spor', 'ders', 'yaraticilik'].forEach(cat => {
          if (Array.isArray(parsed[cat])) {
            parsed[cat].forEach(item => {
              if (colorMap[item.color]) {
                item.color = colorMap[item.color];
              }
            });
          }
        });
        return parsed;
      } catch (e) { console.error(e); }
    }
    return JSON.parse(JSON.stringify(DEFAULT_ITEMS));
  }

  saveItems(sync = true) {
    localStorage.setItem('momentum_items', JSON.stringify(this.items));
    if (sync) this.pushSyncToServer();
  }

  loadSessions() {
    const saved = localStorage.getItem('momentum_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  }

  saveSessions(sync = true) {
    localStorage.setItem('momentum_sessions', JSON.stringify(this.sessions));
    if (sync) this.pushSyncToServer();
  }

  // ==========================================
  // 2.5 CANLI YEREL SENKRONİZASYON MOTORU
  // ==========================================
  initSync() {
    this.syncBadge = document.getElementById('sync-badge');
    this.syncText = document.getElementById('sync-text');

    const urlParams = new URLSearchParams(window.location.search);
    let pin = urlParams.get('pin');
    if (pin) {
      localStorage.setItem('momentum_pin', pin);
    } else {
      pin = localStorage.getItem('momentum_pin') || '2026';
    }

    // Sunucu adresi: HTTP ise origin, file:// ise 127.0.0.1:8080
    const baseUrl = window.location.protocol.startsWith('http') 
      ? window.location.origin 
      : 'http://127.0.0.1:8080';

    this.syncState = {
      connected: false,
      baseUrl: baseUrl,
      pin: pin,
      lastSync: 0,
      pollIntervalId: null,
      isPolling: false
    };

    // İlk senkronizasyonu başlat
    this.fetchInitialSync();

    // 1.5 saniyede bir değişiklikleri yokla
    this.syncState.pollIntervalId = setInterval(() => {
      this.pollSync();
    }, 1500);
  }

  updateSyncBadge(online, text) {
    if (!this.syncBadge) return;
    this.syncBadge.classList.toggle('online', online);
    if (this.syncText) this.syncText.textContent = text;
  }

  async fetchInitialSync() {
    try {
      const url = `${this.syncState.baseUrl}/api/data?pin=${encodeURIComponent(this.syncState.pin)}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        this.syncState.connected = true;
        this.syncState.lastSync = data.lastUpdated || Date.now();
        this.updateSyncBadge(true, 'Canlı Eşit');

        // Sunucuda seanslar varsa sunucudan yükle
        if (Array.isArray(data.sessions) && data.sessions.length > 0) {
          this.sessions = data.sessions;
          localStorage.setItem('momentum_sessions', JSON.stringify(this.sessions));
          if (data.items && Object.keys(data.items).length > 0) {
            this.items = data.items;
            localStorage.setItem('momentum_items', JSON.stringify(this.items));
          }
          this.render();
        } else if (this.sessions && this.sessions.length > 0) {
          // Sunucu henüz boş (yeni açıldı) ama bu cihazda seanslar var (örn. Mac'teki 5 seans)
          // Mevcut seansları sunucuya yükle ki telefonda hemen görünsün!
          await this.pushSyncToServer();
        }

        // Eğer uzakta çalışan bir sayaç varsa bu ekranda da aç
        if (data.timer && data.timer.active && !this.timer.isRunning) {
          this.syncRemoteTimer(data.timer);
        }
      } else if (res.status === 401) {
        this.updateSyncBadge(false, 'PIN Gerekli');
      }
    } catch (e) {
      this.updateSyncBadge(false, 'Yerel');
    }
  }

  async pollSync() {
    if (!this.syncState || this.syncState.isPolling) return;
    this.syncState.isPolling = true;

    try {
      const url = `${this.syncState.baseUrl}/api/poll?since=${this.syncState.lastSync}&pin=${encodeURIComponent(this.syncState.pin)}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        this.updateSyncBadge(true, 'Canlı Eşit');

        if (json.updated && json.data) {
          this.syncState.lastSync = json.data.lastUpdated || Date.now();
          this.applyRemoteData(json.data);
        }
      } else if (res.status === 401) {
        this.updateSyncBadge(false, 'PIN Gerekli');
      } else {
        this.updateSyncBadge(false, 'Bağlantı Yok');
      }
    } catch (e) {
      this.updateSyncBadge(false, 'Yerel');
    } finally {
      this.syncState.isPolling = false;
    }
  }

  applyRemoteData(data) {
    let shouldRender = false;

    // Seanslar güncellendiyse
    if (Array.isArray(data.sessions)) {
      this.sessions = data.sessions;
      localStorage.setItem('momentum_sessions', JSON.stringify(this.sessions));
      shouldRender = true;
    }

    // Kategoriler ve alt başlıklar güncellendiyse
    if (data.items && Object.keys(data.items).length > 0) {
      this.items = data.items;
      localStorage.setItem('momentum_items', JSON.stringify(this.items));
      shouldRender = true;
    }

    // Uzak sayaç durumu senkronizasyonu
    if (data.timer) {
      if (data.timer.active && !this.timer.isRunning) {
        this.syncRemoteTimer(data.timer);
      } else if (!data.timer.active && this.timer.isRunning) {
        // Uzak cihaz seansı bitirdi veya kapattı
        this.closeFocusOverlaySilently();
        shouldRender = true;
      }
    }

    if (shouldRender) {
      this.render();
    }
  }

  syncRemoteTimer(remoteTimer) {
    if (!remoteTimer || !remoteTimer.item) return;
    const now = Date.now();
    if (remoteTimer.targetEndTime && remoteTimer.targetEndTime <= now) return;

    this.timer.activeItem = remoteTimer.item;
    this.timer.durationMinutes = remoteTimer.durationMinutes || 30;
    this.timer.totalSeconds = remoteTimer.totalSeconds || (this.timer.durationMinutes * 60);
    this.timer.targetEndTime = remoteTimer.targetEndTime;
    this.timer.isRunning = true;

    // Overlay bilgilerini ayarla
    const catLabels = { spor: '🏃‍♂️ Spor', ders: '📚 Ders', yaraticilik: '🎨 Yaratıcılık' };
    this.timerCatTag.textContent = catLabels[remoteTimer.item.category] || remoteTimer.item.category;
    this.timerItemTitle.textContent = `${remoteTimer.item.emoji || ''} ${remoteTimer.item.title}`;

    const modeLabels = { 15: 'Kısa (15 dk)', 30: 'Orta (30 dk)', 45: 'Uzun (45 dk)' };
    this.timerModeBadge.textContent = modeLabels[this.timer.durationMinutes] || `${this.timer.durationMinutes} dk`;

    this.timerCircleProgress.style.stroke = remoteTimer.item.color || '#6366f1';
    document.getElementById('focus-glow').style.background = `radial-gradient(circle, ${remoteTimer.item.color}26 0%, transparent 70%)`;

    this.focusOverlay.classList.add('active');
    this.startTimerInterval();
  }

  closeFocusOverlaySilently() {
    clearInterval(this.timer.intervalId);
    this.timer.isRunning = false;
    this.timer.targetEndTime = null;
    if (this.isAmbientPlaying) this.toggleAmbientSound();
    this.focusOverlay.classList.remove('active');
    document.title = "MOMENTUM | Odak & Gelişim Sistemi";
  }

  async pushSyncToServer() {
    if (!this.syncState || !this.syncState.baseUrl) return;
    try {
      const payload = {
        items: this.items,
        sessions: this.sessions,
        timer: this.getTimerSyncPayload()
      };
      const url = `${this.syncState.baseUrl}/api/sync?pin=${encodeURIComponent(this.syncState.pin)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.lastUpdated) this.syncState.lastSync = json.lastUpdated;
        this.updateSyncBadge(true, 'Canlı Eşit');
      }
    } catch (e) {
      console.warn('[Sync] Gönderilemedi:', e);
    }
  }

  async pushTimerStateToServer(isActive) {
    if (!this.syncState || !this.syncState.baseUrl) return;
    try {
      const timerState = {
        active: isActive,
        item: isActive ? this.timer.activeItem : null,
        durationMinutes: this.timer.durationMinutes,
        targetEndTime: this.timer.targetEndTime,
        remainingSeconds: this.timer.remainingSeconds,
        totalSeconds: this.timer.totalSeconds
      };
      const payload = {
        timer: timerState
      };
      const url = `${this.syncState.baseUrl}/api/sync?pin=${encodeURIComponent(this.syncState.pin)}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('[Sync] Sayaç gönderilemedi:', e);
    }
  }

  getTimerSyncPayload() {
    return {
      active: this.timer.isRunning,
      item: this.timer.isRunning ? this.timer.activeItem : null,
      durationMinutes: this.timer.durationMinutes,
      targetEndTime: this.timer.targetEndTime,
      remainingSeconds: this.timer.remainingSeconds,
      totalSeconds: this.timer.totalSeconds
    };
  }

  // ==========================================
  // 3. DOM ELEMANLARI
  // ==========================================
  initDOM() {
    // Sekmeler & Görünümler
    this.tabSpor = document.getElementById('tab-spor');
    this.tabDers = document.getElementById('tab-ders');
    this.tabYaraticilik = document.getElementById('tab-yaraticilik');
    this.catTabs = document.querySelectorAll('.cat-tab');

    this.btnViewCards = document.getElementById('btn-view-cards');
    this.btnViewCalendar = document.getElementById('btn-view-calendar');
    this.btnViewStats = document.getElementById('btn-view-stats');

    this.viewCards = document.getElementById('view-cards');
    this.viewCalendar = document.getElementById('view-calendar');
    this.viewStats = document.getElementById('view-stats');

    // Başlık & Sayaçlar
    this.activeCatTitle = document.getElementById('active-category-title');
    this.activeCatDesc = document.getElementById('active-category-desc');
    this.itemsGrid = document.getElementById('items-grid');

    this.statTodaySessions = document.getElementById('stat-today-sessions');
    this.statTodayMinutes = document.getElementById('stat-today-minutes');
    this.statStreakDays = document.getElementById('stat-streak-days');
    this.headerQuote = document.getElementById('header-quote');
    this.todayDateText = document.getElementById('today-date-text');

    // Modallar
    this.durationModal = document.getElementById('duration-modal');
    this.btnCloseDurationModal = document.getElementById('btn-close-duration-modal');
    this.modalItemColorPill = document.getElementById('modal-item-color-pill');
    this.modalItemIcon = document.getElementById('modal-item-icon');
    this.modalItemTitle = document.getElementById('modal-item-title');

    this.itemFormModal = document.getElementById('item-form-modal');
    this.btnCloseFormModal = document.getElementById('btn-close-form-modal');
    this.btnCancelForm = document.getElementById('btn-cancel-form');
    this.btnOpenCreateItem = document.getElementById('btn-open-create-item');
    this.itemForm = document.getElementById('item-form');
    this.formItemId = document.getElementById('form-item-id');
    this.formItemName = document.getElementById('form-item-name');
    this.formItemEmoji = document.getElementById('form-item-emoji');
    this.formItemColor = document.getElementById('form-item-color');
    this.emojiPicker = document.getElementById('emoji-picker');
    this.colorPicker = document.getElementById('color-picker');
    this.btnDeleteItem = document.getElementById('btn-delete-item');
    this.formModalTitle = document.getElementById('form-modal-title');
    this.formModalSubtitle = document.getElementById('form-modal-subtitle');

    // Fullscreen Odak & Sayaç Ekranı
    this.focusOverlay = document.getElementById('focus-overlay');
    this.timerCatTag = document.getElementById('timer-cat-tag');
    this.timerItemTitle = document.getElementById('timer-item-title');
    this.timerModeBadge = document.getElementById('timer-mode-badge');
    this.timerDigits = document.getElementById('timer-digits');
    this.timerStatusText = document.getElementById('timer-status-text');
    this.timerProgressPercent = document.getElementById('timer-progress-percent');
    this.timerCircleProgress = document.getElementById('timer-circle-progress');
    this.btnTimerPlayPause = document.getElementById('btn-timer-play-pause');
    this.playPauseIcon = document.getElementById('play-pause-icon');
    this.playPauseText = document.getElementById('play-pause-text');
    this.btnTimerReset = document.getElementById('btn-timer-reset');
    this.btnTimerFinish = document.getElementById('btn-timer-finish');
    this.btnMinimizeTimer = document.getElementById('btn-minimize-timer');
    this.btnTimerFullscreen = document.getElementById('btn-timer-fullscreen');
    this.btnFullscreenToggle = document.getElementById('btn-fullscreen-toggle');
    this.btnAmbientSound = document.getElementById('btn-ambient-sound');
    this.soundLabel = document.getElementById('sound-label');
    this.timerQuote = document.getElementById('timer-quote');

    // Kutlama Modalı
    this.celebrationOverlay = document.getElementById('celebration-overlay');
    this.confettiCanvas = document.getElementById('confetti-canvas');
    this.btnCloseCelebration = document.getElementById('btn-close-celebration');
    this.celebDuration = document.getElementById('celeb-duration');
    this.celebItem = document.getElementById('celeb-item');
    this.celebStreak = document.getElementById('celeb-streak');
    this.celebQuote = document.getElementById('celeb-quote');

    // Takvim DOM
    this.calendarMonthYear = document.getElementById('calendar-month-year');
    this.calendarDaysGrid = document.getElementById('calendar-days-grid');
    this.btnPrevMonth = document.getElementById('btn-prev-month');
    this.btnNextMonth = document.getElementById('btn-next-month');
    this.btnJumpToday = document.getElementById('btn-jump-today');
    this.selectedDayTitle = document.getElementById('selected-day-title');
    this.selectedDayBadge = document.getElementById('selected-day-badge');
    this.dayTotalMins = document.getElementById('day-total-mins');
    this.dayCategoryCount = document.getElementById('day-category-count');
    this.daySessionsList = document.getElementById('day-sessions-list');

    // İstatistikler DOM
    this.statTotalFocusedTime = document.getElementById('stat-total-focused-time');
    this.statStreakBig = document.getElementById('stat-streak-big');
    this.statTotalSessionsCount = document.getElementById('stat-total-sessions-count');
    this.levelTitle = document.getElementById('level-title');
    this.levelPercent = document.getElementById('level-percent');
    this.levelProgressFill = document.getElementById('level-progress-fill');
    this.progSporVal = document.getElementById('prog-spor-val');
    this.progSporBar = document.getElementById('prog-spor-bar');
    this.progDersVal = document.getElementById('prog-ders-val');
    this.progDersBar = document.getElementById('prog-ders-bar');
    this.progYaraticilikVal = document.getElementById('prog-yaraticilik-val');
    this.progYaraticilikBar = document.getElementById('prog-yaraticilik-bar');
    this.sessionRatioPills = document.getElementById('session-ratio-pills');

    this.renderPickers();
  }

  // ==========================================
  // 4. OLAY DİNLEYİCİLERİ (EVENTS)
  // ==========================================
  bindEvents() {
    // Kategori Sekmeleri Tıklamaları
    this.catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.dataset.category;
        this.switchCategory(cat);
      });
    });

    // Görünüm Değiştiriciler
    this.btnViewCards.addEventListener('click', () => this.switchView('cards'));
    this.btnViewCalendar.addEventListener('click', () => this.switchView('calendar'));
    this.btnViewStats.addEventListener('click', () => this.switchView('stats'));

    // Mac Tam Ekran Düğmesi
    this.btnFullscreenToggle.addEventListener('click', () => this.toggleFullscreen());
    this.btnTimerFullscreen.addEventListener('click', () => this.toggleFullscreen());

    // Yeni Öğe Ekleme
    this.btnOpenCreateItem.addEventListener('click', () => this.openItemForm(null));
    this.btnCloseFormModal.addEventListener('click', () => this.closeItemForm());
    this.btnCancelForm.addEventListener('click', () => this.closeItemForm());
    this.itemForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    this.btnDeleteItem.addEventListener('click', () => this.handleDeleteItem());

    // Süre Seçim Modalı
    this.btnCloseDurationModal.addEventListener('click', () => this.closeDurationModal());
    document.getElementById('btn-duration-15').addEventListener('click', () => this.startSession(15));
    document.getElementById('btn-duration-30').addEventListener('click', () => this.startSession(30));
    document.getElementById('btn-duration-45').addEventListener('click', () => this.startSession(45));

    // Sayaç Kontrolleri
    this.btnTimerPlayPause.addEventListener('click', () => this.toggleTimer());
    this.btnTimerReset.addEventListener('click', () => this.resetTimer());
    this.btnTimerFinish.addEventListener('click', () => this.completeSessionManually());
    this.btnMinimizeTimer.addEventListener('click', () => this.closeFocusOverlay());
    this.btnAmbientSound.addEventListener('click', () => this.toggleAmbientSound());

    // Kutlama Modalı
    this.btnCloseCelebration.addEventListener('click', () => this.closeCelebration());

    // Takvim Gezintisi
    this.btnPrevMonth.addEventListener('click', () => {
      this.calendarCurrentDate.setMonth(this.calendarCurrentDate.getMonth() - 1);
      this.renderCalendar();
    });
    this.btnNextMonth.addEventListener('click', () => {
      this.calendarCurrentDate.setMonth(this.calendarCurrentDate.getMonth() + 1);
      this.renderCalendar();
    });
    this.btnJumpToday.addEventListener('click', () => {
      this.calendarCurrentDate = new Date();
      this.selectedCalendarDate = new Date();
      this.renderCalendar();
      this.renderDaySessions(this.selectedCalendarDate);
    });

    // Arka plan sekme senkronizasyonu (Tarayıcı sekmeyi yavaşlatsa dahi anında gerçek zamana eşitler)
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    window.addEventListener('focus', () => this.handleVisibilityChange());

    // Escape tuşu ile modalları kapatma
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDurationModal();
        this.closeItemForm();
        if (this.celebrationOverlay.classList.contains('active')) {
          this.closeCelebration();
        }
      }
    });
  }

  // ==========================================
  // 5. KATEGORİ & GÖRÜNÜM YÖNETİMİ
  // ==========================================
  switchCategory(cat) {
    this.activeCategory = cat;
    this.catTabs.forEach(t => {
      if (t.dataset.category === cat) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    // Başlık ve açıklama güncellemesi
    const meta = {
      spor: { title: '🏃‍♂️ Spor', desc: 'Bedenini güçlendir, enerjini tazele. Bir aktivite seç ve başla.' },
      ders: { title: '📚 Ders', desc: 'Zihnini keskinleştir, yeni beceriler kazan ve derinleş.' },
      yaraticilik: { title: '🎨 Yaratıcılık', desc: 'Hayal gücünü serbest bırak, üret ve ilhamını somutlaştır.' }
    }[cat];

    this.activeCatTitle.textContent = meta.title;
    this.activeCatDesc.textContent = meta.desc;

    if (this.activeView !== 'cards') {
      this.switchView('cards');
    } else {
      this.renderSquareCards();
    }
  }

  switchView(viewName) {
    this.activeView = viewName;
    [this.btnViewCards, this.btnViewCalendar, this.btnViewStats].forEach(b => b.classList.remove('active'));
    [this.viewCards, this.viewCalendar, this.viewStats].forEach(v => v.classList.remove('active'));

    if (viewName === 'cards') {
      this.btnViewCards.classList.add('active');
      this.viewCards.classList.add('active');
      this.renderSquareCards();
    } else if (viewName === 'calendar') {
      this.btnViewCalendar.classList.add('active');
      this.viewCalendar.classList.add('active');
      this.renderCalendar();
      this.renderDaySessions(this.selectedCalendarDate);
    } else if (viewName === 'stats') {
      this.btnViewStats.classList.add('active');
      this.viewStats.classList.add('active');
      this.renderStatsView();
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // ==========================================
  // 6. KARE KARTLARIN ÇİZİLMESİ (SQUARE GRID)
  // ==========================================
  renderSquareCards() {
    this.itemsGrid.innerHTML = '';
    const currentList = this.items[this.activeCategory] || [];

    currentList.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'square-card';
      card.style.setProperty('--card-color', item.color || '#6366f1');
      card.style.setProperty('--i', idx);

      card.innerHTML = `
        <div class="card-top">
          <div class="card-emoji-wrap">${item.emoji || '⚡'}</div>
          <div class="card-actions-menu">
            <button class="card-action-btn btn-edit" title="Düzenle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
          </div>
        </div>
        <div class="card-bottom">
          <h4 class="card-title">${this.escapeHtml(item.title)}</h4>
          <div class="card-stats-row">
            <span>${this.formatMinutesToHuman(item.totalMinutes || 0)} odak</span>
            <span class="card-badge-count">${item.sessionsCount || 0} seans</span>
          </div>
        </div>
      `;

      // Karta tıklayınca Süre Seçim Modalı açılsın
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-action-btn')) {
          e.stopPropagation();
          this.openItemForm(item);
        } else {
          this.openDurationModal(item);
        }
      });

      this.itemsGrid.appendChild(card);
    });

    // Yeni Ekle Kare Butonu
    const addCard = document.createElement('div');
    addCard.className = 'add-new-card-placeholder';
    addCard.style.setProperty('--i', currentList.length);
    addCard.innerHTML = `
      <div class="add-plus-icon">+</div>
      <span style="font-weight: 600; font-size: 0.95rem;">Alt Başlık Ekle</span>
    `;
    addCard.addEventListener('click', () => this.openItemForm(null));
    this.itemsGrid.appendChild(addCard);

    // Kategori sayaçlarını güncelle
    this.updateCategoryCounters();
  }

  updateCategoryCounters() {
    ['spor', 'ders', 'yaraticilik'].forEach(c => {
      const el = document.getElementById(`count-${c}`);
      if (el) {
        el.textContent = (this.items[c] || []).length;
      }
    });
  }

  // ==========================================
  // 7. FORM & RENK SEÇİCİ (YENİ OLUŞTURMA & DÜZENLEME)
  // ==========================================
  renderPickers() {
    // Emojiler
    this.emojiPicker.innerHTML = '';
    EMOJI_LIST.forEach((emoji, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `emoji-opt-btn ${idx === 0 ? 'selected' : ''}`;
      btn.textContent = emoji;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.emoji-opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.formItemEmoji.value = emoji;
      });
      this.emojiPicker.appendChild(btn);
    });

    // Renkler (Göz yormayan soft modern tonlar)
    this.colorPicker.innerHTML = '';
    COLOR_PALETTE.forEach((color, idx) => {
      const swatch = document.createElement('div');
      swatch.className = `color-swatch ${idx === 0 ? 'selected' : ''}`;
      swatch.style.backgroundColor = color.hex;
      swatch.style.setProperty('--swatch-color', color.hex);
      swatch.title = color.name;
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        this.formItemColor.value = color.hex;
      });
      this.colorPicker.appendChild(swatch);
    });
  }

  openItemForm(item = null) {
    if (item) {
      this.formModalTitle.textContent = "Alt Başlığı Düzenle";
      this.formModalSubtitle.textContent = `Aktivite detaylarını ve rengini güncelle`;
      this.formItemId.value = item.id;
      this.formItemName.value = item.title;
      this.formItemEmoji.value = item.emoji || '⚡';
      this.formItemColor.value = item.color || '#6366f1';
      this.btnDeleteItem.classList.remove('hidden');

      // Emoji seçimini işaretle
      document.querySelectorAll('.emoji-opt-btn').forEach(b => {
        b.classList.toggle('selected', b.textContent === item.emoji);
      });
      // Renk seçimini işaretle
      document.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.toggle('selected', s.style.backgroundColor === item.color || s.style.backgroundColor.includes(item.color));
      });
    } else {
      this.formModalTitle.textContent = "Yeni Alt Başlık Ekle";
      const catNames = { spor: 'Spor', ders: 'Ders', yaraticilik: 'Yaratıcılık' };
      this.formModalSubtitle.textContent = `${catNames[this.activeCategory]} kategorisine yeni bir kare parça ekle`;
      this.formItemId.value = '';
      this.formItemName.value = '';
      this.btnDeleteItem.classList.add('hidden');
    }

    this.itemFormModal.classList.add('active');
    setTimeout(() => this.formItemName.focus(), 100);
  }

  closeItemForm() {
    this.itemFormModal.classList.remove('active');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const title = this.formItemName.value.trim();
    if (!title) return;

    const id = this.formItemId.value;
    const emoji = this.formItemEmoji.value || '⚡';
    const color = this.formItemColor.value || '#6366f1';

    if (id) {
      // Düzenleme
      const list = this.items[this.activeCategory];
      const target = list.find(x => x.id === id);
      if (target) {
        target.title = title;
        target.emoji = emoji;
        target.color = color;
      }
    } else {
      // Yeni Ekleme
      const newItem = {
        id: `${this.activeCategory}-${Date.now()}`,
        category: this.activeCategory,
        title: title,
        emoji: emoji,
        color: color,
        sessionsCount: 0,
        totalMinutes: 0
      };
      if (!this.items[this.activeCategory]) this.items[this.activeCategory] = [];
      this.items[this.activeCategory].push(newItem);
    }

    this.saveItems();
    this.closeItemForm();
    this.renderSquareCards();
    this.renderTopStats();
  }

  handleDeleteItem() {
    const id = this.formItemId.value;
    if (!id) return;
    if (confirm("Bu alt başlığı silmek istediğinden emin misin?")) {
      this.items[this.activeCategory] = this.items[this.activeCategory].filter(x => x.id !== id);
      this.saveItems();
      this.closeItemForm();
      this.renderSquareCards();
      this.renderTopStats();
    }
  }

  // ==========================================
  // 8. SÜRE SEÇİMİ (KISA: 15, ORTA: 30, UZUN: 45)
  // ==========================================
  openDurationModal(item) {
    this.timer.activeItem = item;
    this.modalItemTitle.textContent = item.title;
    this.modalItemIcon.textContent = item.emoji || '⚡';
    this.modalItemColorPill.style.backgroundColor = `${item.color}22` || 'rgba(255,255,255,0.08)';
    this.modalItemColorPill.style.color = item.color || '#ffffff';
    this.durationModal.classList.add('active');
  }

  closeDurationModal() {
    this.durationModal.classList.remove('active');
  }

  startSession(minutes) {
    this.closeDurationModal();
    const item = this.timer.activeItem;
    if (!item) return;

    this.timer.durationMinutes = minutes;
    this.timer.totalSeconds = minutes * 60;
    this.timer.remainingSeconds = minutes * 60;
    this.timer.targetEndTime = Date.now() + (minutes * 60 * 1000);
    this.timer.isRunning = true;

    // Overlay bilgilerini ayarla
    const catLabels = { spor: '🏃‍♂️ Spor', ders: '📚 Ders', yaraticilik: '🎨 Yaratıcılık' };
    this.timerCatTag.textContent = catLabels[item.category] || item.category;
    this.timerItemTitle.textContent = `${item.emoji || ''} ${item.title}`;

    const modeLabels = { 15: 'Kısa (15 dk)', 30: 'Orta (30 dk)', 45: 'Uzun (45 dk)' };
    this.timerModeBadge.textContent = modeLabels[minutes] || `${minutes} dk`;

    // Renk ayarı
    this.timerCircleProgress.style.stroke = item.color || '#6366f1';
    document.getElementById('focus-glow').style.background = `radial-gradient(circle, ${item.color}26 0%, transparent 70%)`;

    // Rastgele motive edici söz seç
    const quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    this.timerQuote.textContent = `"${quote}"`;

    this.updateTimerDisplay();
    this.focusOverlay.classList.add('active');
    this.playTone(520, 0.15); // Başlangıç zili

    this.startTimerInterval();
    this.pushTimerStateToServer(true);
  }

  // ==========================================
  // 9. ZAMANLAYICI MOTORU (GERÇEK ZAMANLI TIMESTAMP & WEB AUDIO)
  // ==========================================
  startTimerInterval() {
    if (this.timer.intervalId) clearInterval(this.timer.intervalId);

    if (!this.timer.targetEndTime && this.timer.remainingSeconds > 0) {
      this.timer.targetEndTime = Date.now() + (this.timer.remainingSeconds * 1000);
    }

    this.btnTimerPlayPause.classList.add('playing');
    this.playPauseText.textContent = "Duraklat";
    this.playPauseIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
    this.timerStatusText.textContent = "Odaklanma Zamanı";

    // İlk senkronizasyonu hemen yap
    this.syncTimerWithTimestamp();

    // 400ms aralıkla gerçek zaman damgasına göre sayacı güncelle.
    // Tarayıcı sekmeyi arka planda dakikada bire düşürse bile, Date.now() sayesinde
    // aradan 5 dakika geçtiğinde sayacın da TAM 5 dakika ilerlemesi garanti edilir.
    this.timer.intervalId = setInterval(() => {
      this.syncTimerWithTimestamp();
    }, 400);
  }

  syncTimerWithTimestamp() {
    if (!this.timer.isRunning || !this.timer.targetEndTime) return;

    const now = Date.now();
    const remainingMs = this.timer.targetEndTime - now;
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    this.timer.remainingSeconds = remainingSec;
    this.updateTimerDisplay();

    if (remainingSec <= 0) {
      this.finishSessionSuccessfully();
    }
  }

  handleVisibilityChange() {
    // Sekmeye tekrar dönüldüğünde veya pencere odaklandığında sayacı ve verileri anında eşitle
    if (this.timer.isRunning && this.timer.targetEndTime) {
      this.syncTimerWithTimestamp();
    }
    if (this.syncState && this.syncState.connected) {
      this.pollSync();
    }
  }

  toggleTimer() {
    if (this.timer.isRunning) {
      // Duraklat: Kalan süreyi kesin olarak hesapla ve hedefi dondur
      clearInterval(this.timer.intervalId);
      const now = Date.now();
      if (this.timer.targetEndTime) {
        this.timer.remainingSeconds = Math.max(0, Math.ceil((this.timer.targetEndTime - now) / 1000));
      }
      this.timer.targetEndTime = null;
      this.timer.isRunning = false;
      this.playPauseText.textContent = "Devam Et";
      this.playPauseIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
      this.timerStatusText.textContent = "Duraklatıldı";
      const titleItem = this.timer.activeItem ? this.timer.activeItem.title : 'Momentum';
      document.title = `⏸️ Duraklatıldı • ${titleItem}`;
      this.playTone(380, 0.1);
      this.pushTimerStateToServer(false);
    } else {
      // Devam et: Kalan saniyeye göre yeni hedef zaman damgası belirle
      this.timer.isRunning = true;
      this.timer.targetEndTime = Date.now() + (this.timer.remainingSeconds * 1000);
      this.playTone(520, 0.1);
      this.startTimerInterval();
      this.pushTimerStateToServer(true);
    }
  }

  resetTimer() {
    clearInterval(this.timer.intervalId);
    this.timer.isRunning = false;
    this.timer.targetEndTime = null;
    this.timer.remainingSeconds = this.timer.totalSeconds;
    this.updateTimerDisplay();
    this.playPauseText.textContent = "Başlat";
    this.playPauseIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
    this.timerStatusText.textContent = "Hazır";
    document.title = "MOMENTUM | Odak & Gelişim Sistemi";
    this.pushTimerStateToServer(false);
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timer.remainingSeconds / 60);
    const secs = this.timer.remainingSeconds % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.timerDigits.textContent = timeFormatted;

    // Tarayıcı sekme başlığını canlı güncelle (kullanıcı başka sekmede olsa bile süreyi görür)
    if (this.timer.isRunning && this.timer.activeItem) {
      document.title = `⏱️ ${timeFormatted} • ${this.timer.activeItem.title}`;
    }

    // Çember Çizimi (SVG stroke-dashoffset: çevre ~ 911 px)
    const circumference = 2 * Math.PI * 145; // 911.06
    const fraction = this.timer.remainingSeconds / this.timer.totalSeconds;
    const offset = circumference * (1 - fraction);
    this.timerCircleProgress.style.strokeDashoffset = offset;

    const percent = Math.round((1 - fraction) * 100);
    this.timerProgressPercent.textContent = `%${percent} Tamamlandı`;
  }

  completeSessionManually() {
    if (confirm("Bu seansı şimdi tamamlayıp ilerlemene kaydetmek istiyor musun?")) {
      this.finishSessionSuccessfully();
    }
  }

  finishSessionSuccessfully() {
    clearInterval(this.timer.intervalId);
    this.timer.isRunning = false;
    this.timer.targetEndTime = null;
    if (this.isAmbientPlaying) this.toggleAmbientSound();

    const item = this.timer.activeItem;
    const duration = this.timer.durationMinutes;

    document.title = "🎉 Seans Tamamlandı! • MOMENTUM";

    // Seansı kaydet
    const sessionRecord = {
      id: `ses-${Date.now()}`,
      itemId: item.id,
      itemTitle: item.title,
      itemEmoji: item.emoji,
      category: item.category,
      color: item.color,
      minutes: duration,
      timestamp: Date.now(),
      dateStr: this.formatDateIso(new Date()) // YYYY-MM-DD
    };

    this.sessions.push(sessionRecord);
    this.saveSessions();

    // İlgili alt başlığın sayacını ve süresini güncelle
    const catList = this.items[item.category];
    const targetItem = catList.find(x => x.id === item.id);
    if (targetItem) {
      targetItem.sessionsCount = (targetItem.sessionsCount || 0) + 1;
      targetItem.totalMinutes = (targetItem.totalMinutes || 0) + duration;
      this.saveItems();
    }

    this.pushTimerStateToServer(false);

    // Başarı Sesi Çal
    this.playCelebrationMelody();

    // Sayacı Kapat & Kutlamayı Başlat
    this.closeFocusOverlay();
    this.triggerCelebration(sessionRecord);

    // Görünümleri Güncelle
    this.render();
  }

  closeFocusOverlay() {
    clearInterval(this.timer.intervalId);
    this.timer.isRunning = false;
    this.timer.targetEndTime = null;
    if (this.isAmbientPlaying) this.toggleAmbientSound();
    this.focusOverlay.classList.remove('active');
    document.title = "MOMENTUM | Odak & Gelişim Sistemi";
    this.pushTimerStateToServer(false);
  }

  // ==========================================
  // 10. WEB AUDIO API SES MOTORU (TAMAMEN ÇEVRİMDIŞI)
  // ==========================================
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playTone(freq, dur = 0.15, type = 'sine') {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  playCelebrationMelody() {
    try {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 1. Zerafetli arpej başlangıcı (0.0s - 0.45s)
      const arpeggioNotes = [
        { freq: 523.25, time: 0.00, dur: 1.4 },  // C5
        { freq: 659.25, time: 0.12, dur: 1.6 },  // E5
        { freq: 783.99, time: 0.24, dur: 2.0 },  // G5
        { freq: 1046.50, time: 0.36, dur: 2.8 }  // C6
      ];

      arpeggioNotes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.linearRampToValueAtTime(0.18, now + note.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur);
      });

      // 2. Tam 3 saniye boyunca berrak tınlayan kristal çan akoru (0.45s - 3.4s)
      const chord = [523.25, 659.25, 1046.50, 1318.51]; // C5, E5, C6, E6
      chord.forEach((freq, idx) => {
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();

        bellOsc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        bellOsc.frequency.setValueAtTime(freq, now + 0.45);

        bellGain.gain.setValueAtTime(0.001, now + 0.45);
        bellGain.gain.linearRampToValueAtTime(0.24 / chord.length, now + 0.52);
        // Tam 3 saniyelik doğal, pürüzsüz akustik sönümlenme
        bellGain.gain.exponentialRampToValueAtTime(0.00005, now + 3.4);

        bellOsc.connect(bellGain);
        bellGain.connect(ctx.destination);
        bellOsc.start(now + 0.45);
        bellOsc.stop(now + 3.4);
      });
    } catch (e) {
      console.warn("Celebration chime error:", e);
    }
  }

  toggleAmbientSound() {
    try {
      const ctx = this.getAudioContext();
      if (this.isAmbientPlaying) {
        if (this.ambientGain) {
          this.ambientGain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
          setTimeout(() => {
            if (this.ambientNoiseNode) this.ambientNoiseNode.stop();
            this.ambientNoiseNode = null;
          }, 500);
        }
        this.isAmbientPlaying = false;
        this.btnAmbientSound.classList.remove('sound-on');
        this.soundLabel.textContent = "Ses Kapalı";
      } else {
        // Dinlendirici pembe gürültü / zen akışı üretimi
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        this.ambientNoiseNode = whiteNoise;
        this.ambientGain = gainNode;
        this.isAmbientPlaying = true;
        this.btnAmbientSound.classList.add('sound-on');
        this.soundLabel.textContent = "Zen Akışı";
      }
    } catch (e) {
      console.warn("Ambient sound error:", e);
    }
  }

  // ==========================================
  // 11. KUTLAMA, KONFETİ & MOTİVASYON SİSTEMİ
  // ==========================================
  triggerCelebration(session) {
    this.celebDuration.textContent = this.formatMinutesToHuman(session.minutes);
    this.celebItem.textContent = `${session.itemEmoji || ''} ${session.itemTitle}`;
    const streak = this.calculateStreak();
    this.celebStreak.textContent = `${streak} Gün 🔥`;

    const todayStr = this.formatDateIso(new Date());
    const isTodayDone = this.isDateStreakQualified(todayStr);

    // Derin ve etkileyici Türkçe motivasyon sözü seç
    let quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    if (isTodayDone) {
      quote = `🏆 TEBRİKLER! Bugün Spor, Ders ve Yaratıcılık seanslarının 3'ünü de tamamlayarak serini (${streak} Gün 🔥) başarıyla kilitledin!`;
    }
    this.celebQuote.textContent = `"${quote}"`;

    this.celebrationOverlay.classList.add('active');
    this.launchConfetti();
  }

  closeCelebration() {
    this.celebrationOverlay.classList.remove('active');
  }

  launchConfetti() {
    const canvas = this.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#fbbf24', '#ffffff'];

    const createBurst = (originX, originY, count, speedMultiplier = 1) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 12 + 6) * speedMultiplier;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          size: Math.random() * 9 + 4,
          shape: Math.random() > 0.4 ? 'rect' : 'circle',
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          gravity: 0.28,
          alpha: 1,
          decay: Math.random() * 0.005 + 0.006
        });
      }
    };

    // 1. Dalga: Merkez fıskiye patlaması
    createBurst(canvas.width / 2, canvas.height / 2 + 60, 100, 1.2);

    // 2. Dalga: Sol ve sağ havai fişek patlamaları (+220ms ve +480ms)
    setTimeout(() => {
      createBurst(canvas.width * 0.25, canvas.height * 0.45, 60, 0.95);
      createBurst(canvas.width * 0.75, canvas.height * 0.45, 60, 0.95);
    }, 220);

    setTimeout(() => {
      createBurst(canvas.width / 2, canvas.height * 0.4, 75, 1.1);
    }, 480);

    let animationFrame;
    const renderConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          }
          ctx.restore();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(renderConfetti);
      }
    };

    renderConfetti();
  }

  // ==========================================
  // 12. TAKVİM & GÜNLÜK GEÇMİŞ GÖRÜNÜMÜ
  // ==========================================
  renderCalendar() {
    const year = this.calendarCurrentDate.getFullYear();
    const month = this.calendarCurrentDate.getMonth();

    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    this.calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Pazartesi başlangıçlı indeks (0: Pzt, 6: Paz)
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6;

    const totalDays = lastDay.getDate();
    this.calendarDaysGrid.innerHTML = '';

    // Önceki ayın günleri
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell other-month';
      cell.innerHTML = `<span class="day-number">${prevMonthLastDay - i}</span>`;
      this.calendarDaysGrid.appendChild(cell);
    }

    // Bu ayın günleri
    const today = new Date();
    const todayStr = this.formatDateIso(today);
    const selectedStr = this.formatDateIso(this.selectedCalendarDate);

    for (let d = 1; d <= totalDays; d++) {
      const thisDate = new Date(year, month, d);
      const dateStr = this.formatDateIso(thisDate);
      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';

      if (dateStr === todayStr) cell.classList.add('today');
      if (dateStr === selectedStr) cell.classList.add('selected');
      if (this.isDateStreakQualified(dateStr)) cell.classList.add('streak-perfect');

      // O günkü seansları bul
      const daySessions = this.sessions.filter(s => s.dateStr === dateStr);
      let dotsHtml = '';
      if (daySessions.length > 0) {
        // Kategorileri belirle
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
        this.selectedCalendarDate = thisDate;
        this.renderCalendar();
        this.renderDaySessions(thisDate);
      });

      this.calendarDaysGrid.appendChild(cell);
    }
  }

  renderDaySessions(date) {
    const dateStr = this.formatDateIso(date);
    const daySessions = this.sessions.filter(s => s.dateStr === dateStr);

    const isToday = (dateStr === this.formatDateIso(new Date()));
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateHuman = date.toLocaleDateString('tr-TR', options);

    this.selectedDayTitle.textContent = isToday ? `Bugün (${dateHuman})` : dateHuman;
    this.selectedDayBadge.textContent = `${daySessions.length} Seans`;

    const totalMins = daySessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
    this.dayTotalMins.textContent = this.formatMinutesToHuman(totalMins);

    const distinctCats = new Set(daySessions.map(s => s.category)).size;
    this.dayCategoryCount.textContent = distinctCats;

    this.daySessionsList.innerHTML = '';
    if (daySessions.length === 0) {
      this.daySessionsList.innerHTML = `
        <div class="empty-state">
          <p>Bu güne ait tamamlanmış bir odak seansı bulunmuyor.</p>
        </div>
      `;
      return;
    }

    // Seansları yeniden eskiye listele
    [...daySessions].reverse().forEach(s => {
      const timeStr = new Date(s.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const row = document.createElement('div');
      row.className = 'session-item-row';
      const catNames = { spor: 'Spor', ders: 'Ders', yaraticilik: 'Yaratıcılık' };

      row.innerHTML = `
        <div class="session-item-left">
          <div class="session-tag-icon" style="color: ${s.color || '#fff'}">${s.itemEmoji || '⚡'}</div>
          <div>
            <div class="session-meta-name">${this.escapeHtml(s.itemTitle)}</div>
            <div class="session-meta-sub">${catNames[s.category] || s.category} • ${timeStr}</div>
          </div>
        </div>
        <div class="session-mins-badge ${s.category}">+${this.formatMinutesToHuman(s.minutes)}</div>
      `;
      this.daySessionsList.appendChild(row);
    });
  }

  // ==========================================
  // 13. İLERLEME & İSTATİSTİKLER GÖRÜNÜMÜ
  // ==========================================
  renderStatsView() {
    const totalSessions = this.sessions.length;
    const totalMins = this.sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);

    this.statTotalFocusedTime.textContent = this.formatMinutesToHuman(totalMins);
    this.statTotalSessionsCount.textContent = `${totalSessions} Seans`;

    const streak = this.calculateStreak();
    this.statStreakBig.textContent = `${streak} Gün`;

    // Seviye Hesaplama (Her 60 dk = 1 Seviye)
    const level = Math.floor(totalMins / 60) + 1;
    const minsInCurrentLevel = totalMins % 60;
    const levelPercentVal = Math.round((minsInCurrentLevel / 60) * 100);

    const titles = [
      'Çaylak Odaklanıcı', 'Düzenli Çalışan', 'İstikrarlı Zihin',
      'Derinleşen Usta', 'Disiplin Şampiyonu', 'Zirve Performans', 'Durdurulamaz Güç'
    ];
    const titleName = titles[Math.min(level - 1, titles.length - 1)];

    this.levelTitle.textContent = `Seviye ${level}: ${titleName}`;
    this.levelPercent.textContent = `%${levelPercentVal}`;
    this.levelProgressFill.style.width = `${levelPercentVal}%`;

    // Kategori Dağılımı
    const catMins = { spor: 0, ders: 0, yaraticilik: 0 };
    const catCounts = { spor: 0, ders: 0, yaraticilik: 0 };

    this.sessions.forEach(s => {
      if (catMins[s.category] !== undefined) {
        catMins[s.category] += s.minutes || 0;
        catCounts[s.category]++;
      }
    });

    const safeTotal = totalMins || 1;
    const sporPct = Math.round((catMins.spor / safeTotal) * 100);
    const dersPct = Math.round((catMins.ders / safeTotal) * 100);
    const yarPct = Math.round((catMins.yaraticilik / safeTotal) * 100);

    this.progSporVal.textContent = `${this.formatMinutesToHuman(catMins.spor)} (%${sporPct})`;
    this.progSporBar.style.width = `${sporPct}%`;

    this.progDersVal.textContent = `${this.formatMinutesToHuman(catMins.ders)} (%${dersPct})`;
    this.progDersBar.style.width = `${dersPct}%`;

    this.progYaraticilikVal.textContent = `${this.formatMinutesToHuman(catMins.yaraticilik)} (%${yarPct})`;
    this.progYaraticilikBar.style.width = `${yarPct}%`;

    this.sessionRatioPills.innerHTML = `
      <span class="ratio-pill spor">🏃 ${catCounts.spor}</span>
      <span class="ratio-pill ders">📚 ${catCounts.ders}</span>
      <span class="ratio-pill yaraticilik">🎨 ${catCounts.yaraticilik}</span>
    `;

    // Günlük seri motivasyon kutusu durumu
    const streakEncouragement = document.getElementById('streak-encouragement');
    if (streakEncouragement) {
      const todayStr = this.formatDateIso(new Date());
      const isTodayDone = this.isDateStreakQualified(todayStr);
      if (isTodayDone) {
        streakEncouragement.innerHTML = `✨ <strong>Harika!</strong> Bugün Spor, Ders ve Yaratıcılık seanslarının 3'ünü de tamamladın. Seri'n güvende!`;
        streakEncouragement.style.color = 'var(--color-spor)';
        streakEncouragement.style.borderColor = 'rgba(62, 207, 142, 0.25)';
        streakEncouragement.style.background = 'rgba(62, 207, 142, 0.08)';
      } else {
        const todaySessions = this.sessions.filter(s => s.dateStr === todayStr);
        const missing = [];
        if (!todaySessions.some(s => s.category === 'spor')) missing.push('🏃 Spor');
        if (!todaySessions.some(s => s.category === 'ders')) missing.push('📚 Ders');
        if (!todaySessions.some(s => s.category === 'yaraticilik')) missing.push('🎨 Yaratıcılık');

        streakEncouragement.innerHTML = `⚠️ Günlük seriyi korumak/sürdürmek için bugün eksik olanlar: <strong>${missing.join(', ')}</strong>`;
        streakEncouragement.style.color = '#eab308';
        streakEncouragement.style.borderColor = 'rgba(234, 179, 8, 0.25)';
        streakEncouragement.style.background = 'rgba(234, 179, 8, 0.08)';
      }
    }
  }

  // ==========================================
  // 14. YARDIMCI HESAPLAMALAR & GENEL RENDER
  // ==========================================
  // Bir günün streak sayılması için Spor, Ders ve Yaratıcılık seanslarının her birinden en az 1'er tane tamamlanmış olmalıdır
  isDateStreakQualified(dateStr) {
    const daySessions = this.sessions.filter(s => s.dateStr === dateStr);
    const hasSpor = daySessions.some(s => s.category === 'spor');
    const hasDers = daySessions.some(s => s.category === 'ders');
    const hasYar = daySessions.some(s => s.category === 'yaraticilik');
    return hasSpor && hasDers && hasYar;
  }

  calculateStreak() {
    if (this.sessions.length === 0) return 0;

    const todayStr = this.formatDateIso(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDateIso(yesterday);

    const isTodayDone = this.isDateStreakQualified(todayStr);
    const isYesterdayDone = this.isDateStreakQualified(yesterdayStr);

    // Eğer ne bugün ne de dün 3 ana kategori tamamlanmadıysa seri bozulmuştur
    if (!isTodayDone && !isYesterdayDone) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date();

    // Eğer bugün henüz 3 kategori bitmediyse dünden geriye doğru say (seri henüz kırılmadı, bugünü bekliyor)
    if (!isTodayDone) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = this.formatDateIso(checkDate);
      if (this.isDateStreakQualified(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  renderTopStats() {
    const todayStr = this.formatDateIso(new Date());
    const todaySessions = this.sessions.filter(s => s.dateStr === todayStr);

    const totalMinsToday = todaySessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
    this.statTodaySessions.textContent = todaySessions.length;
    this.statTodayMinutes.textContent = this.formatMinutesToHuman(totalMinsToday);

    const streak = this.calculateStreak();
    this.statStreakDays.textContent = streak;

    // 3 Kategori Tamamlama Durumu
    const hasSpor = todaySessions.some(s => s.category === 'spor');
    const hasDers = todaySessions.some(s => s.category === 'ders');
    const hasYar = todaySessions.some(s => s.category === 'yaraticilik');

    const reqSpor = document.getElementById('req-spor');
    const reqDers = document.getElementById('req-ders');
    const reqYar = document.getElementById('req-yaraticilik');

    if (reqSpor) {
      reqSpor.textContent = hasSpor ? '🏃 ✓' : '🏃 0/1';
      reqSpor.classList.toggle('completed', hasSpor);
    }
    if (reqDers) {
      reqDers.textContent = hasDers ? '📚 ✓' : '📚 0/1';
      reqDers.classList.toggle('completed', hasDers);
    }
    if (reqYar) {
      reqYar.textContent = hasYar ? '🎨 ✓' : '🎨 0/1';
      reqYar.classList.toggle('completed', hasYar);
    }

    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    this.todayDateText.textContent = new Date().toLocaleDateString('tr-TR', options);
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

  formatDateIso(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  render() {
    this.renderSquareCards();
    this.renderTopStats();
    if (this.activeView === 'calendar') {
      this.renderCalendar();
      this.renderDaySessions(this.selectedCalendarDate);
    } else if (this.activeView === 'stats') {
      this.renderStatsView();
    }
  }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MomentumApp();
});
