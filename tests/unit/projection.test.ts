import { describe, expect, it } from 'vitest';
import { hotspots } from '@/data/hotspots';
import { hotspotIdFromName, ndcToScreen } from '@/experience/interaction/projection';

describe('hotspot button projection', () => {
  it('maps normalized device coordinates to container pixels', () => {
    expect(ndcToScreen({ x: 0, y: 0, z: 0.5 }, 800, 600)).toEqual({
      x: 400,
      y: 300,
      isVisible: true,
    });
    expect(ndcToScreen({ x: -1, y: 1, z: 0.5 }, 800, 600)).toMatchObject({ x: 0, y: 0 });
    expect(ndcToScreen({ x: 1, y: -1, z: 0.5 }, 800, 600)).toMatchObject({ x: 800, y: 600 });
  });

  it('hides points behind the camera or outside the screen', () => {
    expect(ndcToScreen({ x: 0, y: 0, z: 1.2 }, 800, 600).isVisible).toBe(false);
    expect(ndcToScreen({ x: 1.3, y: 0, z: 0.5 }, 800, 600).isVisible).toBe(false);
    expect(ndcToScreen({ x: 0, y: -1.1, z: 0.5 }, 800, 600).isVisible).toBe(false);
  });

  it('identifies hotspots by the shared object names only', () => {
    for (const { id, object } of hotspots) expect(hotspotIdFromName(object)).toBe(id);
    expect(hotspotIdFromName('kiosk')).toBeNull();
    expect(hotspotIdFromName('')).toBeNull();
  });
});
