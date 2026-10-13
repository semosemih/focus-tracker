import os
import subprocess
import socket

class MacOSService:
    """macOS platformuna özel sistem otomasyonları ve cihaz servisleri."""

    @staticmethod
    def play_system_alert():
        """Mac sistem hoparlöründen dikkat çekici zafer sesini çalar (arka planda sekme dondurulsa bile duyulur)."""
        try:
            for sound in ["/System/Library/Sounds/Glass.aiff", "/System/Library/Sounds/Hero.aiff", "/System/Library/Sounds/Ping.aiff"]:
                if os.path.exists(sound):
                    subprocess.Popen(["afplay", sound], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    break
        except Exception as e:
            print(f"[!] play_system_alert hatası: {e}")

    @staticmethod
    def show_system_notification(title="🎉 Seans Tamamlandı!", message="Odaklanma seansın bitti. Momentum'a dön!"):
        """macOS bildirim merkezinde izin istemeyen yerel sistem bildirimi gösterir."""
        try:
            clean_title = title.replace('"', '\\"')
            clean_msg = message.replace('"', '\\"')
            cmd = f'display notification "{clean_msg}" with title "{clean_title}" sound name "Glass"'
            subprocess.Popen(["osascript", "-e", cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            print(f"[!] show_system_notification hatası: {e}")

    @staticmethod
    def focus_momentum_tab(port=None, target_url=None, preferred_browser=None):
        """Seans bittiğinde kullanıcının açık olan Momentum sekmesini ve tarayıcısını tüm uygulamaların önüne getirir.
        
        Çok katmanlı, hata affetmeyen (bulletproof) mimari:
        1. Ses Uyarısı: Arka planda tarayıcı sesi kısıldıysa bile Mac sistem sesini (afplay) çalar.
        2. Sistem Bildirimi: İzin gerektirmeyen macOS yerel bildirim banner'ı fırlatır.
        3. Akıllı Sekme Eşleştirme: Kullanıcının bulunduğu tarayıcıyı önceliklendirir, kullanılmayan tarayıcıları
           gereksiz yere tetiklemez (Chrome / Brave yetki onay pencerelerini engeller).
        4. Tam Eşleşme: Dinamik port (8766 vb.), pin parametresi ve başlık üzerinden sekme bulunur ve öne alınır.
        5. Kesin Yedek (Fallback): AppleScript engellense veya sekme bulunamasa dahi, macOS 'open' komutu ile
           kullanıcı doğrudan Momentum sayfasına getirilir. Asla sessizce başarısız olmaz.
        """
        # 1. Ses ve yerel bildirim fırlat
        MacOSService.play_system_alert()
        MacOSService.show_system_notification()

        # 2. Port ve URL tespit et
        from .config import PORT, PORT_FILE, DEFAULT_PIN
        candidate_ports = set()
        if port:
            try:
                candidate_ports.add(str(int(port)))
            except Exception:
                pass

        if os.path.exists(PORT_FILE):
            try:
                with open(PORT_FILE, "r") as pf:
                    p = pf.read().strip()
                    if p:
                        candidate_ports.add(p)
            except Exception:
                pass
        candidate_ports.add(str(PORT))
        candidate_ports.discard("")

        active_port = port or (next(iter(candidate_ports)) if candidate_ports else str(PORT))
        final_url = target_url or f"http://localhost:{active_port}/?pin={DEFAULT_PIN}"

        # 3. Hangi tarayıcıların taranacağını belirle
        browser_candidates = []
        if preferred_browser:
            browser_candidates.append(preferred_browser)

        for b in ["Brave Browser", "Google Chrome", "Safari", "Microsoft Edge"]:
            if b not in browser_candidates:
                browser_candidates.append(b)

        # Port koşullarını hazırla
        port_conditions = " or ".join([f'u contains "{p}"' for p in candidate_ports])
        if not port_conditions:
            port_conditions = f'u contains "{PORT}"'

        tab_found = False

        for browser in browser_candidates:
            # Yalnızca çalışmakta olan tarayıcıyı kontrol et
            is_running_script = f'application "{browser}" is running'
            check = subprocess.run(["osascript", "-e", is_running_script], capture_output=True, text=True)
            if check.stdout.strip() != "true":
                continue

            if browser == "Safari":
                script = f'''
                try
                    tell application "Safari"
                        repeat with w in windows
                            repeat with t in tabs of w
                                set u to URL of t
                                set ttl to name of t
                                if ({port_conditions}) or u contains "pin=" or u contains "momentum" or ttl contains "MOMENTUM" or ttl contains "Odak" or ttl contains "Seans" or ttl contains "TEBRİKLER" then
                                    set current tab of w to t
                                    set index of w to 1
                                    activate
                                    return "FOUND"
                                end if
                            end repeat
                        end repeat
                    end tell
                on error
                    return "ERROR"
                end try
                return "NOT_FOUND"
                '''
            else:
                # Chromium tabanlılar (Brave, Chrome, Edge)
                script = f'''
                try
                    tell application "{browser}"
                        repeat with w in windows
                            set tabIdx to 0
                            repeat with t in tabs of w
                                set tabIdx to tabIdx + 1
                                set u to URL of t
                                set ttl to title of t
                                if ({port_conditions}) or u contains "pin=" or u contains "momentum" or ttl contains "MOMENTUM" or ttl contains "Odak" or ttl contains "Seans" or ttl contains "TEBRİKLER" then
                                    set active tab index of w to tabIdx
                                    set index of w to 1
                                    activate
                                    return "FOUND"
                                end if
                            end repeat
                        end repeat
                    end tell
                on error
                    return "ERROR"
                end try
                return "NOT_FOUND"
                '''

            try:
                res = subprocess.run(["osascript", "-e", script], capture_output=True, text=True, timeout=3)
                out = (res.stdout or "").strip()
                if out == "FOUND":
                    tab_found = True
                    # macOS seviyesinde pencereyi öne çek
                    subprocess.run(["open", "-a", browser], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    print(f"[✓] focus_momentum_tab: Açık Momentum sekmesi ({browser}) öne getirildi.")
                    return
            except Exception as e:
                print(f"[!] focus_momentum_tab ({browser}) kontrol hatası: {e}")

            # Kullanıcı özellikle belirli bir tarayıcıdan istek attıysa ve o tarayıcı incelendiyse,
            # başka tarayıcılara bulaşıp gereksiz izin uyarısı çıkarmamak için döngüyü kes
            if preferred_browser and browser == preferred_browser:
                break

        # 4. KESİN GÜVENLİK AĞI (FALLBACK):
        # AppleScript ile sekme bulunamadıysa veya otomasyon izni reddedildiyse:
        # macOS yerel 'open' komutu ile tarayıcıyı ve Momentum sekmesini doğrudan öne getir!
        if not tab_found:
            try:
                if preferred_browser:
                    subprocess.run(["open", "-a", preferred_browser, final_url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    subprocess.run(["open", final_url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print(f"[✓] focus_momentum_tab: Sayfa yerel yönlendirme ile öne getirildi ({final_url}).")
            except Exception as e:
                print(f"[!] focus_momentum_tab fallback hatası: {e}")

    @staticmethod
    def get_hostname():
        """Mac'in yerel ağdaki kalıcı Bonjour/mDNS adını tespit eder."""
        try:
            out = subprocess.check_output(["scutil", "--get", "LocalHostName"], stderr=subprocess.DEVNULL)
            h = out.decode().strip()
            if h:
                return f"{h}.local"
        except Exception:
            pass
        return socket.gethostname()
