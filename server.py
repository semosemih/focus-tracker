#!/usr/bin/env python3
"""
MOMENTUM - Yerel Canlı Senkronizasyon & Güvenlik Sunucusu
Mac ile mobil cihazlar arasında gerçek zamanlı iki yönlü senkronizasyon sağlar.
Mimari: Modüler 'core' servis paketini kullanan sadeleştirilmiş giriş noktası (Entry Point).
"""

import sys
from core.config import (
    PORT, BASE_DIR, DB_FILE, DEFAULT_PIN, PORT_FILE, PID_FILE,
    DEFAULT_ITEM_TITLES, BLOCKED_EXTENSIONS, BLOCKED_FILES
)
from core.macos import MacOSService
from core.backup import BackupManager
from core.storage import DataStore
from core.network import NetworkService
from core.qr import QRService
from core.handlers import MomentumHTTPRequestHandler
from core.runner import ServerLifecycle, main_cli

# Geriye dönük uyumluluk takma adları (Backward-compatibility aliases)
MomentumSyncServer = DataStore
focus_momentum_tab = MacOSService.focus_momentum_tab
get_hostname = MacOSService.get_hostname
get_local_ip = NetworkService.get_local_ip
is_momentum_running = NetworkService.is_momentum_running
get_running_momentum = NetworkService.get_running_momentum
find_available_port = NetworkService.find_available_port
generate_svg_qr = QRService.generate_svg_qr
render_qr_html = QRService.render_qr_html
run_server = ServerLifecycle.run_server
stop_server = ServerLifecycle.stop_server
launch_browser = ServerLifecycle.launch_browser
handle_phone_mode = ServerLifecycle.handle_phone_mode

if __name__ == "__main__":
    main_cli(sys.argv)
