let audioContext: AudioContext | null = null;
let fxMuted = false;

const MUSIC_TRACKS = [
  '/assets/music/bg_music1.mp3',
  '/assets/music/bg_music2.mp3',
];
let musicAudio: HTMLAudioElement | null = null;
let musicTrackIndex = -1;
let musicStarted = false;
let musicMuted = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function setFxMuted(muted: boolean) {
  fxMuted = muted;
}

export function isFxMuted(): boolean {
  return fxMuted;
}

function getMusicAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!musicAudio) {
    musicAudio = new Audio();
    musicAudio.volume = 0.35;
    musicAudio.preload = 'auto';
    musicAudio.addEventListener('ended', () => {
      if (!musicAudio || musicMuted) return;
      musicTrackIndex = (musicTrackIndex + 1) % MUSIC_TRACKS.length;
      musicAudio.src = MUSIC_TRACKS[musicTrackIndex];
      void musicAudio.play().catch(() => {});
    });
  }
  return musicAudio;
}

export function startMusic() {
  const audio = getMusicAudio();
  if (!audio || musicMuted) return;

  if (!musicStarted) {
    musicTrackIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);
    audio.src = MUSIC_TRACKS[musicTrackIndex];
    musicStarted = true;
  }

  void audio.play().catch(() => {});
}

export function setMusicMuted(muted: boolean) {
  musicMuted = muted;
  const audio = musicAudio;
  if (!audio) return;

  if (muted) {
    audio.pause();
  } else {
    startMusic();
  }
}

export function isMusicMuted(): boolean {
  return musicMuted;
}

export function playHighScoreSound() {
  if (fxMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Ascending arpeggio of sine waves
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
  const duration = 0.15;
  
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now + i * duration);
    
    gainNode.gain.setValueAtTime(0, now + i * duration);
    gainNode.gain.linearRampToValueAtTime(0.3, now + i * duration + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * duration + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(now + i * duration);
    oscillator.stop(now + i * duration + duration + 0.05);
  });
}

export function playGameOverSound() {
  if (fxMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Descending sad tone
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, now);
  oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.8);
  
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(now);
  oscillator.stop(now + 1);
}

export function playTurnSound() {
  if (fxMuted) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, now);
  oscillator.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
  
  gainNode.gain.setValueAtTime(0.15, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(now);
  oscillator.stop(now + 0.15);
}
