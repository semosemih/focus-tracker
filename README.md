# ⚡ MOMENTUM — Kişisel Odak & Gelişim Takip Sistemi

> **MacBook & Telefon için tasarlanmış; sıfır bağımlılıklı, minimalist, derin odaklanma ve alışkanlık takip sistemi.

---

## 🌟 Öne Çıkan Özellikler

* **3 Temel Yaşam Alanı:**
  * 🏃‍♂️ **Spor** (Kardiyo, Ağırlık, Esneme, Koşu...)
  * 📚 **Ders** (Matematik, Kodlama, Yabancı Dil, Kitap...)
  * 🎨 **Yaratıcılık** (Çizim, Tasarım, Müzik, Yazarlık...)
* **Akıllı Süre Formatlama:** 60 dakika ve üzeri süreler motivasyonu artıracak şekilde otomatik olarak `saat ve dakika` formatında hesaplanır (örneğin: `105 dk` ➡️ `1 saat 45 dk`).
* **Çift Cihaz Canlı Senkronizasyon (Mac & Samsung):**
  * Yerel Wi-Fi ağı üzerinden WebSocket/HTTP API ile anlık çift yönlü haberleşme.
  * Telefonda başlatılan seans Mac ekranında canlı akar, telefonda bitince Mac'teki takvime ve istatistiklere anında yansır.
* **4 Haneli PIN Güvenliği:** Yerel ağdaki diğer cihazların verilere izinsiz erişimini engelleyen PIN koruması (`2026`).
* **Minimalist Zen Odak Modu:** Ekran karartma, dairesel SVG geri sayım sayacı, çevrimdışı Web Audio zilleri ve isteğe bağlı yerel "Zen Akışı" ambiyans sesi.
* **Kutlama & Başarı Sistemi:** Çok renkli konfeti motoru, Türkçe motivasyon sözleri ve seviye/rozet ilerlemesi.
* **3 Kategori Zinciri Kırma (Streak 🔥):** Günlük serinin devam etmesi için her 3 kategoriden de en az 1 seans tamamlanması gerekir.
* **Sıfır Harici Bağımlılık (Zero-Dependency):** Node.js, npm, harici kütüphane veya paket yükleme gerektirmez; saf HTML5, CSS3, modern Vanilla JavaScript ve yerel Python 3 ile çalışır.

---

## 🚀 Hızlı Başlangıç

### 💻 MacBook'ta Çalıştırma:
Klasördeki **`Baslat.command`** dosyasına (veya doğrudan `index.html`'e) çift tıklayın.

### 📱 Telefonunuzda Açma & Senkronizasyon:
1. Klasördeki **`Telefonda_Ac.command`** dosyasına çift tıklayın.
2. Açılan terminal penceresinde belirtilen bağlantıyı (örneğin: `http://192.168.1.11:8080/?pin=2026`) telefonunuzun Chrome tarayıcısına yazın.
3. Telefonda sağ üstteki menüden **"Ana Ekrana Ekle"** seçeneğini seçerek tam ekran bağımsız bir mobil uygulama olarak kullanın.

### 🛑 Sistemi Tamamen Kapatma:
Klasördeki **`Durdur.command`** dosyasına çift tıklayın. Port 8080 anında kapatılır ve RAM/CPU kullanımı tamamen sıfırlanır.

---

## 📁 Proje Mimarisi

├── index.html             # Semantik HTML5 arayüzü & PWA etiketleri
├── style.css              # İskandinav/Titanyum mat renk paleti & duyarlı tasarım
├── server.py              # Yerel API sunucusu giriş noktası (Entry point)
├── core/                  # Modüler Sunucu Mimarisi (Python)
│   ├── config.py          # Sistem sabitleri ve güvenlik listeleri
│   ├── storage.py         # Thread-safe veritabanı & akıllı çakışma çözümleme
│   ├── backup.py          # 3 katmanlı yedekleme (Yerel, Belgeler, Google Drive)
│   ├── network.py         # Yerel IP, port yönetimi & süreç denetimi
│   ├── macos.py           # AppleScript & macOS sistem otomasyonları
│   ├── qr.py              # Saf SVG QR kod & mobil arayüz üretici
│   ├── handlers.py        # HTTP API & statik dosya işleyici
│   └── runner.py          # Sunucu yaşam döngüsü & CLI yönlendirici
├── js/                    # Modüler İstemci Mimarisi (JavaScript - God Class'sız)
│   ├── constants.js       # Renk paletleri, emojiler, varsayılan şablonlar
│   ├── services/          # Temel Bağımsız Servisler
│   │   ├── storage.js     # Yerel depolama & CSV/JSON dışa aktarma (StorageService)
│   │   ├── audio.js       # Web Audio API & Zen ambiyans motoru (AudioService)
│   │   ├── sync.js        # Canlı sunucu senkronizasyonu (SyncService)
│   │   └── timer.js       # Web Worker hassas zamanlayıcı (TimerService)
│   ├── modules/           # İş Mantığı Modülleri
│   │   ├── todos.js       # Görev yönetimi (TodoManager)
│   │   ├── calendar.js    # Takvim & gün geçmişi (CalendarManager)
│   │   ├── analytics.js   # Isı haritası, seviye & istatistikler (AnalyticsManager)
│   │   └── ui.js          # Arayüz efektleri, konfeti & bildirimler (UIManager)
│   └── app.js             # Orkestratör / Koordinatör (MomentumApp)
├── Baslat.command         # Mac için tek tıkla başlatıcı
├── Telefonda_Ac.command   # Wi-Fi mobil paylaşım başlatıcısı
├── Durdur.command         # Güvenli tek tıkla durdurucu
├── manifest.json          # Android PWA mobil yükleme yapılandırması
├── icon.svg               # Özel geometrik minimalist logo
└── momentum_data.json     # Yerel veritabanı dosyası
```

---

## 🔒 Güvenlik & Gizlilik
* Tüm veriler kullanıcının kendi yerel cihazında saklanır.
* İnternet üzerinden hiçbir üçüncü taraf sunucuya veri gönderilmez.
* Yerel sunucu `.command`, `.py`, `.sh` gibi hassas dosyaların ağ üzerinden indirilmesini engeller.

---

## 📄 Lisans
MIT License © 2026 Semih Şengül
