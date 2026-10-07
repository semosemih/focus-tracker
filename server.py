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

PORT = 8765
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "momentum_data.json")
DEFAULT_PIN = "2026"
PORT_FILE = os.path.join(BASE_DIR, ".momentum_port")
PID_FILE = os.path.join(BASE_DIR, ".momentum_pid")

import threading
import subprocess

def focus_momentum_tab():
    """Seans bittiğinde kullanıcının açık olan Momentum sekmesini ve tarayıcısını tüm uygulamaların önüne getirir.
    System Events gerektirmez; macOS güvenlik/otomasyon onay uyarısı üretmez."""
    script = '''
    set found to false

    -- 1. BRAVE BROWSER (Öncelikli)
    if application "Brave Browser" is running then
        try
            tell application "Brave Browser"
                repeat with w in windows
                    set tabIdx to 0
                    repeat with t in tabs of w
                        set tabIdx to tabIdx + 1
                        set u to URL of t
                        set ttl to title of t
                        if u contains "8765" or u contains "8080" or u contains "my%20system" or u contains "index.html" or ttl contains "MOMENTUM" then
                            set active tab index of w to tabIdx
                            set index of w to 1
                            activate
                            set found to true
                            exit repeat
                        end if
                    end repeat
                    if found then exit repeat
                end repeat
            end tell
            if found then
                return "Brave Browser"
            end if
        end try
    end if

    -- 2. GOOGLE CHROME
    if application "Google Chrome" is running then
        try
            tell application "Google Chrome"
                repeat with w in windows
                    set tabIdx to 0
                    repeat with t in tabs of w
                        set tabIdx to tabIdx + 1
                        set u to URL of t
                        set ttl to title of t
                        if u contains "8765" or u contains "8080" or u contains "my%20system" or u contains "index.html" or ttl contains "MOMENTUM" then
                            set active tab index of w to tabIdx
                            set index of w to 1
                            activate
                            set found to true
                            exit repeat
                        end if
                    end repeat
                    if found then exit repeat
                end repeat
            end tell
            if found then
                return "Google Chrome"
            end if
        end try
    end if

    -- 3. SAFARI
    if application "Safari" is running then
        try
            tell application "Safari"
                repeat with w in windows
                    repeat with t in tabs of w
                        set u to URL of t
                        set ttl to name of t
                        if u contains "8080" or u contains "my%20system" or u contains "index.html" or ttl contains "MOMENTUM" then
                            set current tab of w to t
                            set index of w to 1
                            activate
                            set found to true
                            exit repeat
                        end if
                    end repeat
                    if found then exit repeat
                end repeat
            end tell
            if found then
                return "Safari"
            end if
        end try
    end if

    return "NOT_FOUND"
    '''
    try:
        res = subprocess.run(["osascript", "-e", script], capture_output=True, text=True, timeout=5)
        out = (res.stdout or "").strip()
        if res.returncode == 0 and out != "NOT_FOUND":
            print(f"[✓] focus_momentum_tab: Açık Momentum sekmesi ({out}) öne getirildi.")
        else:
            err = res.stderr.strip() if res.stderr else ""
            print(f"[-] focus_momentum_tab: Açık sekme arandı ({out}{f', hata: {err}' if err else ''}). Asla yeni sekme açılmıyor.")
    except Exception as e:
        print(f"[!] focus_momentum_tab hatası: {e}")

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

    @staticmethod
    def get_google_drive_backup_dir():
        """Kullanıcının belirlediği Google Drive / My System yedek klasörünü döner."""
        primary_path = "/Users/semihsengul/Library/CloudStorage/GoogleDrive-semihyahama@gmail.com/My Drive/My System"
        if os.path.exists(os.path.dirname(primary_path)):
            return primary_path

        cloud_storage = os.path.expanduser("~/Library/CloudStorage")
        if os.path.exists(cloud_storage):
            try:
                for entry in os.listdir(cloud_storage):
                    if "googledrive" in entry.lower():
                        my_drive = os.path.join(cloud_storage, entry, "My Drive")
                        if os.path.exists(my_drive):
                            return os.path.join(my_drive, "My System")
            except Exception:
                pass
        return None

    def create_backup(self):
        try:
            ts = time.strftime("%Y%m%d_%H%M%S")

            # 1. Proje içindeki yerel backups klasörü (son 10 kopya)
            backup_dir = os.path.join(BASE_DIR, "backups")
            os.makedirs(backup_dir, exist_ok=True)
            backup_path = os.path.join(backup_dir, f"momentum_data_{ts}.json")
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)

            all_backups = sorted([f for f in os.listdir(backup_dir) if f.startswith("momentum_data_") and f.endswith(".json")])
            if len(all_backups) > 10:
                for old_f in all_backups[:-10]:
                    try:
                        os.remove(os.path.join(backup_dir, old_f))
                    except:
                        pass

            # 2. Kullanıcının ~/Documents/Momentum_Yedekleri klasörü (Harici yerel güvenlik)
            docs_backup_dir = os.path.expanduser("~/Documents/Momentum_Yedekleri")
            os.makedirs(docs_backup_dir, exist_ok=True)
            docs_latest = os.path.join(docs_backup_dir, "momentum_data_latest.json")
            with open(docs_latest, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)

            # 3. Google One / Google Drive Bulut Yedeklemesi (Son 30 kopya + latest)
            gdrive_dir = self.get_google_drive_backup_dir()
            if gdrive_dir:
                try:
                    os.makedirs(gdrive_dir, exist_ok=True)

                    # Her zaman en güncel dosya (hızlı erişim için)
                    gdrive_latest = os.path.join(gdrive_dir, "momentum_data_latest.json")
                    with open(gdrive_latest, 'w', encoding='utf-8') as f:
                        json.dump(self.data, f, ensure_ascii=False, indent=2)

                    # Zaman damgalı yedek
                    gdrive_ts_path = os.path.join(gdrive_dir, f"momentum_data_{ts}.json")
                    with open(gdrive_ts_path, 'w', encoding='utf-8') as f:
                        json.dump(self.data, f, ensure_ascii=False, indent=2)

                    # Google One üzerinde son 30 kopyayı sakla
                    all_gdrive_backups = sorted([f for f in os.listdir(gdrive_dir) if f.startswith("momentum_data_") and f.endswith(".json") and f != "momentum_data_latest.json"])
                    if len(all_gdrive_backups) > 30:
                        for old_f in all_gdrive_backups[:-30]:
                            try:
                                os.remove(os.path.join(gdrive_dir, old_f))
                            except:
                                pass
                except Exception as ge:
                    print(f"[!] Google Drive yedekleme uyarısı: {ge}")
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

        # 0. API: Sağlık & Momentum Tanıma Kontrolü (PIN gerekmez, port çakışmasını önler)
        if path == "/api/ping":
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({
                "app": "momentum",
                "status": "ok",
                "port": self.server.server_address[1]
            }).encode('utf-8'))
            return

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

        # 3. API: Manuel Güvenlik Yedeğini İndir
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
            self.wfile.write(json.dumps(sync_service.data, ensure_ascii=False, indent=2).encode('utf-8'))
            return

        # 4. API: Seans Bittiğinde Sekmeyi Ön Plana Getir (Focus Tab)
        if path == "/api/focus-tab":
            if not self.check_pin(query):
                self.send_response(401)
                self.send_cors_headers()
                self.end_headers()
                return

            threading.Thread(target=focus_momentum_tab, daemon=True).start()

            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode('utf-8'))
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

