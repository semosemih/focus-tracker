import os

PORT = 8765
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_FILE = os.path.join(BASE_DIR, "momentum_data.json")
DEFAULT_PIN = "2026"
PORT_FILE = os.path.join(BASE_DIR, ".momentum_port")
PID_FILE = os.path.join(BASE_DIR, ".momentum_pid")

DEFAULT_ITEM_TITLES = {
    "spor-1": "Kardiyo & Koşu",
    "spor-2": "Kuvvet & Ağırlık",
    "spor-3": "Esneme & Mobilite",
    "spor-4": "Bisiklet & Yürüyüş",
    "ders-1": "Matematik & Analiz",
    "ders-2": "Kodlama & Proje",
    "ders-3": "İngilizce / Dil",
    "ders-4": "Kitap Okuma",
    "yar-1": "Çizim & Tasarım",
    "yar-2": "Müzik & Enstrüman",
    "yar-3": "Yaratıcı Yazarlık",
    "yar-4": "Fikir & Beyin Fırtınası"
}

# Dosya koruma listesi (Ağdaki cihazların indirmesi engellenen dosyalar)
BLOCKED_EXTENSIONS = {'.command', '.sh', '.py', '.git', '.log'}
BLOCKED_FILES = {'momentum_data.json', 'server.py', 'Baslat.command', 'Telefonda_Ac.command', 'Durdur.command', 'backups', 'core'}
