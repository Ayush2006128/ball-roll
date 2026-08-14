const STORAGE_KEY = 'ballroll_highscore';

export function getHighScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function setHighScore(score: number): boolean {
  if (typeof window === 'undefined') return false;
  const current = getHighScore();
  if (score > current) {
    try {
      localStorage.setItem(STORAGE_KEY, score.toString());
    } catch {
      // Storage full or blocked
    }
    return true;
  }
  return false;
}