def get_local_ip():
    """Bağlı olunan aktif ağın IP adresini dinamik ve güvenilir şekilde tespit eder."""
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
        for iface in ["en0", "en1"]:
            try:
                out = subprocess.check_output(["ipconfig", "getifaddr", iface], stderr=subprocess.DEVNULL)
                val = out.decode().strip()
                if val:
                    ip = val
                    break
            except Exception:
                pass
    finally:
        s.close()
    return ip

def is_momentum_running(port):
    """Belirtilen portta Momentum sunucusunun çalışıp çalışmadığını doğrular."""
    import urllib.request
    try:
        url = f"http://127.0.0.1:{port}/api/ping"
        req = urllib.request.Request(url, headers={"User-Agent": "MomentumChecker"})
        with urllib.request.urlopen(req, timeout=0.8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data.get("app") == "momentum"
    except Exception:
        return False

def get_running_momentum():
    """Halen çalışan bir Momentum sunucusu varsa (port, pid) döndürür."""
    if os.path.exists(PORT_FILE):
        try:
            with open(PORT_FILE, "r") as f:
                port = int(f.read().strip())
            if is_momentum_running(port):
                pid = None
                if os.path.exists(PID_FILE):
                    try:
                        with open(PID_FILE, "r") as pf:
                            pid = int(pf.read().strip())
                    except Exception:
                        pass
                return port, pid
        except Exception:
            pass
    # Port dosyası silinmiş olsa dahi port aralığını yokla
    for p in range(PORT, PORT + 10):
        if is_momentum_running(p):
            return p, None
    return None, None

def find_available_port(start_port=PORT, max_attempts=50):
    """Çakışma olmadan kullanılabilecek boş bir port bulur."""
    import socket
    for p in range(start_port, start_port + max_attempts):
        if is_momentum_running(p):
            return p
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind(('0.0.0.0', p))
                return p
            except OSError:
                continue
    return start_port

def display_terminal_screen(ip, port, pin):
    """Terminalde hem şık ve taranabilir QR kod hem de doğrudan tıklanabilir bağlantı gösterir."""
    url = f"http://{ip}:{port}/?pin={pin}"
    try:
        os.system("clear")
    except Exception:
        pass
    print("\033[1;36m" + "=" * 62 + "\033[0m")
    print("\033[1;33m    🚀 MOMENTUM - CANLI SENKRONİZASYON & TELEFON MERKEZİ\033[0m")
    print("\033[1;36m" + "=" * 62 + "\033[0m\n")

    print("\033[1;32m 📱 1. YÖNTEM: QR KOD İLE ANINDA AÇ (En Hızlısı)\033[0m")
    print(" Telefonunuzun kamerasını açın ve aşağıdaki koda tutun:\n")

    try:
        import qrcode
        qr = qrcode.QRCode(border=1)
        qr.add_data(url)
        qr.print_ascii(invert=True)
    except Exception as e:
        print(f" (QR modülü yüklenemedi: {e})")

    print("\n" + "\033[1;36m" + "-" * 62 + "\033[0m")
    print("\033[1;32m 🌐 2. YÖNTEM: TELEFON TARAYICISINDAN DOĞRUDAN GİR\033[0m")
    print(" Telefonunuzun Chrome veya Samsung Internet adres çubuğuna yazın:\n")
    print(f"\033[1;37;44m  👉  {url}  \033[0m\n")
    print(f" 🔒 Güvenlik PIN Kodu: \033[1;33m{pin}\033[0m (Bağlantıya otomatik tanımlıdır)")
    print(f" ⚡ Ayrılmış Port:     \033[1;32m{port}\033[0m (Diğer projelerinizle ASLA çakışmaz)")
    print(f" 📡 Bağlı Yerel IP:    \033[1;34m{ip}\033[0m")
    print("\033[1;36m" + "-" * 62 + "\033[0m")
    print(" 💡 \033[1mİPUCU (Tam Ekran Bağımsız Uygulama Yapma):\033[0m")
    print(" Telefonda sayfa açılınca sağ üstteki 3 noktaya (⋮) basın,")
    print(" 'Ana Ekrana Ekle' (veya 'Uygulamayı Yükle') seçeneğine dokunun.")
    print(" Telefonunuzun ana ekranına kendi özel logosuyla eklenecektir!")
    print("\033[1;36m" + "-" * 62 + "\033[0m")
    print(" 🛑 Kapatmak için bu terminal penceresini kapatabilir veya")
    print("    klavyeden \033[1mCtrl + C\033[0m tuşlarına basabilirsiniz.")
    print("\033[1;36m" + "=" * 62 + "\033[0m\n")
    sys.stdout.flush()

def cleanup_files():
    if os.path.exists(PORT_FILE):
        try: os.remove(PORT_FILE)
        except Exception: pass
    if os.path.exists(PID_FILE):
        try: os.remove(PID_FILE)
        except Exception: pass

def run_server(port=PORT, show_screen=False):
    server_address = ('0.0.0.0', port)
    httpd = ThreadingHTTPServer(server_address, MomentumHTTPRequestHandler)
    
    with open(PORT_FILE, "w") as f:
        f.write(str(port))
    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))

    ip = get_local_ip()
    if show_screen:
        display_terminal_screen(ip, port, DEFAULT_PIN)
    else:
        print(f"[*] Momentum Eşitleme Sunucusu Port {port} üzerinde hazır (IP: {ip}).")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Sunucu durduruldu.")
    finally:
        cleanup_files()

