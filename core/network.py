import os
import json
import socket
import subprocess
import urllib.request
from .config import PORT, PORT_FILE, PID_FILE

class NetworkService:
    """Ağ arayüzü tespiti, port denetimi ve süreç yaşam döngüsü tespiti."""

    @staticmethod
    def get_local_ip():
        """Bağlı olunan aktif ağın IP adresini dinamik ve güvenilir şekilde tespit eder."""
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

    @staticmethod
    def is_momentum_running(port):
        """Belirtilen portta Momentum sunucusunun çalışıp çalışmadığını doğrular."""
        try:
            url = f"http://127.0.0.1:{port}/api/ping"
            req = urllib.request.Request(url, headers={"User-Agent": "MomentumChecker"})
            with urllib.request.urlopen(req, timeout=0.8) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return data.get("app") == "momentum"
        except Exception:
            return False

    @classmethod
    def get_running_momentum(cls):
        """Halen çalışan bir Momentum sunucusu varsa (port, pid) döndürür."""
        if os.path.exists(PORT_FILE):
            try:
                with open(PORT_FILE, "r") as f:
                    port = int(f.read().strip())
                if cls.is_momentum_running(port):
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
            if cls.is_momentum_running(p):
                return p, None
        return None, None

    @classmethod
    def find_available_port(cls, start_port=PORT, max_attempts=50):
        """Çakışma olmadan kullanılabilecek boş bir port bulur."""
        for p in range(start_port, start_port + max_attempts):
            if cls.is_momentum_running(p):
                return p
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                try:
                    s.bind(('0.0.0.0', p))
                    return p
                except OSError:
                    continue
        return start_port
