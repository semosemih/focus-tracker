#!/usr/bin/env bash
# MacBook üzerinde uygulamayı doğrudan açan başlatıcı
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

python3 "$DIR/server.py" --launch-browser

