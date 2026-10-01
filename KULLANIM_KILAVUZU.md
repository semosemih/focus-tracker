# 🎯 Momentum - Kişisel Odak & Gelişim Sistemi

MacBook'unuzda yerel (offline) olarak çalışan, hiçbir internet bağlantısı veya sunucu kurulumu gerektirmeyen şık ve sade odak takip programı.

---

## 🚀 Nasıl Çalıştırılır?

### 💻 MacBook'ta Açmak İçin:
1. Klasörün içindeki **`Baslat.command`** dosyasına (veya `index.html`'e) çift tıklayın.

### 📱 Samsung (Android) Telefonunuzda Açmak & Eşitlemek İçin:
1. Klasörün içindeki **`Telefonda_Ac.command`** dosyasına çift tıklayın.
2. Açılan pencerede gösterilen linki telefonunuzun Chrome tarayıcısına yazın:
   `http://192.168.1.11:8080/?pin=2026`
3. **Canlı Senkronizasyon:** Mac ve telefonunuz anında birbirine bağlanır. Sol üstteki logoda yeşil **"Canlı Eşit"** rozeti belirir.
   - Telefonda veya Mac'te tamamlanan seanslar anında diğer cihaza yansır.
   - Sayaç başladığında her iki ekranda da aynı anda akar.
4. **Ana Ekrana Ekleme:** Telefonda sağ üstteki 3 noktadan (⋮) **"Ana Ekrana Ekle"** derseniz, tam ekran bağımsız bir mobil uygulama haline gelir.

---

## 🛑 Nasıl Güvenle Kapatılır?

### 💻 MacBook'ta:
1. **Tarayıcı Sekmesini Kapatın:** `⌘ + W` ile sekmeyi kapatın.
2. **Sunucuyu Durdurun:** Klasördeki **`Durdur.command`** dosyasına çift tıklayın (veya açık olan siyah Terminal penceresini kapatın).
   - Bu işlem 8080 portunu anında kapatır ve kullanılan RAM/CPU'yu tamamen sıfırlar.

### 📱 Samsung Telefonunuzda:
1. Telefonunuzun **Son Uygulamalar** ekranını açın (alttan yukarı kaydırarak veya 3 çizgi tuşuyla).
2. Momentum uygulamasını **yukarı kaydırıp kapatın**.
   - Android sistemi arka plan işlemlerini anında dondurur; pil veya veri tüketimi tamamen durur.

*Not: Kapatmadan önce tamamladığınız tüm seanslar `momentum_data.json` dosyasında kalıcı olarak saklanır, hiçbir veriniz kaybolmaz.*

---

## ✨ Özellikler

1. **3 Ana Kategori**:
   - 🏃‍♂️ **Spor** (Kardiyo, Ağırlık, Esneme, Koşu vb.)
   - 📚 **Ders** (Matematik, Kodlama, Yabancı Dil, Kitap Okuma vb.)
   - 🎨 **Yaratıcılık** (Çizim, Tasarım, Müzik, Yazarlık vb.)
   - İstediğiniz zaman **"Yeni Alt Başlık Ekle"** butonuyla yeni kareler oluşturabilir, düzenleyebilir veya silebilirsiniz.

2. **Göz Yormayan Pastel & Modern Renk Paleti**:
   - Yeni alt başlık eklerken zevkinize uygun sakin, göz yormayan modern renk tonları ve emojiler seçebilirsiniz.

3. **Sade Kare Kartlar & Hızlı Süre Seçimi**:
   - Herhangi bir karenin üzerine tıkladığınızda sade bir pencere açılır:
     - ⚡ **Kısa (15 Dakika)**
     - 🎯 **Orta (30 Dakika)** *(Önerilen)*
     - 🚀 **Uzun (45 Dakika)**
   - Tek tıkla seans başlar.

4. **Tam Ekran & Havalı Minimalist Focus Modu**:
   - Seans başladığında ekran karartılarak yalnızca minimalist dairesel sayaç ve odaklanma alanı kalır.
   - Sağ üstteki tam ekran ikonuna basarak veya `F` / tarayıcı tam ekranına alarak MacBook'unuzda muazzam bir zen atmosferi yaratabilirsiniz.
   - İsteğe bağlı olarak **"Zen Akışı"** butonuna basarak seans boyunca rahatlatıcı pembe gürültü / ortam sesi açabilirsiniz (tamamen yerel üretilir).

5. **Kutlama, Konfeti & Motivasyon Sistemi**:
   - Seans bittiğinde ekranı renkli konfetiler ve hafif bir melodi sarar.
   - Seans tamamlandığında size özel motive edici Türkçe alıntılar gösterilir.
   - İlgili alt başlığın sayacı ve toplam dakikası anında güncellenir.

6. **Takvim & Günlük Geçmiş**:
   - Takvim görünümüne geçerek ay boyunca hangi gün hangi kategoride ne kadar çalıştığınızı renkli göstergelerle görebilirsiniz.
   - Herhangi bir güne tıkladığınızda o gün yapılan tüm seanslar detaylarıyla listelenir.

7. **İlerleme & Seviye**:
   - Toplam odaklanma saatiniz, kesintisiz devam seriniz (Streak 🔥) ve kategori dağılım yüzdeleriniz hesaplanır.
   - Ne kadar çok seans tamamlarsanız seviyeniz ve rozetleriniz o kadar yükselir!

---
*Tüm veriler MacBook'unuzun yerel hafızasında (`localStorage`) saklanır, hiçbir yere gönderilmez ve silinmez.*
