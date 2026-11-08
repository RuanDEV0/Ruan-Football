import { describe, expect, it } from 'vitest';
import {
  FPS_WINDOW_MS,
  createFpsWindow,
  type FpsWindow,
  lowerQuality,
  pixelRatioFor,
  shouldDowngrade,
} from '@/experience/core/quality';

function feed(window: FpsWindow, frameMs: number, totalMs: number): number | null {
  let result: number | null = null;
  for (let elapsed = 0; elapsed < totalMs; elapsed += frameMs) {
    result = window.add(frameMs) ?? result;
  }
  return result;
}

describe('quality profiles', () => {
  it('caps the pixel ratio by profile without exceeding the device', () => {
    expect(pixelRatioFor('high', 3)).toBe(2);
    expect(pixelRatioFor('medium', 3)).toBe(1.5);
    expect(pixelRatioFor('low', 3)).toBe(1);
    expect(pixelRatioFor('high', 1)).toBe(1);
    expect(pixelRatioFor('medium', 0)).toBe(1);
  });

  it('only steps down, one level at a time', () => {
    expect(lowerQuality('high')).toBe('medium');
    expect(lowerQuality('medium')).toBe('low');
    expect(lowerQuality('low')).toBeNull();
  });

  it('drops quality one level after sustained low fps', () => {
    expect(shouldDowngrade('medium', 22)).toBe(true);
    expect(shouldDowngrade('medium', 50)).toBe(false);
    expect(shouldDowngrade('high', 38)).toBe(true);
    expect(shouldDowngrade('low', 5)).toBe(false);
  });
});

describe('fps window', () => {
  it('reports the average only after a full window of animated frames', () => {
    const window = createFpsWindow();
    expect(window.add(16)).toBeNull();
    expect(feed(createFpsWindow(), 16, FPS_WINDOW_MS)).toBeCloseTo(62.5, 0);
    expect(feed(createFpsWindow(), 40, FPS_WINDOW_MS)).toBeCloseTo(25, 0);
  });

  it('discards the window when rendering stops, so idle time is not counted as slowness', () => {
    const window = createFpsWindow();
    feed(window, 40, FPS_WINDOW_MS - 200);
    expect(window.add(5000)).toBeNull();
    expect(feed(window, 16, FPS_WINDOW_MS - 400)).toBeNull();
  });
});
