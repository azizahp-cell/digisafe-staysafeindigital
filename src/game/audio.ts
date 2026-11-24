/** Tiny WebAudio synth: all music and sound effects are generated in-browser (no external files). */
type Sfx = "step" | "talk" | "click" | "clue" | "evidence" | "correct" | "wrong" | "page" | "unlock" | "exp";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private mode: "town" | "victory" | null = null;
  musicOn = true;
  sfxOn = true;

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicOn ? 0.16 : 0;
      this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxOn ? 0.5 : 0;
      this.sfxGain.connect(this.master);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMusic(on: boolean) {
    this.musicOn = on;
    if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(on ? 0.16 : 0, this.ctx.currentTime, 0.1);
  }
  setSfx(on: boolean) {
    this.sfxOn = on;
    if (this.sfxGain && this.ctx) this.sfxGain.gain.setTargetAtTime(on ? 0.5 : 0, this.ctx.currentTime, 0.05);
  }

  private tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number, dest: GainNode, slideTo?: number) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(dest);
    o.start(start);
    o.stop(start + dur + 0.02);
  }

  private noise(start: number, dur: number, vol: number, freq: number) {
    if (!this.ctx || !this.sfxGain) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(this.sfxGain);
    src.start(start);
  }

  play(name: Sfx) {
    if (!this.ctx || !this.sfxGain || !this.sfxOn) return;
    const t = this.ctx.currentTime;
    const s = this.sfxGain;
    switch (name) {
      case "step":
        this.noise(t, 0.05, 0.25, 900 + Math.random() * 300);
        break;
      case "talk":
        this.tone(660, t, 0.06, "square", 0.08, s);
        break;
      case "click":
        this.tone(880, t, 0.05, "square", 0.1, s, 1200);
        break;
      case "page":
        this.noise(t, 0.16, 0.35, 2400);
        break;
      case "clue":
        this.tone(988, t, 0.09, "triangle", 0.25, s);
        this.tone(1319, t + 0.07, 0.14, "triangle", 0.25, s);
        break;
      case "evidence":
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, t + i * 0.07, 0.18, "triangle", 0.25, s));
        break;
      case "correct":
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, t + i * 0.09, 0.25, "square", 0.12, s));
        break;
      case "wrong":
        this.tone(300, t, 0.18, "sawtooth", 0.12, s, 180);
        this.tone(220, t + 0.16, 0.28, "sawtooth", 0.12, s, 120);
        break;
      case "unlock":
        [659, 880, 1319].forEach((f, i) => this.tone(f, t + i * 0.08, 0.2, "triangle", 0.25, s));
        break;
      case "exp":
        for (let i = 0; i < 6; i++) this.tone(1200 + i * 120, t + i * 0.05, 0.06, "square", 0.07, s);
        break;
    }
  }

  // --- Music ---------------------------------------------------------------
  private static TOWN = {
    bpm: 92,
    // 16-step bars: chord roots (Hz) and melody (0 = rest), cozy I–vi–IV–V in C
    chords: [
      [261.63, 329.63, 392.0],
      [220.0, 261.63, 329.63],
      [174.61, 220.0, 261.63],
      [196.0, 246.94, 293.66],
    ],
    melody: [
      [659, 0, 784, 0, 880, 0, 784, 659, 587, 0, 523, 0, 587, 659, 0, 0],
      [523, 0, 659, 0, 784, 0, 659, 0, 587, 523, 440, 0, 523, 0, 0, 0],
      [440, 0, 523, 0, 659, 0, 698, 659, 587, 0, 523, 0, 440, 523, 0, 0],
      [587, 0, 659, 0, 784, 0, 740, 0, 784, 0, 880, 0, 784, 0, 0, 0],
    ],
  };

  startMusic(mode: "town" | "victory") {
    this.unlock();
    if (!this.ctx || this.mode === mode) return;
    this.stopMusic();
    this.mode = mode;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    if (mode === "victory") this.victory();
    this.timer = window.setInterval(() => this.schedule(), 60);
  }

  stopMusic() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.mode = null;
  }

  private victory() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime + 0.05;
    const m = this.musicGain;
    const notes = [523, 659, 784, 1047, 0, 784, 1047, 1319];
    notes.forEach((f, i) => f && this.tone(f, t + i * 0.14, 0.3, "square", 0.5, m));
    [261.63, 329.63, 392].forEach((f) => this.tone(f, t + 1.12, 1.4, "triangle", 0.45, m));
  }

  private schedule() {
    if (!this.ctx || !this.musicGain) return;
    const m = this.musicGain;
    const song = AudioEngine.TOWN;
    const stepDur = 60 / song.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.25) {
      const bar = Math.floor(this.step / 16) % 4;
      const i = this.step % 16;
      const t = this.nextTime;
      const chord = song.chords[bar]!;
      if (this.mode === "town" || (this.mode === "victory" && this.step > 24)) {
        if (i % 4 === 0) this.tone(chord[0]! / 2, t, stepDur * 3.5, "triangle", 0.55, m);
        if (i % 2 === 0) this.tone(chord[(i / 2) % 3]!, t, stepDur * 1.6, "sine", 0.18, m);
        const mel = song.melody[bar]![i];
        if (mel) this.tone(mel, t, stepDur * 1.8, "square", 0.12, m);
      }
      this.nextTime += stepDur;
      this.step++;
    }
  }
}

export const audio = new AudioEngine();
