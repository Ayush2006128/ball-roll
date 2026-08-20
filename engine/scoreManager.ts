const STORAGE_KEY = 'ballroll_highscore';

export function getHighScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;
    const parsed = parseInt(stored, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
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
