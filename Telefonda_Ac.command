#!/usr/bin/env bash
# MOMENTUM - Telefonda Açma Başlatıcısı (Akıllı Port & QR Kod)

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

python3 "$DIR/server.py" --phone
