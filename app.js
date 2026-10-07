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

const EMOJI_LIST = [
  // Hızlı & Genel
  '⚡', '🎯', '🔥', '✨', '🚀', '💡', '☕',
  // Spor & Egzersiz (Yürüyüş, Yüzme, Kalisteniks, Halter, vb.)
  '🏃‍♂️', '🚶‍♂️', '🏊‍♂️', '🤸‍♂️', '🏋️‍♂️', '🧗‍♂️', '🚴‍♂️', '🧘‍♂️', '🥊', '⚽', '💪',
  // Müzik & Enstrümanlar (Davul, Piyano, Gitar, vb.)
  '🥁', '🎹', '🎸', '🎻', '🎙️', '🎵', '🎧',
  // Diller & Bayraklar (İngilizce, Almanca, vb.)
  '🇬🇧', '🇩🇪', '🇯🇵', '🇹🇷', '✍️',
  // Tarih, Antik & Zihin
  '🏛️', '📜', '⏳', '🧠', '📚', '📖', '💻', '🎨', '🔬', '🔭',
  // Tatlı Böcekler & Doğa
  '🐞', '🌿', '🌱', '👑'
];

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
      activeTodo: null,
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

    // Görevlerim (To-Do) durumu
    this.todos = this.loadTodos();
    this.todoFilter = 'all'; // 'all', 'active', 'completed'

    // Profil Alt Başlık Seviyeleri filtre durumu
    this.subcatLevelFilter = 'all'; // 'all', 'spor', 'ders', 'yaraticilik'

    this.titleFlashInterval = null;
    this.timerWorker = null;
    this.initTimerWorker();

    this.initDOM();
    this.bindEvents();
    this.render();
    this.initSync();
  }

  initTimerWorker() {
    try {
      const workerCode = `
        let timerId = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (timerId) clearInterval(timerId);
            timerId = setInterval(() => {
              self.postMessage('tick');
            }, 500);
          } else if (e.data === 'stop') {
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.timerWorker = new Worker(URL.createObjectURL(blob));
      this.timerWorker.onmessage = (e) => {
        if (e.data === 'tick') {
          this.syncTimerWithTimestamp();
        }
      };
    } catch (e) {
      console.warn('[Timer] Web Worker başlatılamadı, fallback zamanlayıcı kullanılacak:', e);
      this.timerWorker = null;
    }
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

  loadTodos() {
    const saved = localStorage.getItem('momentum_todos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return [];
  }

  saveTodos(sync = true) {
    localStorage.setItem('momentum_todos', JSON.stringify(this.todos));
    this.updateTodosBadge();
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

    // Sunucu adresi: HTTP ise origin, file:// ise 127.0.0.1:8765
    const baseUrl = window.location.protocol.startsWith('http')
      ? window.location.origin
      : 'http://127.0.0.1:8765';

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

  mergeSessions(localList, remoteList) {
    const map = new Map();
    (remoteList || []).forEach(s => {
      if (s && (s.id || s.timestamp)) {
        map.set(s.id || `ses-${s.timestamp}`, s);
      }
    });
    (localList || []).forEach(s => {
      if (s && (s.id || s.timestamp)) {
        const id = s.id || `ses-${s.timestamp}`;
        if (!map.has(id)) {
          map.set(id, s);
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }

  mergeTodos(localList, remoteList) {
    const map = new Map();
    (remoteList || []).forEach(t => {
      if (t && t.id) map.set(t.id, t);
    });
    (localList || []).forEach(t => {
      if (t && t.id) {
        const existing = map.get(t.id);
        if (!existing || (t.updatedAt || 0) >= (existing.updatedAt || 0)) {
          map.set(t.id, t);
        }
      }
    });
    return Array.from(map.values());
  }

  mergeItems(localItems, remoteItems, isRemoteAuthoritative = false) {
    const result = {};
    const categories = ['spor', 'ders', 'yaraticilik'];

    // Eğer doğrudan sunucu yayınıysa (pollSync) veya uzak veri tam yetkiliyse, doğrudan uzak veriyi kullan
    if (isRemoteAuthoritative && remoteItems) {
      categories.forEach(cat => {
        result[cat] = Array.isArray(remoteItems[cat]) ? remoteItems[cat] : [];
      });
      return result;
    }

    categories.forEach(cat => {
      const itemMap = new Map();
      const rList = (remoteItems && remoteItems[cat]) || [];
      const lList = (localItems && localItems[cat]) || [];

      // 1. Önce merkezi sunucudaki güncel verileri yerleştir
      rList.forEach(it => {
        if (it && it.id) itemMap.set(it.id, { ...it });
      });

      // 2. Yereldeki öğeleri kontrol et: Asla varsayılan/eski verilerle sunucuyu ezme
      lList.forEach(it => {
        if (it && it.id) {
          if (!itemMap.has(it.id)) {
            // Sunucuda hiç olmayan yeni bir öğe ise; varsayılan şablon değilse veya özel oluşturulmuşsa ekle
            const isDefaultId = (DEFAULT_ITEMS[cat] || []).some(d => d.id === it.id);
            if (!isDefaultId || it.updatedAt) {
              itemMap.set(it.id, { ...it });
            }
          } else {
            const existing = itemMap.get(it.id);
            const localTime = it.updatedAt || 0;
            const remoteTime = existing.updatedAt || 0;
            // YALNIZCA yereldeki öğe açıkça sunucudakinden DAHA YENİ düzenlenmişse yereli al
            if (localTime > remoteTime) {
              itemMap.set(it.id, { ...existing, ...it });
            } else {
              // Aksi halde daima merkezi sunucu verisini koru
              itemMap.set(it.id, { ...it, ...existing });
            }
          }
        }
      });
      result[cat] = Array.from(itemMap.values());
    });
    return result;
  }

  recalculateStatsFromSessions() {
    if (!this.items || !this.sessions) return;
    const counts = {};
    const minutes = {};
    this.sessions.forEach(s => {
      if (s && s.itemId) {
        counts[s.itemId] = (counts[s.itemId] || 0) + 1;
        minutes[s.itemId] = (minutes[s.itemId] || 0) + (s.minutes || 0);
      }
    });
    ['spor', 'ders', 'yaraticilik'].forEach(cat => {
      if (Array.isArray(this.items[cat])) {
        this.items[cat].forEach(it => {
          it.sessionsCount = counts[it.id] || 0;
          it.totalMinutes = minutes[it.id] || 0;
        });
      }
    });
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

        const serverSessions = Array.isArray(data.sessions) ? data.sessions : [];
        const localSessions = Array.isArray(this.sessions) ? this.sessions : [];

        // Asla ezme! Akıllı birleştirme (smart merge) yap
        const mergedSessions = this.mergeSessions(localSessions, serverSessions);
        const mergedTodos = this.mergeTodos(this.todos || [], data.todos || []);
        
        // Eğer cihaz ilk kez açılıyorsa (localStorage boş) veya sunucuda geçerli başlıklar varsa
        const hasLocalCustomItems = !!localStorage.getItem('momentum_items');
        let mergedItems;
        if (!hasLocalCustomItems && data.items && Object.keys(data.items).length > 0) {
          mergedItems = data.items;
        } else {
          mergedItems = this.mergeItems(this.items || {}, data.items || {});
        }

        const hadLocalExtraSessions = mergedSessions.length > serverSessions.length;
        const hadLocalExtraTodos = mergedTodos.length > (Array.isArray(data.todos) ? data.todos.length : 0);

        this.sessions = mergedSessions;
        this.todos = mergedTodos;
        this.items = mergedItems;
        this.recalculateStatsFromSessions();

        localStorage.setItem('momentum_sessions', JSON.stringify(this.sessions));
        localStorage.setItem('momentum_todos', JSON.stringify(this.todos));
        localStorage.setItem('momentum_items', JSON.stringify(this.items));
        if (this.updateTodosBadge) this.updateTodosBadge();
        this.render();

        // Eğer yerelde sunucuda henüz olmayan seans/görev varsa hemen sunucuya da gönder
        if (hadLocalExtraSessions || hadLocalExtraTodos) {
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

    // Seansları güvenli birleştir (asla yereldeki yeni seansları silme!)
    if (Array.isArray(data.sessions)) {
      this.sessions = this.mergeSessions(this.sessions || [], data.sessions);
      localStorage.setItem('momentum_sessions', JSON.stringify(this.sessions));
      shouldRender = true;
    }

    // Görevler (To-Do) güncellendiyse
    if (Array.isArray(data.todos)) {
      this.todos = this.mergeTodos(this.todos || [], data.todos);
      localStorage.setItem('momentum_todos', JSON.stringify(this.todos));
      if (this.updateTodosBadge) this.updateTodosBadge();
      shouldRender = true;
    }

    // Kategoriler ve alt başlıklar güncellendiyse
    if (data.items && Object.keys(data.items).length > 0) {
      this.items = this.mergeItems(this.items || {}, data.items, true);
      this.recalculateStatsFromSessions();
      localStorage.setItem('momentum_items', JSON.stringify(this.items));
      shouldRender = true;
    }

    // Uzak sayaç durumu senkronizasyonu
    if (data.timer) {
      if (data.timer.active && !this.timer.isRunning) {
        this.syncRemoteTimer(data.timer);
      } else if (!data.timer.active && this.timer.isRunning) {
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
        todos: this.todos,
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
    this.btnViewTodos = document.getElementById('btn-view-todos');
    this.btnViewCalendar = document.getElementById('btn-view-calendar');
    this.btnViewStats = document.getElementById('btn-view-stats');
    this.todosNavBadge = document.getElementById('todos-nav-badge');

    this.viewCards = document.getElementById('view-cards');
    this.viewTodos = document.getElementById('view-todos');
    this.viewCalendar = document.getElementById('view-calendar');
    this.viewStats = document.getElementById('view-stats');

    // Görevler (To-Do) DOM
    this.todoCreateForm = document.getElementById('todo-create-form');
    this.todoInputText = document.getElementById('todo-input-text');
    this.todoItemSelect = document.getElementById('todo-item-select');
    this.todosFilterTabs = document.getElementById('todos-filter-tabs');
    this.todosListContainer = document.getElementById('todos-list-container');
    this.btnClearCompletedTodos = document.getElementById('btn-clear-completed-todos');
    this.todoMetricTotal = document.getElementById('todo-metric-total');
    this.todoMetricActive = document.getElementById('todo-metric-active');
    this.todoMetricDone = document.getElementById('todo-metric-done');
    this.todoCntAll = document.getElementById('todo-cnt-all');
    this.todoCntActive = document.getElementById('todo-cnt-active');
    this.todoCntCompleted = document.getElementById('todo-cnt-completed');

    // Alt Başlık Seviyeleri (Profil) DOM
    this.subcatLevelsGrid = document.getElementById('subcat-levels-grid');
    this.subcatLevelFilters = document.getElementById('subcat-level-filters');

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
    this.formItemCustomEmoji = document.getElementById('form-item-custom-emoji');
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
    this.levelCurrentProgress = document.getElementById('level-current-progress');
    this.levelNextCost = document.getElementById('level-next-cost');
    this.progSporVal = document.getElementById('prog-spor-val');
    this.progSporBar = document.getElementById('prog-spor-bar');
    this.progDersVal = document.getElementById('prog-ders-val');
    this.progDersBar = document.getElementById('prog-ders-bar');
    this.progYaraticilikVal = document.getElementById('prog-yaraticilik-val');
    this.progYaraticilikBar = document.getElementById('prog-yaraticilik-bar');
    this.sessionRatioPills = document.getElementById('session-ratio-pills');

    // Isı Haritası (Heatmap) DOM
    this.heatmapGrid = document.getElementById('heatmap-grid');
    this.heatmapMonthsLabels = document.getElementById('heatmap-months-labels');
    this.hmActiveDays = document.getElementById('hm-active-days');
    this.hmMaxDay = document.getElementById('hm-max-day');
    this.hmTotalSessions = document.getElementById('hm-total-sessions');
    this.heatmapTooltipText = document.getElementById('heatmap-tooltip-text');

    // Veri Yönetimi & Yedekleme DOM
    this.btnDownloadJsonBackup = document.getElementById('btn-download-json-backup');
    this.btnExportCsv = document.getElementById('btn-export-csv');
    this.inputRestoreFile = document.getElementById('input-restore-file');

    // To-Do & Sayaç Entegrasyonu DOM
    this.timerTodoTag = document.getElementById('timer-todo-tag');
    this.timerTodoText = document.getElementById('timer-todo-text');
    this.celebTodoCard = document.getElementById('celeb-todo-card');
    this.celebTodoTitle = document.getElementById('celeb-todo-title');
    this.btnCelebCompleteTodo = document.getElementById('btn-celeb-complete-todo');

    // Evrensel Bildirim Toastı
    this.toastEl = document.getElementById('toast-notification');

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
    if (this.btnViewTodos) this.btnViewTodos.addEventListener('click', () => this.switchView('todos'));
    this.btnViewCalendar.addEventListener('click', () => this.switchView('calendar'));
    this.btnViewStats.addEventListener('click', () => this.switchView('stats'));

    // Görevler (To-Do) Olayları
    if (this.todoCreateForm) {
      this.todoCreateForm.addEventListener('submit', (e) => this.handleCreateTodo(e));
    }
    if (this.todosFilterTabs) {
      this.todosFilterTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.todo-tab-btn');
        if (btn) {
          this.todosFilterTabs.querySelectorAll('.todo-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.todoFilter = btn.dataset.todoFilter || 'all';
          this.renderTodos();
        }
      });
    }
    if (this.btnClearCompletedTodos) {
      this.btnClearCompletedTodos.addEventListener('click', () => this.clearCompletedTodos());
    }

    // Alt Başlık Seviye Filtreleri (Profil)
    if (this.subcatLevelFilters) {
      this.subcatLevelFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.subcat-filter-btn');
        if (btn) {
          this.subcatLevelFilters.querySelectorAll('.subcat-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.subcatLevelFilter = btn.dataset.subcatFilter || 'all';
          this.renderSubcategoryLevels();
        }
      });
    }

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

    // Veri Yönetimi Butonları
    if (this.btnDownloadJsonBackup) {
      this.btnDownloadJsonBackup.addEventListener('click', () => this.downloadJsonBackup());
    }
    if (this.btnExportCsv) {
      this.btnExportCsv.addEventListener('click', () => this.exportSessionsToCsv());
    }
    if (this.inputRestoreFile) {
      this.inputRestoreFile.addEventListener('change', (e) => this.handleRestoreFile(e));
    }

    // Kutlama Modalı: Görev Tamamlama Butonu
    if (this.btnCelebCompleteTodo) {
      this.btnCelebCompleteTodo.addEventListener('click', () => this.completeActiveTodoFromCelebration());
    }
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
    const navBtns = [this.btnViewCards, this.btnViewTodos, this.btnViewCalendar, this.btnViewStats].filter(Boolean);
    const views = [this.viewCards, this.viewTodos, this.viewCalendar, this.viewStats].filter(Boolean);

    navBtns.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));

    if (viewName === 'cards') {
      if (this.btnViewCards) this.btnViewCards.classList.add('active');
      if (this.viewCards) this.viewCards.classList.add('active');
      this.renderSquareCards();
    } else if (viewName === 'todos') {
      if (this.btnViewTodos) this.btnViewTodos.classList.add('active');
      if (this.viewTodos) this.viewTodos.classList.add('active');
      this.populateTodoItemSelect();
      this.renderTodos();
    } else if (viewName === 'calendar') {
      if (this.btnViewCalendar) this.btnViewCalendar.classList.add('active');
      if (this.viewCalendar) this.viewCalendar.classList.add('active');
      this.renderCalendar();
      this.renderDaySessions(this.selectedCalendarDate);
    } else if (viewName === 'stats') {
      if (this.btnViewStats) this.btnViewStats.classList.add('active');
      if (this.viewStats) this.viewStats.classList.add('active');
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
    const todayStr = this.formatDateIso(new Date());

    currentList.forEach((item, idx) => {
      // O güne ait tamamlanmış seanslar ve süre (her yeni gün 0'dan başlar)
      const todaySessions = this.sessions.filter(s => s.itemId === item.id && s.dateStr === todayStr);
      const todayCount = todaySessions.length;
      const todayMins = todaySessions.reduce((acc, s) => acc + (s.minutes || 0), 0);

      const card = document.createElement('div');
      card.className = 'square-card';
      card.style.setProperty('--card-color', item.color || '#6366f1');
      card.style.setProperty('--i', idx);

      const totalEverCount = item.sessionsCount || 0;
      const sessionMins = this.sessions.filter(s => s.itemId === item.id).reduce((acc, s) => acc + (s.minutes || 0), 0);
      const totalEverMins = Math.max(item.totalMinutes || 0, sessionMins);
      const levelInfo = this.calculateLevelInfo(totalEverMins, item.title);

      card.innerHTML = `
        <div class="card-top">
          <div class="card-emoji-wrap">${item.emoji || '⚡'}</div>
          <span class="card-level-tag" title="${this.escapeHtml(levelInfo.titleName)} (%${levelInfo.percent})">Lv. ${levelInfo.level}</span>
          <div class="card-actions-menu">
            <button class="card-action-btn btn-edit" title="Düzenle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
          </div>
        </div>
        <div class="card-bottom">
          <h4 class="card-title">${this.escapeHtml(item.title)}</h4>
          <div class="card-stats-row" title="Bugün: ${todayCount} seans (${this.formatMinutesToHuman(todayMins)}) • Toplam: ${totalEverCount} seans (${this.formatMinutesToHuman(totalEverMins)}) • ${this.escapeHtml(levelInfo.titleName)}">
            <span>${this.formatMinutesToHuman(todayMins)} bugün</span>
            <span class="card-badge-count ${todayCount > 0 ? 'active' : ''}">${todayCount} seans</span>
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
    const todayStr = this.formatDateIso(new Date());
    ['spor', 'ders', 'yaraticilik'].forEach(c => {
      const el = document.getElementById(`count-${c}`);
      if (el) {
        // Bugün bu kategoride tamamlanan seans sayısı
        const todayCatSessions = this.sessions.filter(s => s.category === c && s.dateStr === todayStr);
        el.textContent = todayCatSessions.length;
        el.title = `Bugün tamamlanan: ${todayCatSessions.length} seans`;
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
        if (this.formItemCustomEmoji) {
          this.formItemCustomEmoji.value = emoji;
          this.formItemCustomEmoji.classList.remove('active-custom');
        }
      });
      this.emojiPicker.appendChild(btn);
    });

    // Sınırsız Özel Emoji Girişi Eventi
    if (this.formItemCustomEmoji) {
      this.formItemCustomEmoji.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          this.formItemEmoji.value = val;
          document.querySelectorAll('.emoji-opt-btn').forEach(b => {
            b.classList.toggle('selected', b.textContent === val);
          });
          this.formItemCustomEmoji.classList.add('active-custom');
        }
      });
    }

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
      if (this.formItemCustomEmoji) {
        this.formItemCustomEmoji.value = item.emoji || '⚡';
      }
      this.formItemColor.value = item.color || '#6366f1';
      this.btnDeleteItem.classList.remove('hidden');

      // Emoji seçimini işaretle
      let matchedInList = false;
      document.querySelectorAll('.emoji-opt-btn').forEach(b => {
        const isMatch = b.textContent === item.emoji;
        b.classList.toggle('selected', isMatch);
        if (isMatch) matchedInList = true;
      });
      if (this.formItemCustomEmoji) {
        this.formItemCustomEmoji.classList.toggle('active-custom', !matchedInList);
      }

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
      this.formItemEmoji.value = '⚡';
      if (this.formItemCustomEmoji) {
        this.formItemCustomEmoji.value = '';
        this.formItemCustomEmoji.classList.remove('active-custom');
      }
      this.btnDeleteItem.classList.add('hidden');

      // İlk emojiyi seç
      document.querySelectorAll('.emoji-opt-btn').forEach((b, idx) => {
        b.classList.toggle('selected', idx === 0);
      });
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
        target.updatedAt = Date.now();
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
        totalMinutes: 0,
        updatedAt: Date.now()
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
  openDurationModal(item, todo = null) {
    this.timer.activeItem = item;
    this.timer.activeTodo = todo;

    if (todo && todo.text) {
      const shortText = todo.text.length > 24 ? todo.text.substring(0, 21) + '...' : todo.text;
      this.modalItemTitle.textContent = `${item.title} • 🎯 ${shortText}`;
    } else {
      this.modalItemTitle.textContent = item.title;
    }

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

    // To-Do ilişkilendirmesi varsa göster
    if (this.timer.activeTodo && this.timer.activeTodo.text) {
      if (this.timerTodoTag) this.timerTodoTag.classList.remove('hidden');
      if (this.timerTodoText) this.timerTodoText.textContent = this.timer.activeTodo.text;
    } else {
      if (this.timerTodoTag) this.timerTodoTag.classList.add('hidden');
    }

    // Renk ayarı
    this.timerCircleProgress.style.stroke = item.color || '#6366f1';
    document.getElementById('focus-glow').style.background = `radial-gradient(circle, ${item.color}26 0%, transparent 70%)`;

    // Rastgele motive edici söz seç
    const quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    this.timerQuote.textContent = `"${quote}"`;

    this.updateTimerDisplay();
    this.focusOverlay.classList.add('active');
    this.playTone(520, 0.15); // Başlangıç zili

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    this.startTimerInterval();
    this.pushTimerStateToServer(true);
  }

  // ==========================================
  // 9. ZAMANLAYICI MOTORU (GERÇEK ZAMANLI TIMESTAMP, WEB WORKER & WEB AUDIO)
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

    // 1. Arka plan Web Worker başlat (Tarayıcı başka sekmedeyken CPU throttling yapmaz, saniyesi saniyesine tetikler)
    if (this.timerWorker) {
      this.timerWorker.postMessage('start');
    }

    // 2. Normal setInterval (ana sayfa aktifken akıcı SVG çember animasyonu için)
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
      if (this.timerWorker) {
        this.timerWorker.postMessage('stop');
      }
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
    if (this.timerWorker) {
      this.timerWorker.postMessage('stop');
    }
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
    if (this.timerWorker) {
      this.timerWorker.postMessage('stop');
    }
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

    if (this.timer.activeTodo) {
      sessionRecord.todoId = this.timer.activeTodo.id;
      sessionRecord.todoText = this.timer.activeTodo.text;
    }

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

    // 1. Tarayıcıyı ve Sekmeyi Öne Getir (macOS Sistem Seviyesinde zorla öne getir)
    this.bringTabToFront();

    // 2. Masaüstü Bildirimi Göster
    this.showDesktopNotification(item, duration);

    // Sayacı Kapat & Kutlamayı Başlat
    this.closeFocusOverlay();
    this.triggerCelebration(sessionRecord);

    // Görünümleri Güncelle
    this.render();
  }

  bringTabToFront() {
    // 1. Tarayıcı içi pencere odaklama
    try {
      window.focus();
    } catch (e) {}

    // 2. Sekme başlığını dikkat çekecek şekilde yanıp söndür
    this.startTitleFlashing("🚨 SÜRE BİTTİ!", "🎉 SEANS TAMAMLANDI!");

    // 3. Arka plan Python sunucusuna işletim sistemi seviyesinde sekme ve tarayıcıyı öne getirme emri ver
    const pin = (this.syncState && this.syncState.pin) ? this.syncState.pin : '2026';
    const candidateUrls = [];
    if (this.syncState && this.syncState.baseUrl) {
      candidateUrls.push(this.syncState.baseUrl);
    }
    ['http://127.0.0.1:8765', 'http://localhost:8765', 'http://127.0.0.1:8080', 'http://localhost:8080'].forEach(u => {
      if (!candidateUrls.includes(u)) candidateUrls.push(u);
    });

    candidateUrls.forEach(url => {
      fetch(`${url}/api/focus-tab?pin=${encodeURIComponent(pin)}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(res => console.log('[Focus] Sekme öne getirme sonucu:', res))
        .catch(err => console.warn('[Focus] API hatası:', err));
    });
  }

  startTitleFlashing(title1, title2) {
    if (this.titleFlashInterval) clearInterval(this.titleFlashInterval);
    let toggle = false;
    this.titleFlashInterval = setInterval(() => {
      document.title = toggle ? title1 : title2;
      toggle = !toggle;
    }, 800);

    const stopFlashing = () => {
      if (this.titleFlashInterval) {
        clearInterval(this.titleFlashInterval);
        this.titleFlashInterval = null;
        document.title = "MOMENTUM | Odak & Gelişim Sistemi";
      }
      window.removeEventListener('focus', stopFlashing);
      document.removeEventListener('visibilitychange', stopFlashing);
    };

    window.addEventListener('focus', stopFlashing, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') stopFlashing();
    });
  }

  showDesktopNotification(item, duration) {
    if (!('Notification' in window)) return;

    const title = `🎉 Seans Tamamlandı! (${duration} dk)`;
    const body = `${item ? (item.emoji + ' ' + item.title) : 'Odaklanma seansın'} başarıyla bitti. Görmek için tıkla!`;

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: body,
          icon: 'icon.svg',
          requireInteraction: true
        });
        notif.onclick = () => {
          window.focus();
          this.bringTabToFront();
          notif.close();
        };
      } catch (e) {
        console.warn('Bildirim hatası:', e);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          try {
            new Notification(title, { body: body, icon: 'icon.svg' });
          } catch (e) {}
        }
      });
    }
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

    // İlişkili To-Do Tamamlama Kutusu
    if (this.timer.activeTodo && !this.timer.activeTodo.completed) {
      if (this.celebTodoCard) this.celebTodoCard.classList.remove('hidden');
      if (this.celebTodoTitle) this.celebTodoTitle.textContent = this.timer.activeTodo.text;
      if (this.btnCelebCompleteTodo) {
        this.btnCelebCompleteTodo.classList.remove('completed-done');
        this.btnCelebCompleteTodo.disabled = false;
        const icon = document.getElementById('celeb-todo-btn-icon');
        const text = document.getElementById('celeb-todo-btn-text');
        if (icon) icon.textContent = '✅';
        if (text) text.textContent = 'Görevi "Tamamlandı" Yap';
      }
    } else {
      if (this.celebTodoCard) this.celebTodoCard.classList.add('hidden');
    }

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
      if (this.isDatePerfectDay(dateStr)) cell.classList.add('streak-perfect');

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
  calculateLevelInfo(totalMins, prefixTitle = '') {
    const titles = [
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

    // =====================================================
    // 25. seviyeye toplam 28.800 dakika = 480 saat
    // olacak şekilde geometrik progression
    // =====================================================
    const TOTAL_MINUTES = 28800; // 480 saat
    const LEVEL_COUNT = 25;
    const GROWTH = 1.1577;

    // Seviye 1'den Seviye 25'e 24 aşamalı geçiş
    const stepCount = LEVEL_COUNT - 1;
    const weights = Array.from(
      { length: stepCount },
      (_, i) => Math.pow(GROWTH, i)
    );

    const weightSum = weights.reduce((sum, w) => sum + w, 0);

    // Her seviyenin artışını toplam 28.800 dakikaya normalize et
    const levelIncrements = weights.map(
      w => (w / weightSum) * TOTAL_MINUTES
    );

    // Kümülatif eşikler: [0, 139, 300, ..., 28800]
    const levelThresholds = [0];
    for (let i = 0; i < stepCount; i++) {
      levelThresholds.push(
        Math.round(levelThresholds[i] + levelIncrements[i])
      );
    }
    levelThresholds[levelThresholds.length - 1] = TOTAL_MINUTES;

    const mins = Math.max(0, totalMins || 0);

    const getFormattedTitle = (lvl) => {
      const base = titles[Math.min(lvl - 1, titles.length - 1)];
      return prefixTitle ? `${prefixTitle} ${base}` : base;
    };

    // Zirve seviyeye ulaşılmışsa (28.800 dk ve üzeri)
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

    // Mevcut seviyeyi bul (1-indexed)
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

  renderStatsView() {
    const totalSessions = this.sessions.length;
    const totalMins = this.sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);

    this.statTotalFocusedTime.textContent = this.formatMinutesToHuman(totalMins);
    this.statTotalSessionsCount.textContent = `${totalSessions} Seans`;

    const streak = this.calculateStreak();
    this.statStreakBig.textContent = `${streak} Gün`;

    // Zorlaştırılmış ve Kademeli Seviye Sistemi (Kullanıcıyı motive eden 25+ unvan ve artan zorluk eğrisi)
    const levelInfo = this.calculateLevelInfo(totalMins);

    this.levelTitle.textContent = `Seviye ${levelInfo.level}: ${levelInfo.titleName}`;
    this.levelPercent.textContent = `%${levelInfo.percent}`;
    this.levelProgressFill.style.width = `${levelInfo.percent}%`;

    if (this.levelCurrentProgress) {
      this.levelCurrentProgress.textContent = `${this.formatMinutesToHuman(levelInfo.minsInCurrent)} / ${this.formatMinutesToHuman(levelInfo.costForNext)}`;
    }
    if (this.levelNextCost) {
      if (levelInfo.isMaxLevel) {
        this.levelNextCost.textContent = `🏆 Zirve Seviye Tamamlandı (480 Saat)`;
      } else {
        this.levelNextCost.textContent = `Sonraki seviyeye: ${this.formatMinutesToHuman(levelInfo.minsLeft)} kaldı`;
      }
    }

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
      const isTodayPerfect = this.isDatePerfectDay(todayStr);
      if (isTodayPerfect) {
        streakEncouragement.innerHTML = `🏆 <strong>Kusursuz Gün!</strong> Bugün Spor, Ders ve Yaratıcılık seanslarının 3'ünü de tamamladın. Harikasın!`;
        streakEncouragement.style.color = 'var(--color-spor)';
        streakEncouragement.style.borderColor = 'rgba(62, 207, 142, 0.25)';
        streakEncouragement.style.background = 'rgba(62, 207, 142, 0.08)';
      } else if (isTodayDone) {
        streakEncouragement.innerHTML = `✨ <strong>Seri Güvende!</strong> Bugün seansını tamamladın ve serini sürdürdün.`;
        streakEncouragement.style.color = 'var(--color-spor)';
        streakEncouragement.style.borderColor = 'rgba(62, 207, 142, 0.25)';
        streakEncouragement.style.background = 'rgba(62, 207, 142, 0.08)';
      } else {
        streakEncouragement.innerHTML = `🔥 Günlük serini sürdürmek için bugün en az 1 seans tamamlamayı unutma!`;
        streakEncouragement.style.color = '#eab308';
        streakEncouragement.style.borderColor = 'rgba(234, 179, 8, 0.25)';
        streakEncouragement.style.background = 'rgba(234, 179, 8, 0.08)';
      }
    }

    // Alt Başlık Bazlı Seviye & Profil Tablosunu Çiz
    this.renderSubcategoryLevels();

    // Momentum Aktivite Isı Haritasını Çiz
    this.renderHeatmap();
  }

  // ==========================================
  // 14. YARDIMCI HESAPLAMALAR & GENEL RENDER
  // ==========================================
  // Bir günün streak sayılması için en az 1 seans tamamlanmış olması yeterlidir
  isDateStreakQualified(dateStr) {
    return this.sessions.some(s => s.dateStr === dateStr);
  }

  // 3 Ana Kategorinin (Spor, Ders, Yaratıcılık) tamamlanıp tamamlanmadığı kontrolü (Kusursuz Gün)
  isDatePerfectDay(dateStr) {
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

    // Ana Ekran Seviye & Unvan Rozeti
    const totalAllMins = this.sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
    const levelInfo = this.calculateLevelInfo(totalAllMins);
    if (this.headerQuote) {
      this.headerQuote.innerHTML = `🎖️ <strong style="color: #60a5fa; font-weight: 600;">Seviye ${levelInfo.level}:</strong> ${levelInfo.titleName}`;
      this.headerQuote.title = `Genel Seviyen: ${levelInfo.level} - ${levelInfo.titleName} (%${levelInfo.percent} • Sonraki seviyeye: ${this.formatMinutesToHuman(levelInfo.minsLeft)}) • Tıkla ve detayları gör`;
      this.headerQuote.onclick = () => this.switchView('stats');
    }
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

  // ==========================================
  // 13.5 KATEGORİ & ALT BAŞLIK SEVİYE SİSTEMİ (PROFİL)
  // ==========================================
  renderSubcategoryLevels() {
    if (!this.subcatLevelsGrid) return;
    this.subcatLevelsGrid.innerHTML = '';

    // Tüm kategorilerdeki alt başlıkları topla
    const allItems = [];
    ['spor', 'ders', 'yaraticilik'].forEach(cat => {
      const list = this.items[cat] || [];
      list.forEach(item => {
        // Bu item'ın toplam dakikasını sessions ve item.totalMinutes üzerinden senkron hesapla
        const sessionMins = this.sessions
          .filter(s => s.itemId === item.id)
          .reduce((acc, s) => acc + (s.minutes || 0), 0);
        const sessionCount = this.sessions.filter(s => s.itemId === item.id).length;
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

    // Filtreleme (all, spor, ders, yaraticilik)
    const filtered = this.subcatLevelFilter === 'all'
      ? allItems
      : allItems.filter(i => i.category === this.subcatLevelFilter);

    // Sıralama: En yüksek seviye ve en çok odak süresi başta
    filtered.sort((a, b) => {
      if (b.levelInfo.level !== a.levelInfo.level) {
        return b.levelInfo.level - a.levelInfo.level;
      }
      return b.totalMins - a.totalMins;
    });

    if (filtered.length === 0) {
      this.subcatLevelsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 36px; color: var(--text-dim);">
          <span style="font-size: 2rem; display: block; margin-bottom: 8px;">🌱</span>
          Henüz bu kategoride alt başlık bulunmuyor.
        </div>
      `;
      return;
    }

    const catLabels = { spor: '🏃 Spor', ders: '📚 Ders', yaraticilik: '🎨 Yaratıcılık' };

    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'subcat-level-card';
      card.style.setProperty('--card-color', item.color || '#6366f1');

      // İlk 3'e özel liderlik derecesi
      let rankHtml = '';
      if (this.subcatLevelFilter === 'all' && item.totalMins > 0) {
        if (index === 0) rankHtml = `<span class="subcat-rank-pill rank-1">👑 1. Lider</span>`;
        else if (index === 1) rankHtml = `<span class="subcat-rank-pill rank-2">🥈 2. Sırada</span>`;
        else if (index === 2) rankHtml = `<span class="subcat-rank-pill rank-3">🥉 3. Sırada</span>`;
      }

      card.innerHTML = `
        <div class="subcat-level-card-top">
          <div class="subcat-item-ident">
            <div class="subcat-ident-emoji" style="border: 1px solid ${item.color || '#6366f1'}33; background: ${item.color || '#6366f1'}15;">
              ${item.emoji || '⚡'}
            </div>
            <div class="subcat-ident-names">
              <span class="subcat-ident-title">${this.escapeHtml(item.title)}</span>
              <span class="subcat-ident-cat">${catLabels[item.category] || item.category}</span>
            </div>
          </div>
          <div class="subcat-badge-wrap">
            ${rankHtml}
            <span class="subcat-level-number-badge">Seviye ${item.levelInfo.level}</span>
          </div>
        </div>

        <div class="subcat-dynamic-title-banner">
          <span class="subcat-custom-title-text">🎖️ ${this.escapeHtml(item.levelInfo.titleName)}</span>
          <span class="subcat-percent-num">%${item.levelInfo.percent}</span>
        </div>

        <div class="subcat-progress-wrap">
          <div class="progress-bar-bg" style="height: 6px;">
            <div class="progress-bar-fill" style="width: ${item.levelInfo.percent}%; background: ${item.color || '#3b82f6'};"></div>
          </div>
          <div class="subcat-progress-meta">
            <span>${this.formatMinutesToHuman(item.levelInfo.minsInCurrent)} / ${this.formatMinutesToHuman(item.levelInfo.costForNext)}</span>
            <span>${item.levelInfo.isMaxLevel ? '🏆 Zirve Seviye' : `${this.formatMinutesToHuman(item.levelInfo.minsLeft)} kaldı`}</span>
          </div>
        </div>

        <div class="subcat-card-bottom">
          <span>Toplam: <strong>${this.formatMinutesToHuman(item.totalMins)}</strong> (${item.totalCount} seans)</span>
          <button type="button" class="subcat-start-focus-btn" title="Bu aktivite için seans başlat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>Odaklan</span>
          </button>
        </div>
      `;

      card.querySelector('.subcat-start-focus-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openDurationModal(item);
      });

      this.subcatLevelsGrid.appendChild(card);
    });
  }

  // ==========================================
  // 14.5 MOMENTUM AKTİVİTE & ODAK ISI HARİTASI (HEATMAP)
  // ==========================================
  renderHeatmap() {
    if (!this.heatmapGrid) return;
    this.heatmapGrid.innerHTML = '';
    if (this.heatmapMonthsLabels) this.heatmapMonthsLabels.innerHTML = '';

    const today = new Date();
    const todayStr = this.formatDateIso(today);

    // Günlük harita oluştur: dateStr -> { minutes: 0, count: 0, items: [] }
    const dayMap = {};
    let totalPeriodSessions = 0;
    let maxDayMins = 0;
    let activeDaysCount = 0;

    this.sessions.forEach(s => {
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

    // 26 hafta (yaklaşık 6 ay) x 7 gün = 182 gün
    const totalWeeks = 26;
    const currentDayOfWeek = (today.getDay() + 6) % 7; // 0: Pzt, ..., 6: Paz

    // Grid'in son günü: bu haftanın Pazarı
    const endGridDate = new Date(today);
    endGridDate.setDate(today.getDate() + (6 - currentDayOfWeek));

    // Başlangıç tarihi: endGridDate'den (26 * 7 - 1) gün öncesi
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

    // İstatistik özetini güncelle
    if (this.hmActiveDays) this.hmActiveDays.textContent = activeDaysCount;
    if (this.hmMaxDay) this.hmMaxDay.textContent = this.formatMinutesToHuman(maxDayMins);
    if (this.hmTotalSessions) this.hmTotalSessions.textContent = totalPeriodSessions;

    // Ay başlıklarını yerleştir (Her hafta sütunu: 13px + 4px gap = 17px)
    if (this.heatmapMonthsLabels) {
      this.heatmapMonthsLabels.innerHTML = '';
      monthOffsets.forEach(mo => {
        const span = document.createElement('span');
        span.textContent = mo.name;
        span.style.position = 'absolute';
        span.style.left = `${32 + (mo.weekIdx * 17)}px`;
        this.heatmapMonthsLabels.appendChild(span);
      });
    }

    // Isı haritası hücrelerini oluştur
    days.forEach(item => {
      const cell = document.createElement('div');
      cell.className = 'hm-cell';

      if (item.isFuture) {
        cell.style.opacity = '0.15';
        cell.style.pointerEvents = 'none';
        cell.classList.add('lvl-0');
      } else {
        const mins = item.info.minutes;
        if (mins === 0) {
          cell.classList.add('lvl-0');
        } else if (mins < 30) {
          cell.classList.add('lvl-1');
        } else if (mins < 60) {
          cell.classList.add('lvl-2');
        } else if (mins < 120) {
          cell.classList.add('lvl-3');
        } else {
          cell.classList.add('lvl-4');
        }

        if (item.isToday) {
          cell.style.borderColor = 'rgba(255, 255, 255, 0.85)';
        }

        const parts = item.dateStr.split('-');
        const dateFormatted = `${parseInt(parts[2], 10)} ${monthNamesTr[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
        const itemHint = item.info.items.length > 0 ? ` (${item.info.items.slice(0, 3).join(', ')})` : '';
        const descText = mins > 0
          ? `📅 ${dateFormatted}: ${this.formatMinutesToHuman(mins)} odaklanma (${item.info.count} seans)${itemHint}`
          : `📅 ${dateFormatted}: Odak seansı bulunmuyor`;

        cell.setAttribute('title', descText);

        const updateNote = () => {
          if (this.heatmapTooltipText) {
            this.heatmapTooltipText.textContent = descText;
            this.heatmapTooltipText.style.color = mins > 0 ? 'var(--color-spor)' : 'var(--text-muted)';
          }
        };

        cell.addEventListener('mouseenter', updateNote);
        cell.addEventListener('click', () => {
          updateNote();
          document.querySelectorAll('.hm-cell.active-selected').forEach(c => c.classList.remove('active-selected'));
          cell.classList.add('active-selected');
        });
      }

      this.heatmapGrid.appendChild(cell);
    });
  }

  // ==========================================
  // 14.6 VERİ YÖNETİMİ, YEDEKLEME & CSV DIŞA AKTARMA
  // ==========================================
  showToast(msg, duration = 3500) {
    if (!this.toastEl) return;
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('active');
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('active');
    }, duration);
  }

  downloadJsonBackup() {
    try {
      const backupData = {
        items: this.items,
        sessions: this.sessions,
        todos: this.todos,
        exportedAt: new Date().toISOString(),
        version: "2.0",
        system: "MOMENTUM Focus & Habit System"
      };
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const todayStr = this.formatDateIso(new Date());
      a.href = url;
      a.download = `momentum_backup_${todayStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast("💾 Sistem JSON yedeği başarıyla indirildi!");
    } catch (e) {
      console.error(e);
      alert("Yedek indirilirken hata oluştu: " + e.message);
    }
  }

  exportSessionsToCsv() {
    try {
      if (!this.sessions || this.sessions.length === 0) {
        alert("Henüz kaydedilmiş bir seans geçmişi bulunmuyor.");
        return;
      }

      const categoryLabels = {
        spor: "Spor",
        ders: "Ders",
        yaraticilik: "Yaratıcılık"
      };

      // UTF-8 BOM ekliyoruz (Excel ve Numbers Türkçe harfleri düzgün açsın)
      let csv = "\uFEFF";
      csv += "Tarih;Saat;Kategori;Alt Başlık / Aktivite;Süre (Dk);Formatlı Süre;İlişkili Görev;Kayıt ID\n";

      // En yeni seanslar en üstte
      const sorted = [...this.sessions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      sorted.forEach(s => {
        const d = new Date(s.timestamp || Date.now());
        const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        const catName = categoryLabels[s.category] || s.category || "";
        const titleName = (s.itemTitle || "").replace(/;/g, ',');
        const mins = s.minutes || 0;
        const formatted = this.formatMinutesToHuman(mins).replace(/;/g, ',');
        const todoText = (s.todoText || "").replace(/;/g, ',');
        const id = s.id || "";

        csv += `"${s.dateStr || ''}";"${timeStr}";"${catName}";"${titleName}";${mins};"${formatted}";"${todoText}";"${id}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const todayStr = this.formatDateIso(new Date());
      a.href = url;
      a.download = `momentum_seanslar_${todayStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast("📊 Excel & CSV seans tablosu başarıyla indirildi!");
    } catch (e) {
      console.error(e);
      alert("CSV tablosu oluşturulurken hata oluştu: " + e.message);
    }
  }

  handleRestoreFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target.result);
        if (!content || typeof content !== 'object') {
          throw new Error("Geçersiz veya bozuk JSON dosyası.");
        }

        const sessCount = Array.isArray(content.sessions) ? content.sessions.length : 0;
        const todoCount = Array.isArray(content.todos) ? content.todos.length : 0;
        const hasItems = content.items && typeof content.items === 'object';

        if (!sessCount && !todoCount && !hasItems) {
          throw new Error("Bu yedek dosyasında geçerli Momentum verisi (seanslar, görevler veya alt başlıklar) bulunamadı.");
        }

        const confirmMsg = `Yedek dosyası başarıyla analiz edildi:\n\n• ${sessCount} adet seans kaydı\n• ${todoCount} adet görev\n• ${hasItems ? 'Özel alt başlıklar' : 'Mevcut alt başlıklar'}\n\nMevcut verilerin üzerine bu yedek yüklenecek. Onaylıyor musun?`;
        if (!confirm(confirmMsg)) {
          event.target.value = '';
          return;
        }

        if (content.items) this.items = content.items;
        if (Array.isArray(content.sessions)) this.sessions = content.sessions;
        if (Array.isArray(content.todos)) this.todos = content.todos;

        this.saveItems();
        this.saveSessions();
        this.saveTodos();
        await this.pushFullStateToServer();

        this.render();
        this.showToast("✅ Yedek başarıyla geri yüklendi!");
      } catch (err) {
        console.error(err);
        alert("Yedek geri yüklenirken hata oluştu: " + err.message);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  // Kutlama Ekranından Görevi Tamamlama
  completeActiveTodoFromCelebration() {
    if (!this.timer.activeTodo) return;
    const todo = this.todos.find(t => t.id === this.timer.activeTodo.id);
    if (todo) {
      todo.completed = true;
      todo.completedAt = Date.now();
      this.saveTodos();
      this.renderTodos();
    }

    if (this.btnCelebCompleteTodo) {
      this.btnCelebCompleteTodo.classList.add('completed-done');
      this.btnCelebCompleteTodo.disabled = true;
      const icon = document.getElementById('celeb-todo-btn-icon');
      const text = document.getElementById('celeb-todo-btn-text');
      if (icon) icon.textContent = '🎉';
      if (text) text.textContent = '✓ Görev Tamamlandı!';
    }

    this.playTone(650, 0.25);
    this.showToast("🎯 Görev başarıyla 'Tamamlandı' olarak işaretlendi!");
  }

  // ==========================================
  // 15. GÖREVLERİM (TO-DO LİSTESİ) METODLARI
  // ==========================================
  populateTodoItemSelect() {
    if (!this.todoItemSelect) return;
    const currentVal = this.todoItemSelect.value;
    this.todoItemSelect.innerHTML = '<option value="">📌 Genel (Bağımsız Görev)</option>';

    const catLabels = { spor: '🏃 Spor', ders: '📚 Ders', yaraticilik: '🎨 Yaratıcılık' };
    ['spor', 'ders', 'yaraticilik'].forEach(cat => {
      const list = this.items[cat] || [];
      if (list.length > 0) {
        const group = document.createElement('optgroup');
        group.label = catLabels[cat];
        list.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.id;
          opt.textContent = `${item.emoji || '⚡'} ${item.title}`;
          group.appendChild(opt);
        });
        this.todoItemSelect.appendChild(group);
      }
    });

    if (currentVal) this.todoItemSelect.value = currentVal;
  }

  handleCreateTodo(e) {
    e.preventDefault();
    const text = (this.todoInputText?.value || '').trim();
    if (!text) return;

    const selectedItemId = this.todoItemSelect?.value || '';
    let targetItem = null;
    if (selectedItemId) {
      for (const cat of ['spor', 'ders', 'yaraticilik']) {
        const found = this.items[cat]?.find(i => i.id === selectedItemId);
        if (found) { targetItem = found; break; }
      }
    }

    const newTodo = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: text,
      completed: false,
      createdAt: Date.now(),
      completedAt: null,
      itemId: targetItem ? targetItem.id : null,
      itemTitle: targetItem ? targetItem.title : null,
      itemEmoji: targetItem ? targetItem.emoji : null,
      itemColor: targetItem ? targetItem.color : null,
      category: targetItem ? targetItem.category : 'general'
    };

    this.todos.unshift(newTodo);
    this.saveTodos();
    if (this.todoInputText) this.todoInputText.value = '';
    this.renderTodos();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? Date.now() : null;
    this.saveTodos();
    this.renderTodos();
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
    this.renderTodos();
  }

  editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;
    const newText = prompt("Görevi düzenle:", todo.text);
    if (newText !== null && newText.trim() !== '') {
      todo.text = newText.trim();
      this.saveTodos();
      this.renderTodos();
    }
  }

  clearCompletedTodos() {
    const completedCount = this.todos.filter(t => t.completed).length;
    if (completedCount === 0) return;
    if (confirm(`${completedCount} adet tamamlanan görevi silmek istediğine emin misin?`)) {
      this.todos = this.todos.filter(t => !t.completed);
      this.saveTodos();
      this.renderTodos();
    }
  }

  updateTodosBadge() {
    if (!this.todosNavBadge) return;
    const activeCount = this.todos.filter(t => !t.completed).length;
    if (activeCount > 0) {
      this.todosNavBadge.textContent = activeCount;
      this.todosNavBadge.classList.remove('hidden');
    } else {
      this.todosNavBadge.classList.add('hidden');
    }
  }

  renderTodos() {
    if (!this.todosListContainer) return;
    this.todosListContainer.innerHTML = '';

    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const active = total - completed;

    // Metrik sayaçlarını güncelle
    if (this.todoMetricTotal) this.todoMetricTotal.textContent = total;
    if (this.todoMetricActive) this.todoMetricActive.textContent = active;
    if (this.todoMetricDone) this.todoMetricDone.textContent = completed;
    if (this.todoCntAll) this.todoCntAll.textContent = total;
    if (this.todoCntActive) this.todoCntActive.textContent = active;
    if (this.todoCntCompleted) this.todoCntCompleted.textContent = completed;

    this.updateTodosBadge();

    // Filtreleme
    let list = this.todos;
    if (this.todoFilter === 'active') {
      list = this.todos.filter(t => !t.completed);
    } else if (this.todoFilter === 'completed') {
      list = this.todos.filter(t => t.completed);
    }

    if (list.length === 0) {
      let emptyMsg = "Henüz eklenmiş bir görev bulunmuyor. Yukarıdan serbest cümleni yazarak başla!";
      if (this.todoFilter === 'active') emptyMsg = "Harika! Bekleyen hiçbir görevin yok, tüm hedefleri tamamladın 🎉";
      else if (this.todoFilter === 'completed') emptyMsg = "Henüz tamamlanan bir görev yok. Hadi birini bitirelim!";

      this.todosListContainer.innerHTML = `
        <div class="todo-empty-state">
          <div class="todo-empty-icon">📝</div>
          <div class="todo-empty-text">${emptyMsg}</div>
        </div>
      `;
      return;
    }

    list.forEach(todo => {
      const card = document.createElement('div');
      card.className = `todo-item-card ${todo.completed ? 'completed' : ''}`;

      // Etiket
      let tagHtml = '';
      if (todo.itemTitle) {
        tagHtml = `
          <span class="todo-tag-pill" style="border-color: ${todo.itemColor || '#7c8cf8'}44; background: ${todo.itemColor || '#7c8cf8'}15; color: ${todo.itemColor || '#7c8cf8'};">
            ${todo.itemEmoji || '⚡'} ${this.escapeHtml(todo.itemTitle)}
          </span>
        `;
      } else {
        tagHtml = `<span class="todo-tag-pill">📌 Genel</span>`;
      }

      // Tarih
      const d = new Date(todo.createdAt || Date.now());
      const dateText = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

      // Odaklanma butonu (Hem ilişkili alt başlığı olan hem de genel görevler için çalışır)
      const focusBtnHtml = `
        <button type="button" class="todo-act-btn focus-act" title="Bu göreve odaklanarak seans başlat">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>
      `;

      card.innerHTML = `
        <div class="todo-item-left">
          <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} title="Tamamlandı olarak işaretle">
          <div class="todo-item-body">
            <span class="todo-item-text">${this.escapeHtml(todo.text)}</span>
            <div class="todo-item-meta">
              ${tagHtml}
              <span>${dateText}</span>
            </div>
          </div>
        </div>
        <div class="todo-item-actions">
          ${focusBtnHtml}
          <button type="button" class="todo-act-btn edit-act" title="Görevi Düzenle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button type="button" class="todo-act-btn delete-act" title="Görevi Sil">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      // Checkbox event
      const cb = card.querySelector('.todo-checkbox');
      cb.addEventListener('change', () => this.toggleTodo(todo.id));

      // Edit event
      const editBtn = card.querySelector('.edit-act');
      if (editBtn) editBtn.addEventListener('click', () => this.editTodo(todo.id));

      // Delete event
      const delBtn = card.querySelector('.delete-act');
      if (delBtn) delBtn.addEventListener('click', () => this.deleteTodo(todo.id));

      // Focus event (Görevi canlı sayaç ile başlatma)
      const focusBtn = card.querySelector('.focus-act');
      if (focusBtn) {
        focusBtn.addEventListener('click', () => {
          let foundItem = null;
          if (todo.itemId) {
            for (const cat of ['spor', 'ders', 'yaraticilik']) {
              const f = this.items[cat]?.find(i => i.id === todo.itemId);
              if (f) { foundItem = f; break; }
            }
          }
          if (!foundItem) {
            // Genel görevler için ders veya ilk aktiviteyi seç
            foundItem = this.items.ders?.[0] || {
              id: 'genel-odak',
              title: 'Genel Odak',
              emoji: '🎯',
              category: 'ders',
              color: '#38bdf8'
            };
          }
          this.openDurationModal(foundItem, todo);
        });
      }

      this.todosListContainer.appendChild(card);
    });
  }

  render() {
    this.renderSquareCards();
    this.renderTopStats();
    this.updateTodosBadge();
    this.populateTodoItemSelect();
    if (this.activeView === 'calendar') {
      this.renderCalendar();
      this.renderDaySessions(this.selectedCalendarDate);
    } else if (this.activeView === 'stats') {
      this.renderStatsView();
    } else if (this.activeView === 'todos') {
      this.renderTodos();
    }
  }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MomentumApp();
});
