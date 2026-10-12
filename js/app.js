/**
 * MOMENTUM - Odak & Gelişim Sistemi (App Coordinator / Facade)
 * Temiz Mimari: Tüm alt servisleri (Storage, Audio, Timer, Sync, Todos, Calendar, Analytics, UI)
 * bir araya getiren ve kullanıcı etkileşimlerini yöneten orkestratör sınıf.
 */

class MomentumApp {
  constructor() {
    // 1. Modüler Servislerin Başlatılması
    this.storage = new StorageService();
    this.audio = new AudioService();
    this.timerService = new TimerService();
    this.syncService = new SyncService();
    this.todoManager = new TodoManager();
    this.calendarManager = new CalendarManager();
    this.analyticsManager = new AnalyticsManager();
    this.uiManager = new UIManager();

    // 2. Uygulama Durumu (State)
    this.activeCategory = 'spor';
    this.activeView = 'cards';
    this.subcatLevelFilter = 'all';

    // Verileri yükle
    this.items = this.storage.loadItems();
    this.sessions = this.storage.loadSessions();
    this.todos = this.storage.loadTodos();
    this.todoManager.setTodos(this.todos);

    // Geriye dönük uyumluluk için timer referansı
    this.timer = this.timerService.state;

    // 3. Arayüz ve Dinleyiciler
    this.initDOM();
    this.bindEvents();
    this.setupServiceCallbacks();

    // 4. İlk Çizim ve Senkronizasyon
    this.render();
    this.initSync();
  }

  get todoFilter() {
    return this.todoManager.filter;
  }
  set todoFilter(val) {
    this.todoManager.filter = val;
  }

  get isAmbientPlaying() {
    return this.audio.isAmbientPlaying;
  }

  get calendarCurrentDate() {
    return this.calendarManager.currentDate;
  }
  set calendarCurrentDate(val) {
    this.calendarManager.currentDate = val;
  }

  get selectedCalendarDate() {
    return this.calendarManager.selectedDate;
  }
  set selectedCalendarDate(val) {
    this.calendarManager.selectedDate = val;
  }

  // ==========================================
  // SERVIS GERİ ÇAĞIRMALARI (SERVICE CALLBACKS)
  // ==========================================
  setupServiceCallbacks() {
    // Zamanlayıcı Callback'leri
    this.timerService.init({
      onTick: (timerState) => {
        this.updateTimerDisplay();
      },
      onFinish: (sessionInfo) => {
        this.finishSessionSuccessfully();
      },
      onStateChange: (timerState, isPlaying) => {
        this.updateTimerPlayPauseBtn(isPlaying);
        this.pushTimerStateToServer(isPlaying);
      }
    });
  }

  initSync() {
    this.syncService.init({
      onBadgeUpdate: (online, text) => {
        this.updateSyncBadge(online, text);
      },
      onDataUpdated: async (data, isInitial) => {
        let shouldRender = false;

        // Seanslar
        if (Array.isArray(data.sessions)) {
          this.sessions = this.syncService.mergeSessions(this.sessions || [], data.sessions);
          this.storage.saveSessions(this.sessions);
          shouldRender = true;
        }

        // Görevler
        if (Array.isArray(data.todos)) {
          this.todos = this.syncService.mergeTodos(this.todos || [], data.todos);
          this.todoManager.setTodos(this.todos);
          this.storage.saveTodos(this.todos);
          shouldRender = true;
        }

        // Alt Başlıklar
        if (data.items && Object.keys(data.items).length > 0) {
          const hasLocalCustom = !!localStorage.getItem('momentum_items');
          if (isInitial && !hasLocalCustom) {
            this.items = data.items;
          } else {
            this.items = this.syncService.mergeItems(this.items || {}, data.items, !isInitial);
          }
          this.recalculateStatsFromSessions();
          this.storage.saveItems(this.items);
          shouldRender = true;
        }

        if (shouldRender) {
          this.render();
        }
      },
      onTimerSync: (remoteTimer) => {
        if (!this.timer.isRunning) {
          this.syncRemoteTimer(remoteTimer);
        }
      },
      onTimerClose: () => {
        if (this.timer.isRunning) {
          this.closeFocusOverlaySilently();
          this.render();
        }
      }
    });
  }

  // ==========================================
  // VERİ KAYIT & SENKRONİZASYON
  // ==========================================
  saveItems(sync = true) {
    this.storage.saveItems(this.items);
    if (sync) this.pushSyncToServer();
  }

  saveSessions(sync = true) {
    this.storage.saveSessions(this.sessions);
    if (sync) this.pushSyncToServer();
  }

  saveTodos(sync = true) {
    this.storage.saveTodos(this.todos);
    this.updateTodosBadge();
    if (sync) this.pushSyncToServer();
  }

  async pushSyncToServer() {
    const payload = {
      items: this.items,
      sessions: this.sessions,
      todos: this.todos,
      timer: this.timerService.getSyncPayload()
    };
    await this.syncService.pushSync(payload);
  }

