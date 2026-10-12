import os
import sys
import time
import subprocess
import threading
from http.server import ThreadingHTTPServer
from .config import PORT, PORT_FILE, PID_FILE, DEFAULT_PIN
from .network import NetworkService
from .macos import MacOSService
from .handlers import MomentumHTTPRequestHandler

class ServerLifecycle:
    """Sunucu başlatma, durdurma, tarayıcı ve telefon modunu yöneten yaşam döngüsü sınıfı."""

    @staticmethod
    def display_terminal_screen(port, pin):
        """Terminalde sade ve güvenli başlatma ekranı gösterir."""
        try:
            os.system("clear")
        except Exception:
            pass
        print("\033[1;36m" + "=" * 60 + "\033[0m")
        print("\033[1;33m    🚀 MOMENTUM - CANLI TELEFON BAĞLANTI MERKEZİ\033[0m")
        print("\033[1;36m" + "=" * 60 + "\033[0m\n")

        print("\033[1;32m 📱 Mac ekranınızda güvenli QR Kod penceresi açıldı.\033[0m")
        print(" Telefonunuzun kamerasını ekrandaki koda tutarak anında bağlanabilirsiniz.\n")

        print("\033[1;36m" + "-" * 60 + "\033[0m")
        print(f" 🔒 Güvenlik PIN Kodu: \033[1;33m{pin}\033[0m")
        print(f" ⚡ Ayrılmış Port:     \033[1;32m{port}\033[0m")
        print("\033[1;36m" + "-" * 60 + "\033[0m")
        print(" 🛑 Kapatmak için bu pencereyi kapatabilir veya \033[1mCtrl + C\033[0m yapabilirsiniz.")
        print("\033[1;36m" + "=" * 60 + "\033[0m\n")
        sys.stdout.flush()

    @staticmethod
    def cleanup_files():
        if os.path.exists(PORT_FILE):
            try:
                os.remove(PORT_FILE)
            except Exception:
                pass
        if os.path.exists(PID_FILE):
            try:
                os.remove(PID_FILE)
            except Exception:
                pass

    @classmethod
    def run_server(cls, port=PORT, show_screen=False):
        server_address = ('0.0.0.0', port)
        httpd = ThreadingHTTPServer(server_address, MomentumHTTPRequestHandler)

        with open(PORT_FILE, "w") as f:
            f.write(str(port))
        with open(PID_FILE, "w") as f:
            f.write(str(os.getpid()))

        ip = NetworkService.get_local_ip()
        host = MacOSService.get_hostname()
        if show_screen:
            cls.display_terminal_screen(port, DEFAULT_PIN)
            # 0.5 sn sonra Mac'te jilet gibi net QR kod penceresini otomatik aç
            threading.Timer(0.5, lambda: subprocess.run(["open", f"http://localhost:{port}/qr"], stderr=subprocess.DEVNULL)).start()
        else:
            print(f"[*] Momentum Eşitleme Sunucusu Port {port} üzerinde hazır (IP: {ip}, Host: {host}).")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[*] Sunucu durduruldu.")
        finally:
            cls.cleanup_files()

    @classmethod
    def stop_server(cls):
        try:
            os.system("clear")
        except Exception:
            pass
        print("\033[1;36m" + "=" * 62 + "\033[0m")
        print("\033[1;31m    🛑 MOMENTUM - SUNUCUYU GÜVENLE KAPAT\033[0m")
        print("\033[1;36m" + "=" * 62 + "\033[0m\n")

        port, pid = NetworkService.get_running_momentum()
        stopped = False

        if pid:
            try:
                os.kill(pid, 9)
                stopped = True
            except Exception:
                pass

        if port and NetworkService.is_momentum_running(port):
            try:
                out = subprocess.check_output(["lsof", "-ti", f":{port}"], stderr=subprocess.DEVNULL)
                pids = out.decode().strip().split()
                for p in pids:
                    if p:
                        os.kill(int(p), 9)
                        stopped = True
            except Exception:
                pass

        cls.cleanup_files()

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

    @classmethod
    def launch_browser(cls):
        port, _ = NetworkService.get_running_momentum()
        if not port or not NetworkService.is_momentum_running(port):
            port = NetworkService.find_available_port(PORT)
            main_server_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "server.py")
            subprocess.Popen([sys.executable, main_server_file, str(port)],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                             start_new_session=True)
            time.sleep(0.8)
        url = f"http://localhost:{port}/?pin={DEFAULT_PIN}"
        subprocess.run(["open", url])

    @classmethod
    def handle_phone_mode(cls):
        port, _ = NetworkService.get_running_momentum()

        if port and NetworkService.is_momentum_running(port):
            cls.display_terminal_screen(port, DEFAULT_PIN)
            subprocess.run(["open", f"http://localhost:{port}/qr"], stderr=subprocess.DEVNULL)
            print(" ℹ️  (Sunucu arka planda zaten aktif. Mac ekranında net QR kod penceresi açıldı.)")
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n[*] Çıkış yapıldı.")
        else:
            free_port = NetworkService.find_available_port(PORT)
            cls.run_server(free_port, show_screen=True)

def main_cli(args=None):
    """Komut satırı arayüzü yönlendiricisi."""
    if args is None:
        args = sys.argv

    if len(args) > 1:
        cmd = args[1]
        if cmd == "--phone":
            ServerLifecycle.handle_phone_mode()
            return
        elif cmd == "--launch-browser":
            ServerLifecycle.launch_browser()
            return
        elif cmd == "--stop":
            ServerLifecycle.stop_server()
            return
        else:
            try:
                p = int(cmd)
                ServerLifecycle.run_server(p, show_screen=False)
                return
            except ValueError:
                pass
    ServerLifecycle.run_server(PORT, show_screen=False)
