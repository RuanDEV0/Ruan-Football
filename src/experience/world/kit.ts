import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  Float32BufferAttribute,
  type Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RingGeometry,
  SphereGeometry,
} from 'three';
import { BALL_RADIUS_M, type Vec3 } from './layout';

type MaterialName =
  | 'turf'
  | 'line'
  | 'metal'
  | 'dark'
  | 'red'
  | 'wall'
  | 'roof'
  | 'blue'
  | 'yellow'
  | 'ground'
  | 'lamp';

export interface Kit {
  readonly geometries: {
    readonly box: BoxGeometry;
    readonly capsule: CapsuleGeometry;
    readonly sphere: SphereGeometry;
    readonly ring: RingGeometry;
    readonly disc: CircleGeometry;
  };
  readonly materials: Readonly<Record<MaterialName, MeshStandardMaterial>>;
  readonly lineMaterials: { readonly net: LineBasicMaterial; readonly fence: LineBasicMaterial };
  readonly addBox: (
    parent: Group,
    material: MeshStandardMaterial,
    size: Vec3,
    position: Vec3,
  ) => Mesh;
  /** Área de clique simplificada (guia da cena, “Hotspots”): invisível e fora das chamadas de desenho. */
  readonly addHitArea: (parent: Group, size: Vec3, position: Vec3) => Mesh;
  readonly addLines: (
    parent: Group,
    name: string,
    positions: Float32Array,
    material: LineBasicMaterial,
  ) => LineSegments;
  readonly dispose: () => void;
}

export function createKit(): Kit {
  const box = new BoxGeometry(1, 1, 1);
  const geometries = {
    box,
    capsule: new CapsuleGeometry(0.35, 1, 4, 8),
    sphere: new SphereGeometry(BALL_RADIUS_M, 12, 8),
    ring: new RingGeometry(2.9, 3, 40),
    disc: new CircleGeometry(0.14, 12),
  };
  const standard = (color: number, extra: { emissive?: number } = {}): MeshStandardMaterial =>
    new MeshStandardMaterial({ color, roughness: 1, ...extra });
  const materials = {
    turf: standard(0x174b2a),
    line: standard(0xf2f2e9),
    metal: new MeshStandardMaterial({ color: 0x60756a, roughness: 0.8 }),
    dark: standard(0x182923),
    red: standard(0xb44540),
    wall: standard(0xb9b0a0),
    roof: standard(0x784f3b),
    blue: standard(0x276eaa),
    yellow: standard(0xd5ae38),
    ground: standard(0x263b32),
    lamp: standard(0xfff6e4, { emissive: 0xfff1dc }),
  } satisfies Record<MaterialName, MeshStandardMaterial>;
  const lineMaterials = {
    net: new LineBasicMaterial({ color: 0xf2f2e9, transparent: true, opacity: 0.55 }),
    fence: new LineBasicMaterial({ color: 0x9fb0a6, transparent: true, opacity: 0.32 }),
  };
  const hitMaterial = new MeshBasicMaterial();
  const lineGeometries: BufferGeometry[] = [];
  let isDisposed = false;

  return {
    geometries,
    materials,
    lineMaterials,
    addBox: (parent, material, size, position) => {
      const mesh = new Mesh(box, material);
      mesh.scale.set(...size);
      mesh.position.set(...position);
      parent.add(mesh);
      return mesh;
    },
    addHitArea: (parent, size, position) => {
      const mesh = new Mesh(box, hitMaterial);
      mesh.name = 'hit-area';
      mesh.visible = false;
      mesh.scale.set(...size);
      mesh.position.set(...position);
      parent.add(mesh);
      return mesh;
    },
    addLines: (parent, name, positions, material) => {
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      lineGeometries.push(geometry);
      const lines = new LineSegments(geometry, material);
      lines.name = name;
      parent.add(lines);
      return lines;
    },
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      for (const geometry of [...Object.values(geometries), ...lineGeometries]) geometry.dispose();
      for (const material of [...Object.values(materials), ...Object.values(lineMaterials)])
        material.dispose();
      hitMaterial.dispose();
    },
  };
}