def stop_server():
    try:
        os.system("clear")
    except Exception:
        pass
    print("\033[1;36m" + "=" * 62 + "\033[0m")
    print("\033[1;31m    🛑 MOMENTUM - SUNUCUYU GÜVENLE KAPAT\033[0m")
    print("\033[1;36m" + "=" * 62 + "\033[0m\n")

    port, pid = get_running_momentum()
    stopped = False

    if pid:
        try:
            os.kill(pid, 9)
            stopped = True
        except Exception:
            pass

    if port and is_momentum_running(port):
        try:
            out = subprocess.check_output(["lsof", "-ti", f":{port}"], stderr=subprocess.DEVNULL)
            pids = out.decode().strip().split()
            for p in pids:
                if p:
                    os.kill(int(p), 9)
                    stopped = True
        except Exception:
            pass

    cleanup_files()

    if stopped:
        print("  ✅ Momentum yerel sunucusu başarıyla durduruldu.")
        if port:
            print(f"  🔒 Port {port} serbest bırakıldı.")
        print("  💾 Tüm verileriniz 'momentum_data.json' dosyasına güvenle kaydedildi.")
        print("  ⚡ Diğer geliştirdiğiniz projelere hiçbir şekilde dokunulmadı.")
    else:
        print("  ℹ️  Çalışan bir Momentum sunucusu bulunamadı (zaten kapalı).")

    print("\n\033[1;36m" + "=" * 62 + "\033[0m")
    time.sleep(2)

