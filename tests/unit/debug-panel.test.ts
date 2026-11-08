import { expect, it } from 'vitest';
import { formatDebugStats } from '@/experience/debug/format';

it('summarizes the measurement for reading on a physical device', () => {
  expect(
    formatDebugStats({
      averageFps: 41.26,
      profile: 'medium',
      pixelRatio: 1.5,
      drawCalls: 53,
      triangles: 3068,
    }),
  ).toBe('FPS médio 41,3 · perfil médio · pixelRatio 1,5 · 53 chamadas · 3.068 triângulos');
  expect(
    formatDebugStats({
      averageFps: null,
      profile: 'high',
      pixelRatio: 2,
      drawCalls: 0,
      triangles: 0,
    }),
  ).toContain('FPS médio medindo…');
});
