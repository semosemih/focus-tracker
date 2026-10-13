/**
 * MOMENTUM - Geriye Dönük Uyumluluk Yükleyicisi (Backward Compatibility Loader)
 * 
 * Kod tabanı modüler mimariye (Single Responsibility Principle) geçirilmiş ve
 * 'God Class' yapısı ortadan kaldırılarak 'js/' klasörü altına dağıtılmıştır:
 * 
 * - js/constants.js          -> Sabitler, renkler, emojiler, motivasyon sözleri
 * - js/services/storage.js    -> Yerel depolama, CSV/JSON dışa aktarma (StorageService)
 * - js/services/audio.js      -> Web Audio API & Zen ambiyans motoru (AudioService)
 * - js/services/sync.js       -> Canlı sunucu senkronizasyonu & polling (SyncService)
 * - js/services/timer.js      -> Web Worker zamanlayıcı motoru (TimerService)
 * - js/modules/todos.js       -> Görev yönetimi (TodoManager)
 * - js/modules/calendar.js    -> Takvim & gün geçmişi (CalendarManager)
 * - js/modules/analytics.js   -> Isı haritası, seviye & istatistikler (AnalyticsManager)
 * - js/modules/ui.js          -> Arayüz efektleri, konfeti, bildirimler (UIManager)
 * - js/app.js                 -> Temiz orkestratör (MomentumApp)
 * 
 * Eski önbellekler veya doğrudan app.js'i çağıran sayfalar için dinamik yükleyici:
 */

if (!window.MomentumConstants) {
  const scripts = [
    'js/constants.js',
    'js/services/storage.js',
    'js/services/audio.js',
    'js/services/sync.js',
    'js/services/timer.js',
    'js/modules/todos.js',
    'js/modules/calendar.js',
    'js/modules/analytics.js',
    'js/modules/ui.js',
    'js/app.js'
  ];

  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = `${src}?v=2.2`;
    s.async = false;
    document.head.appendChild(s);
  });
}
