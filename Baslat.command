#!/usr/bin/env bash
# MacBook üzerinde uygulamayı doğrudan açan başlatıcı
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Eğer yerel senkronizasyon sunucusu çalışmıyorsa arka planda başlat
if ! lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
  python3 "$DIR/server.py" 8080 >/dev/null 2>&1 &
  sleep 0.8
fi

open "http://localhost:8080/?pin=2026"

