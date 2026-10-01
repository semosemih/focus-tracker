#!/usr/bin/env bash
# MOMENTUM - Telefonda (Samsung / Android) Açma Başlatıcısı

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Wi-Fi IP adresini tespit et
IP=$(ipconfig getifaddr en0 2>/dev/null)
if [ -z "$IP" ]; then
  IP=$(ipconfig getifaddr en1 2>/dev/null)
fi
if [ -z "$IP" ]; then
  IP="127.0.0.1"
fi

PIN="2026"
PORT=8080

clear
echo "=========================================================="
echo "    🚀 MOMENTUM - CANLI SENKRONİZASYON & TELEFON MERKEZİ"
echo "=========================================================="
echo ""
echo " Samsung telefonunuzun Chrome veya Samsung Internet"
echo " tarayıcısını açın ve adres çubuğuna şu linki yazın:"
echo ""
echo " 👉  http://${IP}:${PORT}/?pin=${PIN}"
echo ""
echo " 🔒 Güvenlik PIN Kodu: ${PIN} (Otomatik tanımlanacaktır)"
echo "----------------------------------------------------------"
echo " 📱 İPUCU (Tam Ekran Uygulama Yapma):"
echo " Telefonda sayfa açılınca sağ üstteki 3 noktaya (⋮) basın,"
echo " 'Ana Ekrana Ekle' (veya 'Uygulamayı Yükle') seçeneğine dokunun."
echo " Telefonunuzun ana ekranına kendi özel logosuyla eklenecektir!"
echo "----------------------------------------------------------"
echo " ⚡ ÖZELLİK: Mac ve telefonunuz anlık olarak senkronizedir."
echo " Telefonda başlattığınız seans Mac'te, Mac'te bitirdiğiniz"
echo " seans anında telefonunuzda görünür."
echo "----------------------------------------------------------"
echo " Kapatmak için bu terminal penceresini kapatmanız yeterlidir."
echo "=========================================================="
echo ""

python3 "$DIR/server.py" $PORT
