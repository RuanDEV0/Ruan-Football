import { Group } from 'three';
import type { Kit } from './kit';
import type { Vec3 } from './layout';
import { boxNetSegments } from './nets';

export function createEntrance({ materials, lineMaterials, addBox, addLines }: Kit): Group {
  const entrance = new Group();
  const area = (name: string, position: Vec3): Group => {
    const group = new Group();
    group.name = name;
    group.position.set(...position);
    entrance.add(group);
    return group;
  };
  const kiosk = area('kiosk', [-8, 0, 27]);
  addBox(kiosk, materials.wall, [5, 3, 4], [0, 1.5, 0]);
  addBox(kiosk, materials.roof, [5.6, 0.22, 4.6], [0, 3.1, 0]);
  addBox(kiosk, materials.dark, [3, 1.3, 0.08], [-0.4, 1.8, -2.05]).name = 'kiosk-window';
  addBox(kiosk, materials.line, [3.3, 0.12, 0.6], [-0.4, 1.12, -2.2]);
  addBox(kiosk, materials.red, [3.8, 0.15, 1.4], [-0.4, 2.7, -2.5]);
  for (const x of [-2.2, 1.4]) addBox(kiosk, materials.metal, [0.08, 2.6, 0.08], [x, 1.3, -3.15]);
  // Painel sem texto: o quiosque é genérico e não exibe marcas de terceiros.
  addBox(kiosk, materials.line, [2.4, 0.5, 0.06], [-0.4, 3.5, -2.1]);
  addBox(kiosk, materials.dark, [0.08, 2.2, 1], [2.55, 1.1, 0.5]).name = 'kiosk-door';
  for (const x of [-1.6, 0.8]) {
    addBox(kiosk, materials.metal, [0.08, 0.7, 0.08], [x, 0.35, -2.9]);
    addBox(kiosk, materials.red, [0.4, 0.08, 0.4], [x, 0.74, -2.9]);
  }
  for (let i = 0; i < 6; i += 1)
    addBox(
      kiosk,
      i < 3 ? materials.blue : materials.yellow,
      [0.15, 0.32, 0.15],
      [-1.4 + i * 0.4, 1.34, -2.2],
    );
  for (const [name, x] of [
    ['storage', -2.5],
    ['restroom', 1],
  ] as const) {
    const room = area(name, [x, 0, 27]);
    addBox(room, materials.wall, [3, 2.8, 4], [0, 1.4, 0]);
    addBox(room, materials.roof, [3.3, 0.2, 4.4], [0, 2.9, 0]);
    addBox(room, materials.dark, [1, 2.1, 0.08], [0, 1.05, -2.05]).name = `${name}-door`;
    addBox(room, materials.line, [0.1, 0.1, 0.1], [0.32, 1, -2.13]);
    addBox(room, materials.line, [0.6, 0.6, 0.04], [0, 2.45, -2.04]);
  }
  const chairs = area('chairs', [-9, 0, 23]);
  for (let i = 0; i < 4; i += 1) {
    const x = i * 1.3;
    addBox(chairs, materials.line, [0.65, 0.1, 0.65], [x, 0.55, 0]);
    addBox(chairs, materials.line, [0.65, 0.65, 0.1], [x, 0.9, 0.3]);
    for (const dx of [-0.25, 0.25])
      for (const z of [-0.25, 0.25])
        addBox(chairs, materials.line, [0.07, 0.55, 0.07], [x + dx, 0.275, z]);
  }
  const path = area('entrance-path', [5, 0, 31]);
  addBox(path, materials.wall, [3, 0.04, 19], [0, 0.02, 0]);
  const soap = area('soap-football', [11, 0, 35]);
  addBox(soap, materials.blue, [7, 0.3, 9], [0, 0.25, 0]);
  for (const x of [-3.4, 3.4]) addBox(soap, materials.yellow, [0.5, 0.8, 9], [x, 0.6, 0]);
  for (const z of [-4.4, 4.4]) {
    addBox(soap, materials.yellow, [7, 0.8, 0.5], [0, 0.6, z]);
    for (const x of [-1.2, 1.2]) addBox(soap, materials.red, [0.3, 1.8, 0.3], [x, 1.3, z]);
    addBox(soap, materials.red, [2.7, 0.3, 0.3], [0, 2.2, z]);
  }
  const trampoline = area('trampoline', [10, 0, 24]);
  addBox(trampoline, materials.blue, [3.2, 0.25, 3.2], [0, 0.85, 0]);
  addBox(trampoline, materials.dark, [2.7, 0.08, 2.7], [0, 1, 0]);
  for (const x of [-1.4, 1.4])
    for (const z of [-1.4, 1.4]) {
      addBox(trampoline, materials.yellow, [0.1, 2.8, 0.1], [x, 1.4, z]);
    }
  for (const x of [-1.4, 1.4]) addBox(trampoline, materials.blue, [0.08, 0.08, 2.8], [x, 2.8, 0]);
  for (const z of [-1.4, 1.4]) addBox(trampoline, materials.blue, [2.8, 0.08, 0.08], [0, 2.8, z]);
  const net = addLines(
    trampoline,
    'trampoline-net',
    boxNetSegments({
      width: 2.8,
      height: 1.75,
      depth: 2.8,
      spacingM: 0.25,
      faces: ['back', 'front', 'left', 'right'],
    }),
    lineMaterials.net,
  );
  net.position.set(0, 1.05, 1.4);
  return entrance;
}
