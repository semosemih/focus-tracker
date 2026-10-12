/**
 * MOMENTUM - Zamanlayıcı Motoru Servisi (TimerService)
 * Web Worker tabanlı, arka planda sekme dondurulduğunda bile saniye şaşmayan hassas zamanlayıcı.
 */

class TimerService {
  constructor() {
    this.state = {
      activeItem: null,
      activeTodo: null,
      durationMinutes: 30,
      totalSeconds: 30 * 60,
      remainingSeconds: 30 * 60,
      targetEndTime: null,
      isRunning: false,
      intervalId: null
    };

    this.timerWorker = null;
    this.callbacks = {
      onTick: null,
      onFinish: null,
      onStateChange: null
    };

    this.initTimerWorker();
    this.setupVisibilityListener();
  }

  init(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  initTimerWorker() {
    try {
      const workerCode = `
        let timerId = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (timerId) clearInterval(timerId);
            timerId = setInterval(() => {
              self.postMessage('tick');
            }, 500);
          } else if (e.data === 'stop') {
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.timerWorker = new Worker(URL.createObjectURL(blob));
      this.timerWorker.onmessage = (e) => {
        if (e.data === 'tick') {
          this.syncWithTimestamp();
        }
      };
    } catch (e) {
      console.warn('[Timer] Web Worker başlatılamadı, standart zamanlayıcı devrede:', e);
      this.timerWorker = null;
    }
  }

  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.state.isRunning) {
        this.syncWithTimestamp();
      }
    });
  }

  start(minutes, item, todo = null) {
    this.state.durationMinutes = minutes;
    this.state.totalSeconds = minutes * 60;
    this.state.remainingSeconds = minutes * 60;
    this.state.activeItem = item;
    this.state.activeTodo = todo;
    this.state.targetEndTime = Date.now() + (minutes * 60 * 1000);
    this.state.isRunning = true;

    this.startInterval();
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.state, true);
    }
  }

  startInterval() {
    if (this.state.intervalId) clearInterval(this.state.intervalId);

    if (this.timerWorker) {
      this.timerWorker.postMessage('start');
    }

    this.state.intervalId = setInterval(() => {
      this.syncWithTimestamp();
    }, 1000);

    this.syncWithTimestamp();
  }

  stopInterval() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
    if (this.timerWorker) {
      this.timerWorker.postMessage('stop');
    }
  }

  toggle() {
    if (this.state.isRunning) {
      // Duraklat
      this.stopInterval();
      this.state.isRunning = false;
      this.state.targetEndTime = null;
    } else {
      // Devam et
      this.state.targetEndTime = Date.now() + (this.state.remainingSeconds * 1000);
      this.state.isRunning = true;
      this.startInterval();
    }

    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.state, this.state.isRunning);
    }
  }

  reset() {
    this.stopInterval();
    this.state.isRunning = false;
    this.state.targetEndTime = null;
    this.state.remainingSeconds = this.state.totalSeconds;

    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.state);
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.state, false);
    }
  }

  stopSilently() {
    this.stopInterval();
    this.state.isRunning = false;
    this.state.targetEndTime = null;
  }

  syncWithTimestamp() {
    if (!this.state.isRunning || !this.state.targetEndTime) return;

    const now = Date.now();
    const diffMs = this.state.targetEndTime - now;
    const diffSec = Math.max(0, Math.round(diffMs / 1000));

    this.state.remainingSeconds = diffSec;

    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.state);
    }

    if (diffSec <= 0) {
      this.finish();
    }
  }

  finish() {
    this.stopInterval();
    this.state.isRunning = false;
    this.state.targetEndTime = null;
    this.state.remainingSeconds = 0;

    const sessionInfo = {
      item: this.state.activeItem,
      todo: this.state.activeTodo,
      durationMinutes: this.state.durationMinutes
    };

    if (this.callbacks.onFinish) {
      this.callbacks.onFinish(sessionInfo);
    }
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.state, false);
    }
  }

  applyRemoteTimer(remoteTimer) {
    if (!remoteTimer || !remoteTimer.item) return false;
    const now = Date.now();
    if (remoteTimer.targetEndTime && remoteTimer.targetEndTime <= now) return false;

    this.state.activeItem = remoteTimer.item;
    this.state.durationMinutes = remoteTimer.durationMinutes || 30;
    this.state.totalSeconds = remoteTimer.totalSeconds || (this.state.durationMinutes * 60);
    this.state.targetEndTime = remoteTimer.targetEndTime;
    this.state.remainingSeconds = remoteTimer.remainingSeconds || this.state.totalSeconds;
    this.state.isRunning = true;

    this.startInterval();
    return true;
  }

  getSyncPayload() {
    return {
      active: this.state.isRunning,
      item: this.state.isRunning ? this.state.activeItem : null,
      durationMinutes: this.state.durationMinutes,
      targetEndTime: this.state.targetEndTime,
      remainingSeconds: this.state.remainingSeconds,
      totalSeconds: this.state.totalSeconds
    };
  }
}

window.TimerService = TimerService;
