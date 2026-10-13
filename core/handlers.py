import os
import sys
import json
import time
import threading
from urllib.parse import urlparse, parse_qs
from http.server import SimpleHTTPRequestHandler
from .config import BASE_DIR, DEFAULT_PIN, BLOCKED_EXTENSIONS, BLOCKED_FILES
from .storage import DataStore
from .network import NetworkService
from .qr import QRService
from .macos import MacOSService

class MomentumHTTPRequestHandler(SimpleHTTPRequestHandler):
    """HTTP API isteklerini yönlendiren ve statik dosyaları sunan işleyici."""

    # Sunucu genelinde paylaşılan DataStore örneği
    data_store = None

    def __init__(self, *args, **kwargs):
        if MomentumHTTPRequestHandler.data_store is None:
            MomentumHTTPRequestHandler.data_store = DataStore()
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        # Konsolu gereksiz poll istekleriyle boğmamak için sadece API sync ve ana istekleri yaz
        msg = format % args
        if "/api/poll" not in msg:
            sys.stderr.write(f"[{time.strftime('%H:%M:%S')}] {self.client_address[0]} - {msg}\n")

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Auth-PIN")

    def send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(payload, ensure_ascii=False).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def check_pin(self, query_params):
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
        store = MomentumHTTPRequestHandler.data_store

        # 1. API: Sağlık & Momentum Tanıma Kontrolü (PIN gerekmez, port çakışmasını önler)
        if path == "/api/ping":
            self.send_json(200, {
                "app": "momentum",
                "status": "ok",
                "port": self.server.server_address[1]
            })
            return

        # 2. API: QR Kod Sayfası
        if path in ("/qr", "/qr.html"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            port = self.server.server_address[1]
            ip = NetworkService.get_local_ip()
            ip_url = f"http://{ip}:{port}/?pin={DEFAULT_PIN}"
            svg = QRService.generate_svg_qr(ip_url)
            html = QRService.render_qr_html(svg, ip_url)
            self.wfile.write(html.encode('utf-8'))
            return

        # 3. API: Veri Çekme
        if path == "/api/data":
            if not self.check_pin(query):
                self.send_json(401, {"error": "Geçersiz veya eksik PIN"})
                return
            self.send_json(200, store.data)
            return

        # 4. API: Değişiklik Yoklama (Polling)
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

            last_up = store.data.get("lastUpdated", 0)
            if last_up > since:
                resp = {"updated": True, "data": store.data}
            else:
                resp = {"updated": False, "lastUpdated": last_up}
            self.send_json(200, resp)
            return

        # 5. API: Manuel Güvenlik Yedeğini İndir
        if path == "/api/backup/download":
            if not self.check_pin(query):
                self.send_response(401)
                self.send_cors_headers()
                self.end_headers()
                return

            self.send_response(200)
            self.send_cors_headers()
            ts = time.strftime("%Y%m%d_%H%M")
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Disposition", f'attachment; filename="momentum_backup_{ts}.json"')
            self.end_headers()
            self.wfile.write(json.dumps(store.data, ensure_ascii=False, indent=2).encode('utf-8'))
            return

        # 6. API: Seans Bittiğinde Sekmeyi Ön Plana Getir (Focus Tab)
        if path == "/api/focus-tab":
            if not self.check_pin(query):
                self.send_response(401)
                self.send_cors_headers()
                self.end_headers()
                return

            req_port = query.get("port", [str(self.server.server_address[1])])[0]
            req_url = query.get("url", [None])[0]
            req_browser = query.get("browser", [None])[0]

            threading.Thread(
                target=MacOSService.focus_momentum_tab,
                args=(req_port, req_url, req_browser),
                daemon=True
            ).start()
            self.send_json(200, {"ok": True})
            return

        # 7. Güvenlik Filtresi: Hassas dosyalara doğrudan erişimi engelle
        clean_path = path.lstrip('/')
        _, ext = os.path.splitext(clean_path.lower())
        if ext in BLOCKED_EXTENSIONS or clean_path in BLOCKED_FILES or clean_path.startswith("core/"):
            self.send_response(403)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"403 Forbidden: Bu dosyaya ag uzerinden erisilemez.")
            return

        # 8. Statik Dosyaları Sun
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        store = MomentumHTTPRequestHandler.data_store

        # API: Veri Senkronizasyonu (Gelen güncellemeyi kaydet)
        if path == "/api/sync":
            if not self.check_pin(query):
                self.send_json(401, {"error": "Geçersiz PIN"})
                return

            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 5 * 1024 * 1024:  # 5 MB güvenlik limiti
                self.send_response(413)
                self.end_headers()
                return

            body = self.rfile.read(content_length)
            try:
                payload = json.loads(body.decode('utf-8'))
                store.merge_sync_payload(payload)

                self.send_json(200, {
                    "ok": True,
                    "lastUpdated": store.data["lastUpdated"]
                })
            except Exception as e:
                self.send_json(400, {"error": str(e)})
            return

        self.send_response(404)
        self.end_headers()
