#!/usr/bin/env bash
# MacBook üzerinde uygulamayı doğrudan açan başlatıcı
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Eğer yerel senkronizasyon sunucusu çalışıyorsa web üzerinden bağlan, değilse yerel dosyayı aç
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
  open "http://localhost:8080/?pin=2026"
else
  open "$DIR/index.html"
fi
