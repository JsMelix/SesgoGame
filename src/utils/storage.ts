import { PlayerProgress } from '../types/game';

const STORAGE_KEY = 'criterio_16bit_progress_v1';

export const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  completedChapters: [],
  fieldwork: {},
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
        typeof parsed.unlockedLevel === 'number' && Number.isInteger(parsed.unlockedLevel) && parsed.unlockedLevel >= 1 && parsed.unlockedLevel <= 5
          ? parsed.unlockedLevel
          : 1,
      completedChapters: Array.isArray(parsed.completedChapters)
        ? [...new Set(parsed.completedChapters.filter((id) => Number.isInteger(id) && id >= 1 && id <= 5))]
        : [],
      fieldwork: Object.fromEntries(
        Object.entries(parsed.fieldwork ?? {}).flatMap(([id, entry]) => {
          if (!/^[1-5]$/.test(id) || !entry || !Array.isArray(entry.sources)) return [];
          const sources = [...new Set(entry.sources.filter((source) => source === 'A' || source === 'B'))];
          return [[id, { sources, applied: sources.length === 2 && entry.applied === true }]];
        }),
      ),
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
  return { ...DEFAULT_PROGRESS, scenarios: {}, fieldwork: {} };
}
