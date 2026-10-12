/**
 * MOMENTUM - Ses & Ambiyans Servisi (AudioService)
 * Web Audio API ile tamamen yerel üretilen ses tonları ve Zen pembe gürültü (ambient sound).
 */

class AudioService {
  constructor() {
    this.audioCtx = null;
    this.ambientNoiseNode = null;
    this.ambientGainNode = null;
    this.isAmbientPlaying = false;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playTone(freq, dur = 0.15, type = 'sine') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) {
      console.warn('[Audio] Ton çalınamadı:', e);
    }
  }

  playCelebrationMelody() {
    // Hafif, dinlendirici İskandinav zafer akordu (C-E-G-B-C)
    const notes = [
      { f: 523.25, d: 0.18, t: 0 },     // C5
      { f: 659.25, d: 0.18, t: 0.12 },  // E5
      { f: 783.99, d: 0.22, t: 0.24 },  // G5
      { f: 987.77, d: 0.25, t: 0.38 },  // B5
      { f: 1046.50, d: 0.45, t: 0.52 }  // C6
    ];

    notes.forEach(n => {
      setTimeout(() => {
        this.playTone(n.f, n.d, 'triangle');
      }, n.t * 1000);
    });
  }

  toggleAmbientSound(callback = null) {
    if (this.isAmbientPlaying) {
      this.stopAmbientSound();
      if (callback) callback(false);
      return false;
    } else {
      this.startAmbientSound();
      if (callback) callback(true);
      return true;
    }
  }

  startAmbientSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // 5 saniyelik hafif pembe gürültü (Pink noise) buffer'ı üret
      const bufferSize = ctx.sampleRate * 5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
        b6 = white * 0.115926;
      }

      this.ambientNoiseNode = ctx.createBufferSource();
      this.ambientNoiseNode.buffer = noiseBuffer;
      this.ambientNoiseNode.loop = true;

      // Çok sıcak bir alçak geçiren filtre (Lowpass Filter - Yağmur/Rüzgar etkisi)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      this.ambientGainNode = ctx.createGain();
      this.ambientGainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      // Yumuşak fade-in
      this.ambientGainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.2);

      this.ambientNoiseNode.connect(filter);
      filter.connect(this.ambientGainNode);
      this.ambientGainNode.connect(ctx.destination);

      this.ambientNoiseNode.start();
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('[Ambient] Ambiyans başlatılamadı:', e);
      this.isAmbientPlaying = false;
    }
  }

  stopAmbientSound() {
    if (this.ambientGainNode && this.audioCtx) {
      try {
        this.ambientGainNode.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.6);
        setTimeout(() => {
          if (this.ambientNoiseNode) {
            this.ambientNoiseNode.stop();
            this.ambientNoiseNode.disconnect();
            this.ambientNoiseNode = null;
          }
        }, 600);
      } catch (e) {
        if (this.ambientNoiseNode) {
          try { this.ambientNoiseNode.stop(); } catch (err) {}
          this.ambientNoiseNode = null;
        }
      }
    }
    this.isAmbientPlaying = false;
  }
}

window.AudioService = AudioService;
