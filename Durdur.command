#!/usr/bin/env bash
# MOMENTUM - Sunucuyu Güvenli Şekilde Tamamen Kapatma
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

python3 "$DIR/server.py" --stop
