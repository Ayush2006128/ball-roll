let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playHighScoreSound() {
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
