/**
 * MOMENTUM - Arayüz & Efekt Yöneticisi (UIManager)
 * Konfeti parçacık fiziği, tam ekran modu, masaüstü bildirimleri, sekme başlığı animasyonları ve picker bileşenleri.
 */

class UIManager {
  constructor() {
    this.titleFlashInterval = null;
    this.toastTimer = null;
    this.activeConfirmResolver = null;
  }

  /**
   * Uygulama içi şık onay penceresi (window.confirm yerine)
   */
  showConfirm({
    title = 'Onaylıyor musun?',
    desc = 'Bu işlemi gerçekleştirmek istediğine emin misin?',
    icon = '✨',
    confirmText = 'Evet, Onayla',
    cancelText = 'Vazgeç',
    variant = 'success', // 'success' | 'danger' | 'info'
    pillEmoji = null,
    pillText = null,
    accentColor = null
  } = {}) {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirm-modal');
      if (!modal) {
        resolve(window.confirm(desc));
        return;
      }

      const windowEl = modal.querySelector('.confirm-modal-window');
      const iconEl = document.getElementById('confirm-modal-icon');
      const pillEl = document.getElementById('confirm-modal-pill');
      const pillEmojiEl = document.getElementById('confirm-pill-emoji');
      const pillTextEl = document.getElementById('confirm-pill-text');
      const titleEl = document.getElementById('confirm-modal-title');
      const descEl = document.getElementById('confirm-modal-desc');
      const okBtn = document.getElementById('btn-confirm-ok');
      const okTextEl = document.getElementById('btn-confirm-ok-text');
      const cancelBtn = document.getElementById('btn-confirm-cancel');

      if (iconEl) iconEl.textContent = icon;
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
      if (okTextEl) okTextEl.textContent = confirmText;
      if (cancelBtn) cancelBtn.textContent = cancelText;

      if (pillEl) {
        if (pillText) {
          pillEl.classList.remove('hidden');
          if (pillEmojiEl) pillEmojiEl.textContent = pillEmoji || '⚡';
          if (pillTextEl) pillTextEl.textContent = pillText;
          if (accentColor) {
            pillEl.style.borderColor = `${accentColor}44`;
            pillEl.style.backgroundColor = `${accentColor}18`;
            pillEl.style.color = accentColor;
          } else {
            pillEl.style.borderColor = '';
            pillEl.style.backgroundColor = '';
            pillEl.style.color = '';
          }
        } else {
          pillEl.classList.add('hidden');
        }
      }

      if (windowEl) {
        if (variant === 'danger') {
          windowEl.style.setProperty('--confirm-glow', 'rgba(239, 68, 68, 0.16)');
          windowEl.style.setProperty('--confirm-badge-bg', 'rgba(239, 68, 68, 0.12)');
          windowEl.style.setProperty('--confirm-badge-border', 'rgba(239, 68, 68, 0.3)');
          windowEl.style.setProperty('--confirm-btn-bg', 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)');
          windowEl.style.setProperty('--confirm-btn-hover', 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)');
          windowEl.style.setProperty('--confirm-btn-border', 'rgba(248, 113, 113, 0.4)');
          windowEl.style.setProperty('--confirm-btn-shadow', 'rgba(239, 68, 68, 0.3)');
        } else if (variant === 'info') {
          windowEl.style.setProperty('--confirm-glow', 'rgba(59, 130, 246, 0.18)');
          windowEl.style.setProperty('--confirm-badge-bg', 'rgba(59, 130, 246, 0.12)');
          windowEl.style.setProperty('--confirm-badge-border', 'rgba(59, 130, 246, 0.32)');
          windowEl.style.setProperty('--confirm-btn-bg', 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)');
          windowEl.style.setProperty('--confirm-btn-hover', 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)');
          windowEl.style.setProperty('--confirm-btn-border', 'rgba(96, 165, 250, 0.4)');
          windowEl.style.setProperty('--confirm-btn-shadow', 'rgba(37, 99, 235, 0.32)');
        } else {
          // success (varsayılan: seans bitirme)
          const color = accentColor || '#10b981';
          windowEl.style.setProperty('--confirm-glow', `${color}26`);
          windowEl.style.setProperty('--confirm-badge-bg', `${color}1f`);
          windowEl.style.setProperty('--confirm-badge-border', `${color}4d`);
          windowEl.style.setProperty('--confirm-btn-bg', 'linear-gradient(135deg, #10b981 0%, #059669 100%)');
          windowEl.style.setProperty('--confirm-btn-hover', 'linear-gradient(135deg, #34d399 0%, #10b981 100%)');
          windowEl.style.setProperty('--confirm-btn-border', 'rgba(52, 211, 153, 0.4)');
          windowEl.style.setProperty('--confirm-btn-shadow', 'rgba(16, 185, 129, 0.3)');
        }
      }

      const cleanup = (result) => {
        modal.classList.remove('active');
        okBtn?.removeEventListener('click', onOk);
        cancelBtn?.removeEventListener('click', onCancel);
        modal.removeEventListener('click', onBackdrop);
        document.removeEventListener('keydown', onKeyDown, true);
        this.activeConfirmResolver = null;
        resolve(result);
      };

      const onOk = () => cleanup(true);
      const onCancel = () => cleanup(false);
      const onBackdrop = (e) => {
        if (e.target === modal) cleanup(false);
      };
      const onKeyDown = (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          cleanup(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          cleanup(true);
        }
      };

      this.activeConfirmResolver = cleanup;
      okBtn?.addEventListener('click', onOk);
      cancelBtn?.addEventListener('click', onCancel);
      modal.addEventListener('click', onBackdrop);
      document.addEventListener('keydown', onKeyDown, true);

      modal.classList.add('active');
      setTimeout(() => okBtn?.focus(), 50);
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  showToast(toastEl, msg, duration = 3500) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('active');
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toastEl.classList.remove('active');
    }, duration);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('[UI] Tam ekran hatası:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  startTitleFlashing(title1, title2) {
    if (this.titleFlashInterval) clearInterval(this.titleFlashInterval);
    let toggle = false;
    this.titleFlashInterval = setInterval(() => {
      document.title = toggle ? title1 : title2;
      toggle = !toggle;
    }, 800);

    const stopFlashing = () => {
      if (this.titleFlashInterval) {
        clearInterval(this.titleFlashInterval);
        this.titleFlashInterval = null;
        document.title = "MOMENTUM | Odak & Gelişim Sistemi";
      }
      window.removeEventListener('focus', stopFlashing);
      document.removeEventListener('visibilitychange', stopFlashing);
    };

    window.addEventListener('focus', stopFlashing, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') stopFlashing();
    });
  }

  showDesktopNotification(item, duration, onNotificationClick = null) {
    if (!('Notification' in window)) return;

    const title = `🎉 Seans Tamamlandı! (${duration} dk)`;
    const body = `${item ? (item.emoji + ' ' + item.title) : 'Odaklanma seansın'} başarıyla bitti. Görmek için tıkla!`;

    const sendNotif = () => {
      try {
        const notif = new Notification(title, {
          body: body,
          icon: 'icon.svg',
          requireInteraction: true
        });
        notif.onclick = () => {
          window.focus();
          if (onNotificationClick) onNotificationClick();
          notif.close();
        };
      } catch (e) {
        console.warn('[UI] Bildirim hatası:', e);
      }
    };

    if (Notification.permission === 'granted') {
      sendNotif();
    } else if (Notification.permission === 'default') {
      try {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') sendNotif();
        });
      } catch (e) {}
    }
  }

  launchConfetti(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#fbbf24', '#ffffff'];

    const createBurst = (originX, originY, count, speedMultiplier = 1) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 12 + 6) * speedMultiplier;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          size: Math.random() * 9 + 4,
          shape: Math.random() > 0.4 ? 'rect' : 'circle',
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          gravity: 0.28,
          alpha: 1,
          decay: Math.random() * 0.005 + 0.006
        });
      }
    };

    // 1. Dalga: Merkez fıskiye patlaması
    createBurst(canvas.width / 2, canvas.height / 2 + 60, 100, 1.2);

    // 2. Dalga: Sol ve sağ havai fişek patlamaları (+220ms ve +480ms)
    setTimeout(() => {
      createBurst(canvas.width * 0.25, canvas.height * 0.45, 60, 0.95);
      createBurst(canvas.width * 0.75, canvas.height * 0.45, 60, 0.95);
    }, 220);

    setTimeout(() => {
      createBurst(canvas.width / 2, canvas.height * 0.4, 75, 1.1);
    }, 480);

    let animationFrame;
    const renderConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          }
          ctx.restore();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(renderConfetti);
      }
    };

    renderConfetti();
  }

  renderPickers({ emojiPickerEl, colorPickerEl, formItemEmoji, formItemColor, formItemCustomEmoji }) {
    const { EMOJI_LIST, COLOR_PALETTE } = window.MomentumConstants;

    // Emojiler
    if (emojiPickerEl) {
      emojiPickerEl.innerHTML = '';
      EMOJI_LIST.forEach((emoji, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `emoji-opt-btn ${idx === 0 ? 'selected' : ''}`;
        btn.textContent = emoji;
        btn.addEventListener('click', () => {
          emojiPickerEl.querySelectorAll('.emoji-opt-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          if (formItemEmoji) formItemEmoji.value = emoji;
          if (formItemCustomEmoji) {
            formItemCustomEmoji.value = emoji;
            formItemCustomEmoji.classList.remove('active-custom');
          }
        });
        emojiPickerEl.appendChild(btn);
      });
    }

    // Özel Emoji Girişi
    if (formItemCustomEmoji) {
      formItemCustomEmoji.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          if (formItemEmoji) formItemEmoji.value = val;
          if (emojiPickerEl) {
            emojiPickerEl.querySelectorAll('.emoji-opt-btn').forEach(b => {
              b.classList.toggle('selected', b.textContent === val);
            });
          }
          formItemCustomEmoji.classList.add('active-custom');
        }
      });
    }

    // Renkler
    if (colorPickerEl) {
      colorPickerEl.innerHTML = '';
      COLOR_PALETTE.forEach((color, idx) => {
        const swatch = document.createElement('div');
        swatch.className = `color-swatch ${idx === 0 ? 'selected' : ''}`;
        swatch.style.backgroundColor = color.hex;
        swatch.style.setProperty('--swatch-color', color.hex);
        swatch.title = color.name;
        swatch.addEventListener('click', () => {
          colorPickerEl.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
          swatch.classList.add('selected');
          if (formItemColor) formItemColor.value = color.hex;
        });
        colorPickerEl.appendChild(swatch);
      });
    }
  }
}

window.UIManager = UIManager;
