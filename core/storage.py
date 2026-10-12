import os
import json
import time
import threading
from .config import DB_FILE, DEFAULT_ITEM_TITLES
from .backup import BackupManager

class DataStore:
    """Thread-safe veri tabanı yöneticisi, atomik kayıt ve veri birleştirme (merge) motoru."""

    def __init__(self, db_path=DB_FILE, backup_manager=None):
        self.db_path = db_path
        self.backup_manager = backup_manager or BackupManager()
        self.lock = threading.Lock()
        self.data = self.load()
        # Sunucu başlangıcında hemen bir güvenlik yedeği al
        self.backup_manager.create_backup(self.data)

    def get_default_state(self):
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

    def load(self):
        """Diskteki JSON veritabanını okur, bozuksa veya yoksa varsayılan şablonu döner."""
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                    if isinstance(content, dict) and 'items' in content:
                        return content
            except Exception as e:
                print(f"[!] Veritabanı okuma uyarısı: {e}")
        return self.get_default_state()

    def save(self):
        """Geçici dosya (tmp) ve os.replace ile atomik, veri kaybı riski olmayan güvenli yazma."""
        with self.lock:
            try:
                self.data["lastUpdated"] = int(time.time() * 1000)
                tmp_path = f"{self.db_path}.{os.getpid()}.{threading.get_ident()}.tmp"
                with open(tmp_path, 'w', encoding='utf-8') as f:
                    json.dump(self.data, f, ensure_ascii=False, indent=2)
                os.replace(tmp_path, self.db_path)
                self.backup_manager.create_backup(self.data)
                return True
            except Exception as e:
                print(f"[!] Veritabanı kayıt hatası: {e}")
                return False

    def merge_sync_payload(self, payload):
        """İstemciden (tarayıcı/telefon) gelen veriyi çakışma çözümleme kurallarına göre birleştirir."""
        with self.lock:
            # 1. Items (Alt Başlıklar) Çakışma Yönetimi
            if "items" in payload and isinstance(payload["items"], dict):
                existing_items = self.data.get("items", {})
                incoming_items = payload["items"]
                sanitized_items = {}

                for cat in ("spor", "ders", "yaraticilik"):
                    ex_list = existing_items.get(cat, [])
                    in_list = incoming_items.get(cat, [])
                    ex_map = {item["id"]: item for item in ex_list if isinstance(item, dict) and "id" in item}

                    cat_result = []
                    for in_item in in_list:
                        if not isinstance(in_item, dict) or "id" not in in_item:
                            continue
                        iid = in_item["id"]
                        ex_item = ex_map.get(iid)

                        # Sunucuda bu öğe özelleştirilmişse ve istemciden gelen varsayılana dönmüşse koru
                        if ex_item and iid in DEFAULT_ITEM_TITLES:
                            default_title = DEFAULT_ITEM_TITLES[iid]
                            ex_is_custom = (ex_item.get("title") != default_title)
                            in_is_default = (in_item.get("title") == default_title)
                            in_time = in_item.get("updatedAt", 0)
                            ex_time = ex_item.get("updatedAt", 0)

                            if ex_is_custom and in_is_default and in_time <= ex_time:
                                merged_item = dict(ex_item)
                                merged_item.update(in_item)
                                merged_item["title"] = ex_item.get("title")
                                merged_item["emoji"] = ex_item.get("emoji")
                                merged_item["color"] = ex_item.get("color")
                                if "updatedAt" in ex_item:
                                    merged_item["updatedAt"] = ex_item["updatedAt"]
                                cat_result.append(merged_item)
                                continue
                            elif ex_item:
                                merged_item = dict(ex_item)
                                merged_item.update(in_item)
                                cat_result.append(merged_item)
                                continue

                        cat_result.append(in_item)

                    sanitized_items[cat] = cat_result if in_list else ex_list

                self.data["items"] = sanitized_items

            # 2. Seanslar (Tarihsel veriler asla silinmez, birleştirilir)
            if "sessions" in payload and isinstance(payload["sessions"], list):
                existing_sessions = self.data.get("sessions", [])
                sess_map = {}
                for s in existing_sessions:
                    if isinstance(s, dict) and (s.get("id") or s.get("timestamp")):
                        sess_map[s.get("id") or f"ses-{s.get('timestamp')}"] = s
                for s in payload["sessions"]:
                    if isinstance(s, dict) and (s.get("id") or s.get("timestamp")):
                        sess_map[s.get("id") or f"ses-{s.get('timestamp')}"] = s
                self.data["sessions"] = sorted(sess_map.values(), key=lambda x: x.get("timestamp", 0))

            # 3. Görevler (To-Dos)
            if "todos" in payload:
                self.data["todos"] = payload["todos"]

            # 4. Aktif Zamanlayıcı
            if "timer" in payload:
                self.data["timer"] = payload["timer"]

        # Değişiklikleri diske ve yedeklere kaydet
        return self.save()
