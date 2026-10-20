import type { DictationLevel } from './chat.types';

const SECONDS_PER_MINUTE = 60;
const BYTE_MIDPOINT = 128;
const LEVEL_GAIN = 4;

export function createEmptyLevels(slots: number): DictationLevel[] {
  return Array.from({ length: slots }, () => null);
}

export function pushDictationLevel(levels: DictationLevel[], level: number): DictationLevel[] {
  if (levels.length === 0) return levels;
  const clamped = Math.min(Math.max(level, 0), 1);
  return [...levels.slice(1), clamped];
}

export function computeAudioLevel(samples: ArrayLike<number>): number {
  if (samples.length === 0) return 0;
  let sumOfSquares = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const centered = (samples[index] - BYTE_MIDPOINT) / BYTE_MIDPOINT;
    sumOfSquares += centered * centered;
  }
  const rms = Math.sqrt(sumOfSquares / samples.length);
  return Math.min(rms * LEVEL_GAIN, 1);
}

export function formatDictationTime(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
