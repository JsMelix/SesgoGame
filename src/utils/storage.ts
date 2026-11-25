import { PlayerProgress } from '../types/game';

const STORAGE_KEY = 'criterio_16bit_progress_v1';

export const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  scenarios: {},
  soundMuted: false,
};

export function loadProgress(): PlayerProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      unlockedLevel:
        typeof parsed.unlockedLevel === 'number' && parsed.unlockedLevel >= 1 && parsed.unlockedLevel <= 5
          ? parsed.unlockedLevel
          : 1,
      scenarios: parsed.scenarios && typeof parsed.scenarios === 'object' ? parsed.scenarios : {},
      soundMuted: Boolean(parsed.soundMuted),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function clearProgress(): PlayerProgress {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return { ...DEFAULT_PROGRESS, scenarios: {} };
}
