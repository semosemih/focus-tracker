import os
import json
import time
from .config import BASE_DIR

class BackupManager:
    """Yerel disk, Belgeler klasörü ve Google Drive üzerinde çok katmanlı yedekleme yöneticisi."""

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

    def create_backup(self, data):
        """Tüm hedeflere eşzamanlı ve güvenli yedek yazar, eski yedekleri sınırlar."""
        try:
            ts = time.strftime("%Y%m%d_%H%M%S")

            # 1. Proje içindeki yerel backups klasörü (son 10 kopya)
            backup_dir = os.path.join(BASE_DIR, "backups")
            os.makedirs(backup_dir, exist_ok=True)
            backup_path = os.path.join(backup_dir, f"momentum_data_{ts}.json")
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            all_backups = sorted([f for f in os.listdir(backup_dir) if f.startswith("momentum_data_") and f.endswith(".json")])
            if len(all_backups) > 10:
                for old_f in all_backups[:-10]:
                    try:
                        os.remove(os.path.join(backup_dir, old_f))
                    except Exception:
                        pass

            # 2. Kullanıcının ~/Documents/Momentum_Yedekleri klasörü (Harici yerel güvenlik)
            docs_backup_dir = os.path.expanduser("~/Documents/Momentum_Yedekleri")
            os.makedirs(docs_backup_dir, exist_ok=True)
            docs_latest = os.path.join(docs_backup_dir, "momentum_data_latest.json")
            with open(docs_latest, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            # 3. Google One / Google Drive Bulut Yedeklemesi (Son 30 kopya + latest)
            gdrive_dir = self.get_google_drive_backup_dir()
            if gdrive_dir:
                try:
                    os.makedirs(gdrive_dir, exist_ok=True)

                    # Her zaman en güncel dosya (hızlı erişim için)
                    gdrive_latest = os.path.join(gdrive_dir, "momentum_data_latest.json")
                    with open(gdrive_latest, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)

                    # Zaman damgalı yedek
                    gdrive_ts_path = os.path.join(gdrive_dir, f"momentum_data_{ts}.json")
                    with open(gdrive_ts_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)

                    # Google One üzerinde son 30 kopyayı sakla
                    all_gdrive_backups = sorted([f for f in os.listdir(gdrive_dir) if f.startswith("momentum_data_") and f.endswith(".json") and f != "momentum_data_latest.json"])
                    if len(all_gdrive_backups) > 30:
                        for old_f in all_gdrive_backups[:-30]:
                            try:
                                os.remove(os.path.join(gdrive_dir, old_f))
                            except Exception:
                                pass
                except Exception as ge:
                    print(f"[!] Google Drive yedekleme uyarısı: {ge}")
        except Exception as e:
            print(f"[!] Yedekleme uyarısı: {e}")
