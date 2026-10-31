let audioCtx: AudioContext | null = null;
let soundEnabled = true;

try {
  const saved = localStorage.getItem('vishal_sound_enabled');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
} catch (e) {}

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
  try {
    localStorage.setItem('vishal_sound_enabled', enabled ? 'true' : 'false');
  } catch (e) {}
};

export const getSoundEnabled = () => soundEnabled;

const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Ignore
  }
};

export const playPop = () => playTone(600, 'sine', 0.1, 0.1);
export const playMatch = () => playTone(800, 'square', 0.15, 0.05);
export const playError = () => playTone(150, 'sawtooth', 0.3, 0.1);
export const playSuccess = () => playTone(1200, 'sine', 0.2, 0.1);
export const playTick = () => playTone(400, 'sine', 0.05, 0.05);
export const playGameOver = () => playTone(100, 'sawtooth', 0.8, 0.2);
export const playShoot = () => playTone(800, 'square', 0.1, 0.05);
export const playExplosion = () => playTone(100, 'square', 0.3, 0.2); // Rough approximation
export const playJump = () => playTone(500, 'sine', 0.2, 0.1);
export const playHit = () => playTone(200, 'sawtooth', 0.15, 0.1);
