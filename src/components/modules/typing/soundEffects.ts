/**
 * High-fidelity Web Audio API Sound Synthesizer for VYRON TYPING
 * Supports multiple tactile mechanical sound profiles, volume control, error notes, streak chimes, and victory fanfares.
 * 100% offline, zero external audio assets required.
 */

export type SoundProfile = 'cherry-blue' | 'thock' | 'typewriter' | 'bubble' | 'mute';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private profile: SoundProfile = 'cherry-blue';
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setProfile(profile: SoundProfile) {
    this.profile = profile;
  }

  public getProfile(): SoundProfile {
    return this.profile;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public isMuted(): boolean {
    return this.profile === 'mute' || this.volume <= 0;
  }

  public setMuted(muted: boolean) {
    if (muted) {
      this.profile = 'mute';
    } else if (this.profile === 'mute') {
      this.profile = 'cherry-blue';
    }
  }

  public getMuted(): boolean {
    return this.isMuted();
  }

  // Tactile keypress sound based on selected profile
  public playKeyClick(char?: string) {
    if (this.isMuted()) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const baseGain = 0.25 * this.volume;

      if (this.profile === 'thock') {
        // Deep, creamy mechanical thock (linear switch / creamy POM stem)
        const freq = char === ' ' ? 130 : 180 + Math.random() * 40;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(baseGain * 1.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
      } else if (this.profile === 'typewriter') {
        // Crisp, mechanical carriage metal strike
        const freq = char === ' ' ? 800 : 1200 + Math.random() * 300;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, now);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(baseGain * 0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      } else if (this.profile === 'bubble') {
        // Gentle, soft water drop / bubble pop
        const freq = char === ' ' ? 400 : 550 + Math.random() * 120;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.03);

        gain.gain.setValueAtTime(baseGain * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        // Default: Cherry MX Blue tactile click
        const baseFreq = char === ' ' ? 240 : 400 + Math.random() * 90;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2600, now);

        gain.gain.setValueAtTime(baseGain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {
      // Audio fail gracefully
    }
  }

  // Soft warning sound on typo
  public playError() {
    if (this.isMuted()) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.07);

      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Streak combo chime
  public playStreakChime(streakCount: number) {
    if (this.isMuted()) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const pitches = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const pitch = pitches[Math.min(Math.floor(streakCount / 10), pitches.length - 1)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }

  // Victory fanfare on test completion
  public playVictory() {
    if (this.isMuted()) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, t: 0, d: 0.12 },
        { f: 659.25, t: 0.12, d: 0.12 },
        { f: 783.99, t: 0.24, d: 0.12 },
        { f: 1046.5, t: 0.36, d: 0.35 },
      ];

      notes.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.t);
        gain.gain.setValueAtTime(0.25 * this.volume, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + note.t);
        osc.stop(now + note.t + note.d + 0.05);
      });
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
