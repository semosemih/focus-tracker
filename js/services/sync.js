/**
 * MOMENTUM - Canlı Senkronizasyon Servisi (SyncService)
 * HTTP Polling, çift yönlü veri birleştirme (smart merge) ve odak sekmesi otomasyonu.
 */

class SyncService {
  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    let pin = urlParams.get('pin');
    if (pin) {
      localStorage.setItem('momentum_pin', pin);
    } else {
      pin = localStorage.getItem('momentum_pin') || '2026';
    }

    const baseUrl = window.location.protocol.startsWith('http')
      ? window.location.origin
      : 'http://127.0.0.1:8765';

    this.state = {
      connected: false,
      baseUrl: baseUrl,
      pin: pin,
      lastSync: 0,
      pollIntervalId: null,
      isPolling: false
    };

    this.callbacks = {
      onDataUpdated: null,
      onTimerSync: null,
      onTimerClose: null,
      onBadgeUpdate: null,
      getAppPayload: null
    };
  }

  init(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };

    // İlk senkronizasyon
    this.fetchInitialSync();

    // 1.5 saniyede bir yokla
    if (this.state.pollIntervalId) clearInterval(this.state.pollIntervalId);
    this.state.pollIntervalId = setInterval(() => {
      this.pollSync();
    }, 1500);
  }

  updateBadge(online, text) {
    if (this.callbacks.onBadgeUpdate) {
      this.callbacks.onBadgeUpdate(online, text);
    }
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
    const DEFAULT_ITEMS = window.MomentumConstants.DEFAULT_ITEMS;

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

      // 1. Önce sunucudaki güncel veriler
      rList.forEach(it => {
        if (it && it.id) itemMap.set(it.id, { ...it });
      });

      // 2. Yereldeki öğeler
      lList.forEach(it => {
        if (it && it.id) {
          if (!itemMap.has(it.id)) {
            const isDefaultId = (DEFAULT_ITEMS[cat] || []).some(d => d.id === it.id);
            if (!isDefaultId || it.updatedAt) {
              itemMap.set(it.id, { ...it });
            }
          } else {
            const existing = itemMap.get(it.id);
            const localTime = it.updatedAt || 0;
            const remoteTime = existing.updatedAt || 0;
            if (localTime > remoteTime) {
              itemMap.set(it.id, { ...existing, ...it });
            } else {
              itemMap.set(it.id, { ...it, ...existing });
            }
          }
        }
      });
      result[cat] = Array.from(itemMap.values());
    });
    return result;
  }

  async fetchInitialSync() {
    try {
      const url = `${this.state.baseUrl}/api/data?pin=${encodeURIComponent(this.state.pin)}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        this.state.connected = true;
        this.state.lastSync = data.lastUpdated || Date.now();
        this.updateBadge(true, 'Canlı Eşit');

        if (this.callbacks.onDataUpdated) {
          await this.callbacks.onDataUpdated(data, true);
        }

        if (data.timer && data.timer.active && this.callbacks.onTimerSync) {
          this.callbacks.onTimerSync(data.timer);
        }
      } else if (res.status === 401) {
        this.updateBadge(false, 'PIN Gerekli');
      }
    } catch (e) {
      this.updateBadge(false, 'Yerel');
    }
  }

  async pollSync() {
    if (this.state.isPolling) return;
    this.state.isPolling = true;

    try {
      const url = `${this.state.baseUrl}/api/poll?since=${this.state.lastSync}&pin=${encodeURIComponent(this.state.pin)}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        this.updateBadge(true, 'Canlı Eşit');

        if (json.updated && json.data) {
          this.state.lastSync = json.data.lastUpdated || Date.now();
          if (this.callbacks.onDataUpdated) {
            await this.callbacks.onDataUpdated(json.data, false);
          }
          if (json.data.timer) {
            if (json.data.timer.active && this.callbacks.onTimerSync) {
              this.callbacks.onTimerSync(json.data.timer);
            } else if (!json.data.timer.active && this.callbacks.onTimerClose) {
              this.callbacks.onTimerClose();
            }
          }
        }
      } else if (res.status === 401) {
        this.updateBadge(false, 'PIN Gerekli');
      } else {
        this.updateBadge(false, 'Bağlantı Yok');
      }
    } catch (e) {
      this.updateBadge(false, 'Yerel');
    } finally {
      this.state.isPolling = false;
    }
  }

  async pushSync(payload) {
    if (!this.state.baseUrl) return;
    try {
      const url = `${this.state.baseUrl}/api/sync?pin=${encodeURIComponent(this.state.pin)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.lastUpdated) this.state.lastSync = json.lastUpdated;
        this.updateBadge(true, 'Canlı Eşit');
      }
    } catch (e) {
      console.warn('[Sync] pushSync başarısız:', e);
    }
  }

  async pushTimerState(timerState) {
    if (!this.state.baseUrl) return;
    try {
      const payload = { timer: timerState };
      const url = `${this.state.baseUrl}/api/sync?pin=${encodeURIComponent(this.state.pin)}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('[Sync] pushTimerState başarısız:', e);
    }
  }

  requestTabFocus() {
    try {
      let browser = '';
      const ua = navigator.userAgent;
      if (ua.includes('Brave') || navigator.brave) {
        browser = 'Brave Browser';
      } else if (ua.includes('Edg/')) {
        browser = 'Microsoft Edge';
      } else if (ua.includes('Chrome/')) {
        browser = 'Google Chrome';
      } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
        browser = 'Safari';
      }

      const port = window.location.port || '8765';
      const currentUrl = encodeURIComponent(window.location.href);
      const url = `${this.state.baseUrl}/api/focus-tab?pin=${encodeURIComponent(this.state.pin)}&port=${encodeURIComponent(port)}&browser=${encodeURIComponent(browser)}&url=${currentUrl}`;
      fetch(url, { method: 'GET', cache: 'no-store' }).catch(() => {});
    } catch (e) {
      // sessizce geç
    }
  }
}

window.SyncService = SyncService;