  async pushTimerStateToServer(isActive) {
    const timerState = {
      active: isActive,
      item: isActive ? this.timer.activeItem : null,
      durationMinutes: this.timer.durationMinutes,
      targetEndTime: this.timer.targetEndTime,
      remainingSeconds: this.timer.remainingSeconds,
      totalSeconds: this.timer.totalSeconds
    };
    await this.syncService.pushTimerState(timerState);
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

  // ==========================================
  // DOM ELEMANLARI
  // ==========================================
  initDOM() {
    // Sekmeler
    this.catTabs = document.querySelectorAll('.cat-tab');
    this.btnViewCards = document.getElementById('btn-view-cards');
    this.btnViewTodos = document.getElementById('btn-view-todos');
    this.btnViewCalendar = document.getElementById('btn-view-calendar');
    this.btnViewStats = document.getElementById('btn-view-stats');
    this.todosNavBadge = document.getElementById('todos-nav-badge');

    // Görünümler
    this.viewCards = document.getElementById('view-cards');
    this.viewTodos = document.getElementById('view-todos');
    this.viewCalendar = document.getElementById('view-calendar');
    this.viewStats = document.getElementById('view-stats');

    // Görevler DOM
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

    // Profil Alt Başlık Seviyeleri DOM
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

    // Isı Haritası DOM
    this.heatmapGrid = document.getElementById('heatmap-grid');
    this.heatmapMonthsLabels = document.getElementById('heatmap-months-labels');
    this.hmActiveDays = document.getElementById('hm-active-days');
    this.hmMaxDay = document.getElementById('hm-max-day');
    this.hmTotalSessions = document.getElementById('hm-total-sessions');
    this.heatmapTooltipText = document.getElementById('heatmap-tooltip-text');

    // Veri Yönetimi DOM
    this.btnDownloadJsonBackup = document.getElementById('btn-download-json-backup');
    this.btnExportCsv = document.getElementById('btn-export-csv');
    this.inputRestoreFile = document.getElementById('input-restore-file');

    // To-Do & Sayaç Entegrasyonu DOM
    this.timerTodoTag = document.getElementById('timer-todo-tag');
    this.timerTodoText = document.getElementById('timer-todo-text');
    this.celebTodoCard = document.getElementById('celeb-todo-card');
    this.celebTodoTitle = document.getElementById('celeb-todo-title');
    this.btnCelebCompleteTodo = document.getElementById('btn-celeb-complete-todo');

    // Toast & Sync Rozeti
    this.toastEl = document.getElementById('toast-notification');
    this.syncBadge = document.getElementById('sync-badge');
    this.syncText = document.getElementById('sync-text');

    // Renk ve Emoji Seçicilerini Hazırla
    this.uiManager.renderPickers({
      emojiPickerEl: this.emojiPicker,
      colorPickerEl: this.colorPicker,
      formItemEmoji: this.formItemEmoji,
      formItemColor: this.formItemColor,
      formItemCustomEmoji: this.formItemCustomEmoji
    });
  }

  // ==========================================
  // OLAY DİNLEYİCİLERİ (EVENT BINDINGS)
  // ==========================================
  bindEvents() {
    // Kategori Sekmeleri
    this.catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchCategory(tab.dataset.category);
      });
    });

    // Ana Görünüm Sekmeleri
    this.btnViewCards?.addEventListener('click', () => this.switchView('cards'));
    this.btnViewTodos?.addEventListener('click', () => this.switchView('todos'));
    this.btnViewCalendar?.addEventListener('click', () => this.switchView('calendar'));
    this.btnViewStats?.addEventListener('click', () => this.switchView('stats'));

    // To-Do Filtreleri
    this.todosFilterTabs?.querySelectorAll('.todo-ftab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.todosFilterTabs.querySelectorAll('.todo-ftab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.todoFilter = tab.dataset.filter;
        this.renderTodos();
      });
    });

    // To-Do Ekleme & Temizleme
    this.todoCreateForm?.addEventListener('submit', (e) => this.handleCreateTodo(e));
    this.btnClearCompletedTodos?.addEventListener('click', () => this.clearCompletedTodos());
    this.btnCelebCompleteTodo?.addEventListener('click', () => this.completeActiveTodoFromCelebration());

    // Alt Başlık Seviye Filtreleri
    this.subcatLevelFilters?.querySelectorAll('.subcat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.subcatLevelFilters.querySelectorAll('.subcat-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.subcatLevelFilter = btn.dataset.cat;
        this.renderSubcategoryLevels();
      });
    });

    // Tam Ekran Butonları
    this.btnFullscreenToggle?.addEventListener('click', () => this.uiManager.toggleFullscreen());
    this.btnTimerFullscreen?.addEventListener('click', () => this.uiManager.toggleFullscreen());

    // Sayaç Kontrolleri
    this.btnTimerPlayPause?.addEventListener('click', () => this.toggleTimer());
    this.btnTimerReset?.addEventListener('click', () => this.resetTimer());
    this.btnTimerFinish?.addEventListener('click', () => this.completeSessionManually());
    this.btnMinimizeTimer?.addEventListener('click', () => this.closeFocusOverlay());
    this.btnAmbientSound?.addEventListener('click', () => this.toggleAmbientSound());

    // Süre Seçim Modalı
    this.btnCloseDurationModal?.addEventListener('click', () => this.closeDurationModal());
    document.querySelectorAll('.duration-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const mins = parseInt(pill.dataset.mins, 10);
        this.startSession(mins);
      });
    });

    // Kart Form Modalı
    this.btnOpenCreateItem?.addEventListener('click', () => this.openItemForm(null));
    this.btnCloseFormModal?.addEventListener('click', () => this.closeItemForm());
    this.btnCancelForm?.addEventListener('click', () => this.closeItemForm());
    this.itemForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));
    this.btnDeleteItem?.addEventListener('click', () => this.handleDeleteItem());

    // Kutlama Modalı
    this.btnCloseCelebration?.addEventListener('click', () => this.closeCelebration());

    // Takvim Gezinimi
    this.btnPrevMonth?.addEventListener('click', () => {
      this.calendarManager.prevMonth();
      this.renderCalendar();
    });
    this.btnNextMonth?.addEventListener('click', () => {
      this.calendarManager.nextMonth();
      this.renderCalendar();
    });
    this.btnJumpToday?.addEventListener('click', () => {
      this.calendarManager.jumpToday();
      this.renderCalendar();
      this.renderDaySessions(this.selectedCalendarDate);
    });

    // Yedekleme & CSV
    this.btnDownloadJsonBackup?.addEventListener('click', () => this.downloadJsonBackup());
    this.btnExportCsv?.addEventListener('click', () => this.exportSessionsToCsv());
    this.inputRestoreFile?.addEventListener('change', (e) => this.handleRestoreFile(e));

    // Klavye Kısayolları (Space: Play/Pause, Esc: Kapat, F: Tam Ekran)
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (this.focusOverlay?.classList.contains('active')) {
        if (e.code === 'Space') {
          e.preventDefault();
          this.toggleTimer();
        } else if (e.code === 'Escape') {
          e.preventDefault();
          this.closeFocusOverlay();
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          this.uiManager.toggleFullscreen();
        }
      }
    });
  }

  // ==========================================
  // GÖRÜNÜM & KATEGORİ GEÇİŞLERİ
  // ==========================================
  switchCategory(cat) {
    this.activeCategory = cat;
    this.catTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === cat);
    });

    const info = {
      spor: { title: 'Spor & Hareket', desc: 'Fiziksel zindelik ve enerji için odak seansları.' },
      ders: { title: 'Ders & Çalışma', desc: 'Derin odaklanma ve zihinsel gelişim seansları.' },
      yaraticilik: { title: 'Yaratıcılık & Üretim', desc: 'Sanat, tasarım, müzik ve üretim alanları.' }
    }[cat] || { title: 'Odak Alanı', desc: '' };

    if (this.activeCatTitle) this.activeCatTitle.textContent = info.title;
    if (this.activeCatDesc) this.activeCatDesc.textContent = info.desc;

    this.renderSquareCards();
  }

  switchView(viewName) {
    this.activeView = viewName;

    // Menü Butonları
    const navButtons = {
      cards: this.btnViewCards,
      todos: this.btnViewTodos,
      calendar: this.btnViewCalendar,
      stats: this.btnViewStats
    };
    Object.keys(navButtons).forEach(key => {
      if (navButtons[key]) navButtons[key].classList.toggle('active', key === viewName);
    });

    // Görünüm Kapsayıcıları
    const views = {
      cards: this.viewCards,
      todos: this.viewTodos,
      calendar: this.viewCalendar,
      stats: this.viewStats
    };
    Object.keys(views).forEach(key => {
      if (views[key]) views[key].classList.toggle('active', key === viewName);
    });

    // Görünüme özel çizim
    if (viewName === 'calendar') {
      this.renderCalendar();
      this.renderDaySessions(this.selectedCalendarDate);
    } else if (viewName === 'stats') {
      this.renderStatsView();
    } else if (viewName === 'todos') {
      this.renderTodos();
    }
  }

  // ==========================================
  // KARTLAR & MODALLAR
  // ==========================================
  renderSquareCards() {
    if (!this.itemsGrid) return;
    this.itemsGrid.innerHTML = '';

    const currentList = this.items[this.activeCategory] || [];
    const todayStr = this.analyticsManager.formatDateIso(new Date());

    currentList.forEach((item, idx) => {
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
      const levelInfo = this.analyticsManager.calculateLevelInfo(totalEverMins, item.title);

      card.innerHTML = `
        <div class="card-top">
          <div class="card-emoji-wrap">${item.emoji || '⚡'}</div>
          <span class="card-level-tag" title="${this.uiManager.escapeHtml(levelInfo.titleName)} (%${levelInfo.percent})">Lv. ${levelInfo.level}</span>
          <div class="card-actions-menu">
            <button class="card-action-btn btn-edit" title="Düzenle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="card-bottom">
          <h4 class="card-title">${this.uiManager.escapeHtml(item.title)}</h4>
          <div class="card-stats-row" title="Bugün: ${todayCount} seans (${this.analyticsManager.formatMinutesToHuman(todayMins)}) • Toplam: ${totalEverCount} seans (${this.analyticsManager.formatMinutesToHuman(totalEverMins)}) • ${this.uiManager.escapeHtml(levelInfo.titleName)}">
            <span>${this.analyticsManager.formatMinutesToHuman(todayMins)} bugün</span>
            <span class="card-badge-count ${todayCount > 0 ? 'active' : ''}">${todayCount} seans</span>
          </div>
        </div>
      `;

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

    // Yeni Ekle Kartı
    const addCard = document.createElement('div');
    addCard.className = 'add-new-card-placeholder';
    addCard.style.setProperty('--i', currentList.length);
    addCard.innerHTML = `
      <div class="add-plus-icon">+</div>
      <span style="font-weight: 600; font-size: 0.95rem;">Alt Başlık Ekle</span>
    `;
    addCard.addEventListener('click', () => this.openItemForm(null));
    this.itemsGrid.appendChild(addCard);

    this.updateCategoryCounters();
  }

  updateCategoryCounters() {
    const todayStr = this.analyticsManager.formatDateIso(new Date());
    ['spor', 'ders', 'yaraticilik'].forEach(c => {
      const el = document.getElementById(`count-${c}`);
      if (el) {
        const todayCatSessions = this.sessions.filter(s => s.category === c && s.dateStr === todayStr);
        el.textContent = todayCatSessions.length;
        el.title = `Bugün tamamlanan: ${todayCatSessions.length} seans`;
      }
    });
  }

  openItemForm(item = null) {
    if (item) {
      this.formModalTitle.textContent = "Alt Başlığı Düzenle";
      this.formModalSubtitle.textContent = `Aktivite detaylarını ve rengini güncelle`;
      this.formItemId.value = item.id;
      this.formItemName.value = item.title;
      this.formItemEmoji.value = item.emoji || '⚡';
      if (this.formItemCustomEmoji) this.formItemCustomEmoji.value = item.emoji || '⚡';
      this.formItemColor.value = item.color || '#6366f1';
      this.btnDeleteItem?.classList.remove('hidden');

      let matchedInList = false;
      document.querySelectorAll('.emoji-opt-btn').forEach(b => {
        const isMatch = b.textContent === item.emoji;
        b.classList.toggle('selected', isMatch);
        if (isMatch) matchedInList = true;
      });
      if (this.formItemCustomEmoji) {
        this.formItemCustomEmoji.classList.toggle('active-custom', !matchedInList);
      }

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
      this.btnDeleteItem?.classList.add('hidden');

      document.querySelectorAll('.emoji-opt-btn').forEach((b, idx) => {
        b.classList.toggle('selected', idx === 0);
      });
      document.querySelectorAll('.color-swatch').forEach((s, idx) => {
        s.classList.toggle('selected', idx === 0);
      });
      this.formItemColor.value = window.MomentumConstants.COLOR_PALETTE[0].hex;
    }

    this.itemFormModal?.classList.add('active');
    setTimeout(() => this.formItemName?.focus(), 80);
  }

  closeItemForm() {
    this.itemFormModal?.classList.remove('active');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const id = this.formItemId.value;
    const title = this.formItemName.value.trim();
    const emoji = this.formItemEmoji.value || '⚡';
    const color = this.formItemColor.value || '#6366f1';

    if (!title) return;

    const list = this.items[this.activeCategory];
    if (id) {
      const existing = list.find(x => x.id === id);
      if (existing) {
        existing.title = title;
        existing.emoji = emoji;
        existing.color = color;
        existing.updatedAt = Date.now();
      }
    } else {
      const newItem = {
        id: `${this.activeCategory}-${Date.now()}`,
        category: this.activeCategory,
        title,
        emoji,
        color,
        sessionsCount: 0,
        totalMinutes: 0,
        updatedAt: Date.now()
      };
      list.push(newItem);
    }

    this.saveItems();
    this.closeItemForm();
    this.render();
  }

  handleDeleteItem() {
    const id = this.formItemId.value;
    if (!id) return;
    if (confirm("Bu alt başlığı silmek istediğine emin misin?")) {
      this.items[this.activeCategory] = this.items[this.activeCategory].filter(x => x.id !== id);
      this.saveItems();
      this.closeItemForm();
      this.render();
    }
  }

  // ==========================================
  // SÜRE SEÇİMİ & ZAMANLAYICI MOTORU
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
    this.durationModal?.classList.add('active');
  }

  closeDurationModal() {
    this.durationModal?.classList.remove('active');
  }

  startSession(minutes) {
    this.closeDurationModal();
    const item = this.timer.activeItem;
    if (!item) return;

    // Overlay bilgilerini ayarla
    const catLabels = { spor: '🏃‍♂️ Spor', ders: '📚 Ders', yaraticilik: '🎨 Yaratıcılık' };
    this.timerCatTag.textContent = catLabels[item.category] || item.category;
    this.timerItemTitle.textContent = `${item.emoji || ''} ${item.title}`;

    const modeLabels = { 15: 'Kısa (15 dk)', 30: 'Orta (30 dk)', 45: 'Uzun (45 dk)' };
    this.timerModeBadge.textContent = modeLabels[minutes] || `${minutes} dk`;

    if (this.timer.activeTodo && this.timer.activeTodo.text) {
      if (this.timerTodoTag) this.timerTodoTag.classList.remove('hidden');
      if (this.timerTodoText) this.timerTodoText.textContent = this.timer.activeTodo.text;
    } else {
      if (this.timerTodoTag) this.timerTodoTag.classList.add('hidden');
    }

    this.timerCircleProgress.style.stroke = item.color || '#6366f1';
    const focusGlow = document.getElementById('focus-glow');
    if (focusGlow) focusGlow.style.background = `radial-gradient(circle, ${item.color}26 0%, transparent 70%)`;

    const quotes = window.MomentumConstants.MOTIVATION_QUOTES;
    this.timerQuote.textContent = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;

    this.timerService.start(minutes, item, this.timer.activeTodo);

    this.updateTimerDisplay();
    this.focusOverlay?.classList.add('active');
    this.audio.playTone(520, 0.15);

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  toggleTimer() {
    this.timerService.toggle();
    if (!this.timer.isRunning) {
      const titleItem = this.timer.activeItem ? this.timer.activeItem.title : 'Momentum';
      document.title = `⏸️ Duraklatıldı • ${titleItem}`;
      this.audio.playTone(380, 0.1);
    } else {
      this.audio.playTone(520, 0.1);
    }
  }

  resetTimer() {
    this.timerService.reset();
    document.title = "MOMENTUM | Odak & Gelişim Sistemi";
  }

  updateTimerPlayPauseBtn(isPlaying) {
    if (isPlaying) {
      this.btnTimerPlayPause?.classList.add('playing');
      this.playPauseText.textContent = "Duraklat";
      this.playPauseIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
      this.timerStatusText.textContent = "Odaklanma Zamanı";
    } else {
      this.btnTimerPlayPause?.classList.remove('playing');
      this.playPauseText.textContent = "Devam Et";
      this.playPauseIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
      this.timerStatusText.textContent = "Duraklatıldı";
    }
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timer.remainingSeconds / 60);
    const secs = this.timer.remainingSeconds % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (this.timerDigits) this.timerDigits.textContent = timeFormatted;

    if (this.timer.isRunning && this.timer.activeItem) {
      document.title = `⏱️ ${timeFormatted} • ${this.timer.activeItem.title}`;
    }

    const circumference = 2 * Math.PI * 145; // ~911 px
    const fraction = this.timer.totalSeconds > 0 ? (this.timer.remainingSeconds / this.timer.totalSeconds) : 1;
    const offset = circumference * (1 - fraction);
    if (this.timerCircleProgress) this.timerCircleProgress.style.strokeDashoffset = offset;

    const percent = Math.round((1 - fraction) * 100);
    if (this.timerProgressPercent) this.timerProgressPercent.textContent = `%${percent} Tamamlandı`;
  }

  completeSessionManually() {
    if (confirm("Bu seansı şimdi tamamlayıp ilerlemene kaydetmek istiyor musun?")) {
      this.finishSessionSuccessfully();
    }
  }

  finishSessionSuccessfully() {
    this.timerService.stopSilently();
    if (this.isAmbientPlaying) this.audio.stopAmbientSound();

    const item = this.timer.activeItem;
    const duration = this.timer.durationMinutes;

    document.title = "🎉 Seans Tamamlandı! • MOMENTUM";

    const sessionRecord = {
      id: `ses-${Date.now()}`,
      itemId: item ? item.id : 'genel',
      itemTitle: item ? item.title : 'Odak',
      itemEmoji: item ? item.emoji : '⚡',
      category: item ? item.category : 'spor',
      color: item ? item.color : '#3ecf8e',
      minutes: duration,
      timestamp: Date.now(),
      dateStr: this.analyticsManager.formatDateIso(new Date())
    };

    if (this.timer.activeTodo) {
      sessionRecord.todoId = this.timer.activeTodo.id;
      sessionRecord.todoText = this.timer.activeTodo.text;
    }

    this.sessions.push(sessionRecord);
    this.saveSessions();

    if (item) {
      const catList = this.items[item.category];
      const targetItem = catList ? catList.find(x => x.id === item.id) : null;
      if (targetItem) {
        targetItem.sessionsCount = (targetItem.sessionsCount || 0) + 1;
        targetItem.totalMinutes = (targetItem.totalMinutes || 0) + duration;
        this.saveItems();
      }
    }

    this.pushTimerStateToServer(false);

    // Zafer Sesi
    this.audio.playCelebrationMelody();

    // Mac üzerinde sekmeyi öne getir
    this.syncService.requestTabFocus();

    // Masaüstü Bildirimi
    this.uiManager.showDesktopNotification(item, duration, () => {
      this.syncService.requestTabFocus();
    });

    // Sekme başlığı animasyonu
    this.uiManager.startTitleFlashing('🎉 TEBRİKLER!', '⏱️ SEANS BİTTİ');

    this.closeFocusOverlay();
    this.triggerCelebration(sessionRecord);
  }

  closeFocusOverlay() {
    this.timerService.stopSilently();
    if (this.isAmbientPlaying) this.audio.stopAmbientSound();
    this.focusOverlay?.classList.remove('active');
    document.title = "MOMENTUM | Odak & Gelişim Sistemi";
    this.pushTimerStateToServer(false);
  }

  closeFocusOverlaySilently() {
    this.timerService.stopSilently();
    if (this.isAmbientPlaying) this.audio.stopAmbientSound();
    this.focusOverlay?.classList.remove('active');
    document.title = "MOMENTUM | Odak & Gelişim Sistemi";
  }

  syncRemoteTimer(remoteTimer) {
    if (!remoteTimer || !remoteTimer.item) return;
    const ok = this.timerService.applyRemoteTimer(remoteTimer);
    if (!ok) return;

    const catLabels = { spor: '🏃‍♂️ Spor', ders: '📚 Ders', yaraticilik: '🎨 Yaratıcılık' };
    this.timerCatTag.textContent = catLabels[remoteTimer.item.category] || remoteTimer.item.category;
    this.timerItemTitle.textContent = `${remoteTimer.item.emoji || ''} ${remoteTimer.item.title}`;

    const modeLabels = { 15: 'Kısa (15 dk)', 30: 'Orta (30 dk)', 45: 'Uzun (45 dk)' };
    this.timerModeBadge.textContent = modeLabels[this.timer.durationMinutes] || `${this.timer.durationMinutes} dk`;

    this.timerCircleProgress.style.stroke = remoteTimer.item.color || '#6366f1';
    const focusGlow = document.getElementById('focus-glow');
    if (focusGlow) focusGlow.style.background = `radial-gradient(circle, ${remoteTimer.item.color}26 0%, transparent 70%)`;

    this.updateTimerPlayPauseBtn(true);
    this.focusOverlay?.classList.add('active');
  }

  toggleAmbientSound() {
    const isPlaying = this.audio.toggleAmbientSound((playing) => {
      if (this.soundLabel) this.soundLabel.textContent = playing ? 'Zen Sesi Açık' : 'Zen Akışı';
      this.btnAmbientSound?.classList.toggle('playing', playing);
    });
  }

  // ==========================================
  // KUTLAMA & KONFETİ
  // ==========================================
  triggerCelebration(session) {
    const streak = this.analyticsManager.calculateStreak(this.sessions);
    const todayStr = this.analyticsManager.formatDateIso(new Date());
    const isTodayDone = this.analyticsManager.isDatePerfectDay(todayStr, this.sessions);

    this.celebDuration.textContent = `${session.minutes} Dakika`;
    this.celebItem.textContent = `${session.itemEmoji || '⚡'} ${session.itemTitle}`;
    this.celebStreak.textContent = `${streak} Gün`;

    const quotes = window.MomentumConstants.MOTIVATION_QUOTES;
    let quote = quotes[Math.floor(Math.random() * quotes.length)];
    if (isTodayDone) {
      quote = `🏆 TEBRİKLER! Bugün Spor, Ders ve Yaratıcılık seanslarının 3'ünü de tamamlayarak serini (${streak} Gün 🔥) başarıyla kilitledin!`;
    }
    this.celebQuote.textContent = `"${quote}"`;

    // To-Do İlişkisi
    if (this.timer.activeTodo && !this.timer.activeTodo.completed) {
      this.celebTodoCard?.classList.remove('hidden');
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
      this.celebTodoCard?.classList.add('hidden');
    }

    this.celebrationOverlay?.classList.add('active');
    this.uiManager.launchConfetti(this.confettiCanvas);
  }

  closeCelebration() {
    this.celebrationOverlay?.classList.remove('active');
  }

  // ==========================================
  // TAKVİM
  // ==========================================
  renderCalendar() {
    this.calendarManager.renderCalendar(
      this.calendarDaysGrid,
      this.calendarMonthYear,
      this.sessions,
      (selectedDate) => {
        this.renderDaySessions(selectedDate);
      }
    );
  }

  renderDaySessions(date) {
    this.calendarManager.renderDaySessions(date, this.sessions, {
      titleEl: this.selectedDayTitle,
      badgeEl: this.selectedDayBadge,
      minsEl: this.dayTotalMins,
      catsEl: this.dayCategoryCount,
      listEl: this.daySessionsList
    });
  }

  // ==========================================
  // İSTATİSTİKLER, LEVEL & ISI HARİTASI
  // ==========================================
  renderTopStats() {
    const todayStr = this.analyticsManager.formatDateIso(new Date());
    const todaySessions = this.sessions.filter(s => s.dateStr === todayStr);

    const totalMinsToday = todaySessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
    if (this.statTodaySessions) this.statTodaySessions.textContent = todaySessions.length;
    if (this.statTodayMinutes) this.statTodayMinutes.textContent = this.analyticsManager.formatMinutesToHuman(totalMinsToday);

    const streak = this.analyticsManager.calculateStreak(this.sessions);
    if (this.statStreakDays) this.statStreakDays.textContent = streak;

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
    if (this.todayDateText) this.todayDateText.textContent = new Date().toLocaleDateString('tr-TR', options);

    const totalAllMins = this.sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
    const levelInfo = this.analyticsManager.calculateLevelInfo(totalAllMins);
    if (this.headerQuote) {
      this.headerQuote.innerHTML = `🎖️ <strong style="color: #60a5fa; font-weight: 600;">Seviye ${levelInfo.level}:</strong> ${levelInfo.titleName}`;
      this.headerQuote.title = `Genel Seviyen: ${levelInfo.level} - ${levelInfo.titleName} (%${levelInfo.percent}) • Tıkla ve detayları gör`;
      this.headerQuote.onclick = () => this.switchView('stats');
    }
  }

  renderStatsView() {
    const breakdown = this.analyticsManager.getCategoryBreakdown(this.sessions);
    const streak = this.analyticsManager.calculateStreak(this.sessions);
    const levelInfo = this.analyticsManager.calculateLevelInfo(breakdown.totalMins);

    if (this.statTotalFocusedTime) this.statTotalFocusedTime.textContent = this.analyticsManager.formatMinutesToHuman(breakdown.totalMins);
    if (this.statTotalSessionsCount) this.statTotalSessionsCount.textContent = `${breakdown.totalSessions} Seans`;
    if (this.statStreakBig) this.statStreakBig.textContent = `${streak} Gün`;

    if (this.levelTitle) this.levelTitle.textContent = `Seviye ${levelInfo.level}: ${levelInfo.titleName}`;
    if (this.levelPercent) this.levelPercent.textContent = `%${levelInfo.percent}`;
    if (this.levelProgressFill) this.levelProgressFill.style.width = `${levelInfo.percent}%`;

    if (this.levelCurrentProgress) {
      this.levelCurrentProgress.textContent = `${this.analyticsManager.formatMinutesToHuman(levelInfo.minsInCurrent)} / ${this.analyticsManager.formatMinutesToHuman(levelInfo.costForNext)}`;
    }
    if (this.levelNextCost) {
      this.levelNextCost.textContent = levelInfo.isMaxLevel
        ? `🏆 Zirve Seviye Tamamlandı (480 Saat)`
        : `Sonraki seviyeye: ${this.analyticsManager.formatMinutesToHuman(levelInfo.minsLeft)} kaldı`;
    }

    if (this.progSporVal) this.progSporVal.textContent = `${this.analyticsManager.formatMinutesToHuman(breakdown.catMins.spor)} (%${breakdown.percentages.spor})`;
    if (this.progSporBar) this.progSporBar.style.width = `${breakdown.percentages.spor}%`;

    if (this.progDersVal) this.progDersVal.textContent = `${this.analyticsManager.formatMinutesToHuman(breakdown.catMins.ders)} (%${breakdown.percentages.ders})`;
    if (this.progDersBar) this.progDersBar.style.width = `${breakdown.percentages.ders}%`;

    if (this.progYaraticilikVal) this.progYaraticilikVal.textContent = `${this.analyticsManager.formatMinutesToHuman(breakdown.catMins.yaraticilik)} (%${breakdown.percentages.yaraticilik})`;
    if (this.progYaraticilikBar) this.progYaraticilikBar.style.width = `${breakdown.percentages.yaraticilik}%`;

    if (this.sessionRatioPills) {
      this.sessionRatioPills.innerHTML = `
        <span class="ratio-pill spor">🏃 ${breakdown.catCounts.spor}</span>
        <span class="ratio-pill ders">📚 ${breakdown.catCounts.ders}</span>
        <span class="ratio-pill yaraticilik">🎨 ${breakdown.catCounts.yaraticilik}</span>
      `;
    }

    const streakEncouragement = document.getElementById('streak-encouragement');
    if (streakEncouragement) {
      const todayStr = this.analyticsManager.formatDateIso(new Date());
      const isTodayDone = this.analyticsManager.isDateStreakQualified(todayStr, this.sessions);
      const isTodayPerfect = this.analyticsManager.isDatePerfectDay(todayStr, this.sessions);
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

    this.renderSubcategoryLevels();
    this.renderHeatmap();
  }

  renderSubcategoryLevels() {
    if (!this.subcatLevelsGrid) return;
    this.subcatLevelsGrid.innerHTML = '';

    const list = this.analyticsManager.getSubcatItemsWithLevels(this.items, this.sessions, this.subcatLevelFilter);

    if (list.length === 0) {
      this.subcatLevelsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 36px; color: var(--text-dim);">
          <span style="font-size: 2rem; display: block; margin-bottom: 8px;">🌱</span>
          Henüz bu kategoride alt başlık bulunmuyor.
        </div>
      `;
      return;
    }

    const catLabels = { spor: '🏃 Spor', ders: '📚 Ders', yaraticilik: '🎨 Yaratıcılık' };

    list.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'subcat-level-card';
      card.style.setProperty('--card-color', item.color || '#6366f1');

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
              <span class="subcat-ident-title">${this.uiManager.escapeHtml(item.title)}</span>
              <span class="subcat-ident-cat">${catLabels[item.category] || item.category}</span>
            </div>
          </div>
          <div class="subcat-badge-wrap">
            ${rankHtml}
            <span class="subcat-level-number-badge">Seviye ${item.levelInfo.level}</span>
          </div>
        </div>

        <div class="subcat-dynamic-title-banner">
          <span class="subcat-custom-title-text">🎖️ ${this.uiManager.escapeHtml(item.levelInfo.titleName)}</span>
          <span class="subcat-percent-num">%${item.levelInfo.percent}</span>
        </div>

        <div class="subcat-progress-wrap">
          <div class="progress-bar-bg" style="height: 6px;">
            <div class="progress-bar-fill" style="width: ${item.levelInfo.percent}%; background: ${item.color || '#3b82f6'};"></div>
          </div>
          <div class="subcat-progress-meta">
            <span>${this.analyticsManager.formatMinutesToHuman(item.levelInfo.minsInCurrent)} / ${this.analyticsManager.formatMinutesToHuman(item.levelInfo.costForNext)}</span>
            <span>${item.levelInfo.isMaxLevel ? '🏆 Zirve Seviye' : `${this.analyticsManager.formatMinutesToHuman(item.levelInfo.minsLeft)} kaldı`}</span>
          </div>
        </div>

        <div class="subcat-card-bottom">
          <span>Toplam: <strong>${this.analyticsManager.formatMinutesToHuman(item.totalMins)}</strong> (${item.totalCount} seans)</span>
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

  renderHeatmap() {
    if (!this.heatmapGrid) return;
    this.heatmapGrid.innerHTML = '';
    if (this.heatmapMonthsLabels) this.heatmapMonthsLabels.innerHTML = '';

    const data = this.analyticsManager.generateHeatmapData(this.sessions);

    if (this.hmActiveDays) this.hmActiveDays.textContent = data.activeDaysCount;
    if (this.hmMaxDay) this.hmMaxDay.textContent = this.analyticsManager.formatMinutesToHuman(data.maxDayMins);
    if (this.hmTotalSessions) this.hmTotalSessions.textContent = data.totalPeriodSessions;

    if (this.heatmapMonthsLabels) {
      data.monthOffsets.forEach(mo => {
        const span = document.createElement('span');
        span.textContent = mo.name;
        span.style.position = 'absolute';
        span.style.left = `${32 + (mo.weekIdx * 17)}px`;
        this.heatmapMonthsLabels.appendChild(span);
      });
    }

    const monthNamesTr = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    data.days.forEach(item => {
      const cell = document.createElement('div');
      cell.className = 'hm-cell';

      if (item.isFuture) {
        cell.style.opacity = '0.15';
        cell.style.pointerEvents = 'none';
        cell.classList.add('lvl-0');
      } else {
        const mins = item.info.minutes;
        if (mins === 0) cell.classList.add('lvl-0');
        else if (mins < 30) cell.classList.add('lvl-1');
        else if (mins < 60) cell.classList.add('lvl-2');
        else if (mins < 120) cell.classList.add('lvl-3');
        else cell.classList.add('lvl-4');

        if (item.isToday) cell.style.borderColor = 'rgba(255, 255, 255, 0.85)';

        const parts = item.dateStr.split('-');
        const dateFormatted = `${parseInt(parts[2], 10)} ${monthNamesTr[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
        const itemHint = item.info.items.length > 0 ? ` (${item.info.items.slice(0, 3).join(', ')})` : '';
        const descText = mins > 0
          ? `📅 ${dateFormatted}: ${this.analyticsManager.formatMinutesToHuman(mins)} odaklanma (${item.info.count} seans)${itemHint}`
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
  // GÖREVLERİM (TO-DO LİSTESİ)
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

    const counts = this.todoManager.getCounts();

    if (this.todoMetricTotal) this.todoMetricTotal.textContent = counts.total;
    if (this.todoMetricActive) this.todoMetricActive.textContent = counts.active;
    if (this.todoMetricDone) this.todoMetricDone.textContent = counts.completed;
    if (this.todoCntAll) this.todoCntAll.textContent = counts.total;
    if (this.todoCntActive) this.todoCntActive.textContent = counts.active;
    if (this.todoCntCompleted) this.todoCntCompleted.textContent = counts.completed;

    this.updateTodosBadge();

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

      let tagHtml = '';
      if (todo.itemTitle) {
        tagHtml = `
          <span class="todo-tag-pill" style="border-color: ${todo.itemColor || '#7c8cf8'}44; background: ${todo.itemColor || '#7c8cf8'}15; color: ${todo.itemColor || '#7c8cf8'};">
            ${todo.itemEmoji || '⚡'} ${this.uiManager.escapeHtml(todo.itemTitle)}
          </span>
        `;
      } else {
        tagHtml = `<span class="todo-tag-pill">📌 Genel</span>`;
      }

      const d = new Date(todo.createdAt || Date.now());
      const dateText = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

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
            <span class="todo-item-text">${this.uiManager.escapeHtml(todo.text)}</span>
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

      card.querySelector('.todo-checkbox')?.addEventListener('change', () => this.toggleTodo(todo.id));
      card.querySelector('.edit-act')?.addEventListener('click', () => this.editTodo(todo.id));
      card.querySelector('.delete-act')?.addEventListener('click', () => this.deleteTodo(todo.id));

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

    this.audio.playTone(650, 0.25);
    this.uiManager.showToast(this.toastEl, "🎯 Görev başarıyla 'Tamamlandı' olarak işaretlendi!");
  }

  // ==========================================
  // YEDEKLEME & DIŞA AKTARMA
  // ==========================================
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
      this.storage.downloadJsonBackup(backupData);
      this.uiManager.showToast(this.toastEl, "💾 Sistem JSON yedeği başarıyla indirildi!");
    } catch (e) {
      alert("Yedek indirilirken hata oluştu: " + e.message);
    }
  }

  exportSessionsToCsv() {
    const ok = this.storage.exportCsv(this.sessions);
    if (ok) {
      this.uiManager.showToast(this.toastEl, "📊 Excel & CSV seans tablosu başarıyla indirildi!");
    } else {
      alert("Henüz kaydedilmiş bir seans geçmişi bulunmuyor.");
    }
  }

  async handleRestoreFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      const content = await this.storage.parseRestoreFile(file);
      const sessCount = Array.isArray(content.sessions) ? content.sessions.length : 0;
      const todoCount = Array.isArray(content.todos) ? content.todos.length : 0;
      const hasItems = content.items && typeof content.items === 'object';

      if (!sessCount && !todoCount && !hasItems) {
        throw new Error("Bu yedek dosyasında geçerli Momentum verisi bulunamadı.");
      }

      const confirmMsg = `Yedek dosyası başarıyla analiz edildi:\n\n• ${sessCount} adet seans kaydı\n• ${todoCount} adet görev\n• ${hasItems ? 'Özel alt başlıklar' : 'Mevcut alt başlıklar'}\n\nMevcut verilerin üzerine bu yedek yüklenecek. Onaylıyor musun?`;
      if (!confirm(confirmMsg)) {
        event.target.value = '';
        return;
      }

      if (content.items) this.items = content.items;
      if (Array.isArray(content.sessions)) this.sessions = content.sessions;
      if (Array.isArray(content.todos)) {
        this.todos = content.todos;
        this.todoManager.setTodos(this.todos);
      }

      this.saveItems();
      this.saveSessions();
      this.saveTodos();
      await this.pushSyncToServer();

      this.render();
      this.uiManager.showToast(this.toastEl, "✅ Yedek başarıyla geri yüklendi!");
    } catch (err) {
      alert("Yedek geri yüklenirken hata oluştu: " + err.message);
    } finally {
      event.target.value = '';
    }
  }

  updateSyncBadge(online, text) {
    if (!this.syncBadge) return;
    this.syncBadge.classList.toggle('online', online);
    if (this.syncText) this.syncText.textContent = text;
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
