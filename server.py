#!/usr/bin/env python3
"""
MOMENTUM - Yerel Canlı Senkronizasyon & Güvenlik Sunucusu
Mac ile Samsung (veya diğer cihazlar) arasında gerçek zamanlı iki yönlü senkronizasyon sağlar.
Standart Python 3 kütüphaneleri kullanır, harici kurulum gerektirmez.
"""

import os
import sys
import json
import time
from urllib.parse import urlparse, parse_qs
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "momentum_data.json")
DEFAULT_PIN = "2026"

import threading

# Dosya koruma listesi (Ağdaki cihazların indirmesi engellenen dosyalar)
BLOCKED_EXTENSIONS = {'.command', '.sh', '.py', '.git', '.log'}
BLOCKED_FILES = {'momentum_data.json', 'server.py', 'Baslat.command', 'Telefonda_Ac.command', 'Durdur.command', 'backups'}

class MomentumSyncServer:
    def __init__(self, db_path):
        self.db_path = db_path
        self.lock = threading.Lock()
        self.data = self.load()
        # Sunucu başlangıcında hemen bir güvenlik yedeği al
        self.create_backup()

    def create_backup(self):
        try:
            backup_dir = os.path.join(BASE_DIR, "backups")
            os.makedirs(backup_dir, exist_ok=True)
            ts = time.strftime("%Y%m%d_%H%M%S")
            backup_path = os.path.join(backup_dir, f"momentum_data_{ts}.json")
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
            # En fazla 30 dosya tut, eskileri sil
            all_backups = sorted([f for f in os.listdir(backup_dir) if f.startswith("momentum_data_") and f.endswith(".json")])
            if len(all_backups) > 30:
                for old_f in all_backups[:-30]:
                    try:
                        os.remove(os.path.join(backup_dir, old_f))
                    except:
                        pass
        except Exception as e:
            print(f"[!] Yedekleme uyarısı: {e}")

    def load(self):
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                    if isinstance(content, dict) and 'items' in content:
                        return content
            except Exception as e:
                print(f"[!] Veritabanı okuma uyarısı: {e}")
        return {
            "items": [],
            "sessions": [],
            "todos": [],
            "timer": {
                "active": False,
                "item": None,
                "durationMinutes": 0,
                "targetEndTime": 0,
                "remainingSeconds": 0,
                "totalSeconds": 0
            },
            "lastUpdated": int(time.time() * 1000)
        }

    def save(self):
        with self.lock:
            try:
                self.data["lastUpdated"] = int(time.time() * 1000)
                tmp_path = f"{self.db_path}.{os.getpid()}.{threading.get_ident()}.tmp"
                with open(tmp_path, 'w', encoding='utf-8') as f:
                    json.dump(self.data, f, ensure_ascii=False, indent=2)
                os.replace(tmp_path, self.db_path)
                self.create_backup()
                return True
            except Exception as e:
                print(f"[!] Veritabanı kayıt hatası: {e}")
                return False

sync_service = MomentumSyncServer(DB_FILE)

class MomentumHTTPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        # Konsolu gereksiz poll istekleriyle boğmamak için sadece API sync ve ana istekleri yaz
        msg = format % args
        if "/api/poll" not in msg:
            sys.stderr.write(f"[{time.strftime('%H:%M:%S')}] {self.client_address[0]} - {msg}\n")

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Auth-PIN")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def check_pin(self, query_params):
        # PIN kontrolü: Header veya query param veya localhost
        client_ip = self.client_address[0]
        if client_ip in ("127.0.0.1", "::1", "localhost"):
            return True
        pin = self.headers.get("X-Auth-PIN")
        if not pin and "pin" in query_params:
            pin = query_params["pin"][0]
        return pin == DEFAULT_PIN

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # 1. API: Veri Çekme
        if path == "/api/data":
            if not self.check_pin(query):
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Geçersiz veya eksik PIN"}).encode('utf-8'))
                return

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(sync_service.data, ensure_ascii=False).encode('utf-8'))
            return

        # 2. API: Değişiklik Yoklama (Polling)
        if path == "/api/poll":
            if not self.check_pin(query):
                self.send_response(401)
                self.send_cors_headers()
                self.end_headers()
                return

            since = 0
            try:
                since = int(query.get("since", [0])[0])
            except ValueError:
                since = 0

            last_up = sync_service.data.get("lastUpdated", 0)
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()

            if last_up > since:
                resp = {"updated": True, "data": sync_service.data}
            else:
                resp = {"updated": False, "lastUpdated": last_up}
            self.wfile.write(json.dumps(resp, ensure_ascii=False).encode('utf-8'))
            return

        # 3. Güvenlik Filtresi: Hassas dosyalara doğrudan erişimi engelle
        clean_path = path.lstrip('/')
        _, ext = os.path.splitext(clean_path.lower())
        if ext in BLOCKED_EXTENSIONS or clean_path in BLOCKED_FILES:
            self.send_response(403)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"403 Forbidden: Bu dosyaya ag uzerinden erisilemez.")
            return

        # 4. Statik Dosyaları Sun
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # API: Veri Senkronizasyonu (Gelen güncellemeyi kaydet)
        if path == "/api/sync":
            if not self.check_pin(query):
                self.send_response(401)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Geçersiz PIN"}).encode('utf-8'))
                return

            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 5 * 1024 * 1024:  # 5 MB güvenlik limiti
                self.send_response(413)
                self.end_headers()
                return

            body = self.rfile.read(content_length)
            try:
                payload = json.loads(body.decode('utf-8'))
                
                # Payload kontrolü ve veri güncellemesi
                if "items" in payload:
                    sync_service.data["items"] = payload["items"]
                if "sessions" in payload:
                    sync_service.data["sessions"] = payload["sessions"]
                if "todos" in payload:
                    sync_service.data["todos"] = payload["todos"]
                if "timer" in payload:
                    sync_service.data["timer"] = payload["timer"]

                sync_service.save()

                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "ok": True, 
                    "lastUpdated": sync_service.data["lastUpdated"]
                }).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

def run_server(port=PORT):
    server_address = ('0.0.0.0', port)
    httpd = ThreadingHTTPServer(server_address, MomentumHTTPRequestHandler)
    print(f"[*] Momentum Eşitleme Sunucusu Port {port} üzerinde hazır.")
    httpd.serve_forever()

if __name__ == "__main__":
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
