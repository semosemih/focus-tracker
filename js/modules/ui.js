/**
 * MOMENTUM - Arayüz & Efekt Yöneticisi (UIManager)
 * Konfeti parçacık fiziği, tam ekran modu, masaüstü bildirimleri, sekme başlığı animasyonları ve picker bileşenleri.
 */

class UIManager {
  constructor() {
    this.titleFlashInterval = null;
    this.toastTimer = null;
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

    if (Notification.permission === 'granted') {
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
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          try {
            new Notification(title, { body: body, icon: 'icon.svg' });
          } catch (e) {}
        }
      });
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
