import { describe, expect, it, vi } from 'vitest';
import { DirectionalLight, HemisphereLight, Light, type Object3D } from 'three';
import { createAtmosphere, towerIgnition } from '@/experience/world/atmosphere';

function lights(root: Object3D): Light[] {
  const found: Light[] = [];
  root.traverse((object) => {
    if (object instanceof Light) found.push(object);
  });
  return found;
}

describe('night atmosphere', () => {
  it('turns the floodlight towers on one after another during the arrival', () => {
    expect([0, 1, 2, 3].map((tower) => towerIgnition(0, tower))).toEqual([0, 0, 0, 0]);
    expect([0, 1, 2, 3].map((tower) => towerIgnition(1, tower))).toEqual([1, 1, 1, 1]);
    const midway = [0, 1, 2, 3].map((tower) => towerIgnition(0.4, tower));
    expect(midway[0]).toBeGreaterThan(midway[3] ?? 1);
    for (let tower = 1; tower < 4; tower += 1)
      expect(midway[tower]).toBeLessThanOrEqual(midway[tower - 1] ?? 0);
  });

  it('respects the dynamic light budget of the scene guide', () => {
    const atmosphere = createAtmosphere();
    const found = lights(atmosphere.group);
    expect(found.filter((light) => light instanceof DirectionalLight)).toHaveLength(1);
    expect(found.filter((light) => light instanceof HemisphereLight)).toHaveLength(1);
    expect(found).toHaveLength(2);
    atmosphere.dispose();
  });

  it('brightens the key light with the ignition and keeps the night readable when dark', () => {
    const atmosphere = createAtmosphere();
    const key = lights(atmosphere.group).find((light) => light instanceof DirectionalLight);
    atmosphere.setIgnition(0);
    const dark = key?.intensity ?? 0;
    atmosphere.setIgnition(1);
    expect(key?.intensity ?? 0).toBeGreaterThan(dark);
    const hemisphere = lights(atmosphere.group).find((light) => light instanceof HemisphereLight);
    atmosphere.setIgnition(0);
    expect(hemisphere?.intensity ?? 0).toBeGreaterThan(0);
    atmosphere.dispose();
  });

  it('releases its geometries and materials once', () => {
    const atmosphere = createAtmosphere();
    const resources: { dispose: () => void }[] = [];
    atmosphere.group.traverse((object) => {
      if ('geometry' in object && object.geometry && typeof object.geometry === 'object')
        resources.push(object.geometry as { dispose: () => void });
      if ('material' in object && object.material && typeof object.material === 'object')
        resources.push(object.material as { dispose: () => void });
    });
    expect(resources.length).toBeGreaterThan(0);
    const spies = [...new Set(resources)].map((resource) => vi.spyOn(resource, 'dispose'));
    atmosphere.dispose();
    atmosphere.dispose();
    for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1);
  });
});
