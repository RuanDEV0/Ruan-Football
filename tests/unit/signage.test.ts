import {
  Box3,
  Color,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Texture,
  Vector3,
} from 'three';
import { describe, expect, it, vi } from 'vitest';
import { hotspots } from '@/data/hotspots';
import { profile } from '@/data/profile';
import { landmarkPositions, screenPlacements } from '@/experience/world/layout';
import { boards, createSignage, type SignSpec } from '@/experience/world/signage';
import { createField } from '@/experience/world/field';

function painted(): { specs: SignSpec[]; painter: (spec: SignSpec) => Texture } {
  const specs: SignSpec[] = [];
  return {
    specs,
    painter: (spec) => {
      specs.push(spec);
      return new Texture();
    },
  };
}

describe('information inside the field', () => {
  it('shows the name, title and city on LED boards, straight from the profile', () => {
    const { specs, painter } = painted();
    const signage = createSignage(painter);
    const texts = specs.flatMap(({ lines }) => lines.map(({ text }) => text));
    for (const value of [profile.name, profile.title, profile.location])
      expect(texts).toContain(value.toUpperCase());
    for (const { label } of hotspots) expect(texts).toContain(label.toUpperCase());
    signage.dispose();
  });

  it('keeps the boards inside the fence, facing the pitch, away from the hotspot screens', () => {
    const field = createField();
    field.group.updateMatrixWorld(true);
    for (const board of boards) {
      const normal = new Vector3(Math.sin(board.rotationY), 0, Math.cos(board.rotationY));
      const toCenter = new Vector3(-board.center[0], 0, -board.center[2]).normalize();
      expect(normal.dot(toCenter), `${board.name} de frente para o campo`).toBeGreaterThan(0.3);
      expect(Math.abs(board.center[0]), board.name).toBeLessThan(10);
      expect(Math.abs(board.center[2]), board.name).toBeLessThan(21);
      const half = board.widthM / 2;
      const along = new Vector3(normal.z, 0, -normal.x);
      const boardBox = new Box3().setFromPoints([
        new Vector3(...board.center).addScaledVector(along, half).setY(0),
        new Vector3(...board.center).addScaledVector(along, -half).setY(board.heightM + 0.2),
      ]);
      for (const { object } of hotspots) {
        const hitArea = field.group.getObjectByName(object)?.getObjectByName('hit-area');
        if (hitArea)
          expect(
            new Box3().setFromObject(hitArea, true).intersectsBox(boardBox),
            `${board.name} × ${object}`,
          ).toBe(false);
      }
    }
    field.dispose();
  });

  it('lights a card on each hotspot screen and brightens only the highlighted one', () => {
    const signage = createSignage(painted().painter);
    const brightness = (id: string): number => {
      const card = signage.group.getObjectByName(`screen-card-${id}`);
      expect(card, id).toBeInstanceOf(Mesh);
      const material: unknown = card instanceof Mesh ? card.material : null;
      return material instanceof MeshBasicMaterial ? material.color.r : NaN;
    };
    for (const { id } of hotspots) {
      const card = signage.group.getObjectByName(`screen-card-${id}`);
      expect(card?.position.toArray(), id).toEqual([...screenPlacements[id].center]);
    }
    const [first, second] = hotspots;
    const idle = brightness(first.id);
    signage.highlight(first.id);
    expect(brightness(first.id)).toBeGreaterThan(idle);
    expect(brightness(second.id)).toBe(idle);
    signage.highlight(null);
    expect(brightness(first.id)).toBe(idle);
    signage.dispose();
  });

  it('marks every hotspot with a halo on the ground that glows when highlighted', () => {
    const signage = createSignage(null);
    const halos = signage.group.getObjectByName('hotspot-halos');
    expect(halos).toBeInstanceOf(InstancedMesh);
    if (!(halos instanceof InstancedMesh)) return;
    expect(halos.count).toBe(hotspots.length);
    const color = new Color();
    const matrix = new Matrix4();
    const position = new Vector3();
    hotspots.forEach(({ id }, index) => {
      halos.getMatrixAt(index, matrix);
      position.setFromMatrixPosition(matrix);
      expect(position.x, id).toBeCloseTo(landmarkPositions[id][0]);
      expect(position.z, id).toBeCloseTo(landmarkPositions[id][2]);
    });
    halos.getColorAt(0, color);
    const idle = color.r;
    signage.highlight(hotspots[0].id);
    halos.getColorAt(0, color);
    expect(color.r).toBeGreaterThan(idle);
    halos.getColorAt(1, color);
    expect(color.r).toBe(idle);
    signage.dispose();
  });

  it('works without a painter outside the browser and releases textures once', () => {
    const bare = createSignage(null);
    expect(bare.group.children.length).toBe(boards.length + hotspots.length + 1);
    bare.dispose();
    const textures: Texture[] = [];
    const signage = createSignage(() => {
      const texture = new Texture();
      textures.push(texture);
      return texture;
    });
    const spies = textures.map((texture) => vi.spyOn(texture, 'dispose'));
    signage.dispose();
    signage.dispose();
    for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1);
  });
});
