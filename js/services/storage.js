/**
 * MOMENTUM - Depolama & Yedekleme Servisi (StorageService)
 * LocalStorage yönetimi, CSV dışa aktarma ve JSON yedekleme/yükleme işlemlerini yönetir.
 */

class StorageService {
  constructor() {
    this.DEFAULT_ITEMS = window.MomentumConstants.DEFAULT_ITEMS;
  }

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
      } catch (e) {
        console.error('[Storage] Items parse hatası:', e);
      }
    }
    return JSON.parse(JSON.stringify(this.DEFAULT_ITEMS));
  }

  saveItems(items) {
    localStorage.setItem('momentum_items', JSON.stringify(items));
  }

  loadSessions() {
    const saved = localStorage.getItem('momentum_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('[Storage] Sessions parse hatası:', e);
      }
    }
    return [];
  }

  saveSessions(sessions) {
    localStorage.setItem('momentum_sessions', JSON.stringify(sessions));
  }

  loadTodos() {
    const saved = localStorage.getItem('momentum_todos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('[Storage] Todos parse hatası:', e);
      }
    }
    return [];
  }

  saveTodos(todos) {
    localStorage.setItem('momentum_todos', JSON.stringify(todos));
  }

  getPin() {
    const urlParams = new URLSearchParams(window.location.search);
    let pin = urlParams.get('pin');
    if (pin) {
      localStorage.setItem('momentum_pin', pin);
      return pin;
    }
    return localStorage.getItem('momentum_pin') || '2026';
  }

  savePin(pin) {
    localStorage.setItem('momentum_pin', pin);
  }

  downloadJsonBackup(data) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const ts = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `momentum_yedek_${ts}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  parseRestoreFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (!imported || typeof imported !== 'object') {
            throw new Error('Geçersiz dosya yapısı');
          }
          resolve(imported);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsText(file);
    });
  }

  exportCsv(sessions) {
    if (!sessions || sessions.length === 0) {
      return false;
    }

    const headers = ['Tarih', 'Saat', 'Kategori', 'Alt Başlık', 'Süre (Dk)', 'İlişkili Görev', 'Oturum ID'];
    const catLabels = { spor: 'Spor', ders: 'Ders', yaraticilik: 'Yaratıcılık' };

    const rows = sessions.map(s => {
      const d = new Date(s.timestamp || Date.now());
      const dateStr = d.toLocaleDateString('tr-TR');
      const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const cat = catLabels[s.category] || s.category;
      const title = (s.itemTitle || '').replace(/"/g, '""');
      const todo = (s.todoText || '').replace(/"/g, '""');
      return [
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${cat}"`,
        `"${title}"`,
        s.minutes || 0,
        `"${todo}"`,
        `"${s.id || ''}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const ts = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `momentum_seanslar_${ts}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
}

window.StorageService = StorageService;