def launch_browser():
    port, pid = get_running_momentum()
    if not port or not is_momentum_running(port):
        port = find_available_port(PORT)
        subprocess.Popen([sys.executable, os.path.abspath(__file__), str(port)],
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(0.8)
    url = f"http://localhost:{port}/?pin={DEFAULT_PIN}"
    subprocess.run(["open", url])

def handle_phone_mode():
    port, pid = get_running_momentum()
    ip = get_local_ip()

    if port and is_momentum_running(port):
        display_terminal_screen(ip, port, DEFAULT_PIN)
        print(" ℹ️  (Sunucu arka planda zaten aktif durumda. Bu ekranı açık tutabilir")
        print("     veya telefonunuzdan bağlandıktan sonra kapatabilirsiniz.)")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n[*] Çıkış yapıldı.")
    else:
        free_port = find_available_port(PORT)
        run_server(free_port, show_screen=True)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg == "--phone":
            handle_phone_mode()
            sys.exit(0)
        elif arg == "--launch-browser":
            launch_browser()
            sys.exit(0)
        elif arg == "--stop":
            stop_server()
            sys.exit(0)
        else:
            try:
                p = int(arg)
                run_server(p, show_screen=False)
                sys.exit(0)
            except ValueError:
                pass
    run_server(PORT, show_screen=False)
