import { freshState, normalizeState } from './logic.js';

export const STORAGE_KEY = 'sgsz-planner-v1';
const CORRUPT_KEY = 'sgsz-planner-corrupt';

export function loadState(storage = localStorage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return freshState();
  try {
    const parsed = JSON.parse(raw);
    const result = normalizeState(parsed);
    if (!result.ok) {
      storage.setItem(CORRUPT_KEY, raw);
      return freshState();
    }
    return result.state;
  } catch {
    storage.setItem(CORRUPT_KEY, raw);
    return freshState();
  }
}

export function saveState(state, storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}
