import subprocess
import socket

class MacOSService:
    """macOS platformuna özel sistem otomasyonları ve cihaz servisleri."""

    @staticmethod
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
