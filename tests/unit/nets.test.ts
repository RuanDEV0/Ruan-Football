import { describe, expect, it } from 'vitest';
import { boxNetSegments, panelSegments } from '@/experience/world/nets';

function points(values: Float32Array): [number, number, number][] {
  const result: [number, number, number][] = [];
  for (let i = 0; i < values.length; i += 3)
    result.push([values[i] ?? NaN, values[i + 1] ?? NaN, values[i + 2] ?? NaN]);
  return result;
}

describe('net geometry', () => {
  const size = { width: 5, height: 2.5, depth: 1, spacingM: 0.25 };

  it('produces line segment pairs inside the requested box', () => {
    const segments = boxNetSegments({ ...size, faces: ['back', 'top', 'left', 'right'] });
    expect(segments.length % 6).toBe(0);
    for (const [x, y, z] of points(segments)) {
      expect(Math.abs(x)).toBeLessThanOrEqual(2.5 + 1e-6);
      expect(y).toBeGreaterThanOrEqual(-1e-6);
      expect(y).toBeLessThanOrEqual(2.5 + 1e-6);
      expect(z).toBeLessThanOrEqual(1e-6);
      expect(z).toBeGreaterThanOrEqual(-1 - 1e-6);
    }
  });

  it('covers only the requested faces', () => {
    const back = points(boxNetSegments({ ...size, faces: ['back'] }));
    expect(back.every(([, , z]) => Math.abs(z + 1) < 1e-6)).toBe(true);
    const sides = points(boxNetSegments({ ...size, faces: ['left', 'right'] }));
    expect(sides.every(([x]) => Math.abs(Math.abs(x) - 2.5) < 1e-6)).toBe(true);
  });

  it('spaces the mesh as requested and stays light', () => {
    const back = boxNetSegments({ ...size, faces: ['back'] });
    const expectedLines = 5 / 0.25 + 1 + (2.5 / 0.25 + 1);
    expect(back.length / 6).toBe(expectedLines);
    const full = boxNetSegments({ ...size, faces: ['back', 'top', 'left', 'right', 'front'] });
    expect(full.length / 6).toBeLessThan(500);
  });

  it('rejects spacing that would create an unbounded mesh', () => {
    expect(() => boxNetSegments({ ...size, spacingM: 0, faces: ['back'] })).toThrow();
  });
});

describe('fence panels', () => {
  it('builds a vertical grid between two ground points', () => {
    const panel = points(panelSegments([-10, -21], [-10, 21], 3, 0.5));
    expect(panel.every(([x]) => Math.abs(x + 10) < 1e-6)).toBe(true);
    const zs = panel.map(([, , z]) => z);
    expect(Math.min(...zs)).toBeCloseTo(-21);
    expect(Math.max(...zs)).toBeCloseTo(21);
    expect(Math.max(...panel.map(([, y]) => y))).toBeCloseTo(3);
    expect(panel.length / 2).toBe(42 / 0.5 + 1 + (3 / 0.5 + 1));
  });
});
