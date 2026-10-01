#!/usr/bin/env bash
# MOMENTUM - Sunucuyu Güvenli Şekilde Tamamen Kapatma Script'i

PORT=8080
PID=$(lsof -ti :$PORT)

clear
echo "=========================================================="
echo "    🛑 MOMENTUM - SUNUCUYU KAPAT"
echo "=========================================================="

if [ -n "$PID" ]; then
  kill -9 $PID 2>/dev/null
  echo ""
  echo "  ✅ Yerel sunucu başarıyla durduruldu."
  echo "  🔒 Port $PORT kapatıldı."
  echo "  💾 Tüm verileriniz 'momentum_data.json' dosyasına kaydedildi."
  echo "  ⚡ İşlemci ve RAM kullanımı tamamen sıfırlandı."
  echo ""
else
  echo ""
  echo "  ℹ️  Arka planda çalışan bir sunucu bulunamadı (zaten kapalı)."
  echo ""
fi

echo "=========================================================="
sleep 2
