// Informação dentro do campo (ADR 0007): placas de LED com nome, título e cidade e cartões acesos nas
// telas dos hotspots. Os textos vêm de src/data; a cena não declara rótulos próprios.
import {
  AdditiveBlending,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RingGeometry,
  type Texture,
} from 'three';
import { hotspots, type HotspotId } from '@/data/hotspots';
import { profile } from '@/data/profile';
import { SCREEN_PX_PER_M, landmarkPositions, screenPlacements, type Vec3 } from './layout';

export interface SignLine {
  readonly text: string;
  /** Altura da letra em fração da altura da placa. */
  readonly size: number;
  readonly color: string;
}
export interface SignSpec {
  readonly widthPx: number;
  readonly heightPx: number;
  readonly background: string;
  readonly lines: readonly SignLine[];
  /** Grade de pontos de painel de LED sobre o texto. */
  readonly ledGrid: boolean;
}
/** Desenha a placa numa textura; fora do navegador (testes), a placa fica só com a cor de fundo. */
export type SignPainter = (spec: SignSpec) => Texture | null;

export interface Board {
  readonly name: string;
  readonly center: Vec3;
  readonly rotationY: number;
  readonly widthM: number;
  readonly heightM: number;
  readonly lines: readonly SignLine[];
}

const LED_AMBER = '#ffb347';
const LED_WHITE = '#f2f2e9';
const LED_BACKGROUND = '#06100b';
// Placas de publicidade à beira do campo: baixas, logo à frente do alambrado, de frente para o gramado.
const BOARD_HEIGHT_M = 1.1;
const BOARD_Y_M = 0.75;
const BOARD_PX_PER_M = 96;
// Brilho dos cartões: aceso quando o ponto está em destaque, atenuado no restante do tempo.
const CARD_IDLE = 0.62;
const CARD_HIGHLIGHT = 1;
// Halo no chão sob cada ponto: sinal discreto de que o objeto é interativo, aceso no destaque.
const HALO_RADIUS_M = 2.2;
const HALO_Y_M = 0.05;
const HALO_IDLE = new Color(0xffb347).multiplyScalar(0.18);
const HALO_HIGHLIGHT = new Color(0xffb347).multiplyScalar(0.9);

export const boards = [
  {
    name: 'board-name',
    center: [-9.45, BOARD_Y_M, -9],
    rotationY: Math.PI / 2,
    widthM: 14,
    heightM: BOARD_HEIGHT_M,
    lines: [{ text: profile.name.toUpperCase(), size: 0.62, color: LED_AMBER }],
  },
  {
    name: 'board-title',
    center: [-9.45, BOARD_Y_M, 8],
    rotationY: Math.PI / 2,
    widthM: 16,
    heightM: BOARD_HEIGHT_M,
    lines: [{ text: profile.title.toUpperCase(), size: 0.36, color: LED_WHITE }],
  },
  {
    name: 'board-location',
    center: [6.6, BOARD_Y_M, -20.45],
    rotationY: 0,
    widthM: 5.6,
    heightM: BOARD_HEIGHT_M,
    lines: [{ text: profile.location.toUpperCase(), size: 0.46, color: LED_AMBER }],
  },
] as const satisfies readonly Board[];

export interface Signage {
  readonly group: Group;
  /** Acende o cartão do ponto destacado e atenua os demais; `null` volta todos ao repouso. */
  highlight(id: HotspotId | null): void;
  dispose(): void;
}

export function createSignage(painter: SignPainter | null): Signage {
  const group = new Group();
  group.name = 'signage';
  const plane = new PlaneGeometry(1, 1);
  const materials: MeshBasicMaterial[] = [];
  const textures: Texture[] = [];
  const paint = (spec: SignSpec): MeshBasicMaterial => {
    const map = painter?.(spec) ?? null;
    if (map) textures.push(map);
    const material = new MeshBasicMaterial({
      map,
      color: map ? 0xffffff : new Color(spec.background),
      toneMapped: false,
    });
    materials.push(material);
    return material;
  };
  const place = (
    mesh: Mesh,
    center: Vec3,
    rotationY: number,
    width: number,
    height: number,
  ): void => {
    mesh.position.set(...center);
    mesh.rotation.y = rotationY;
    mesh.scale.set(width, height, 1);
    group.add(mesh);
  };

  for (const board of boards) {
    const material = paint({
      widthPx: Math.round(board.widthM * BOARD_PX_PER_M),
      heightPx: Math.round(board.heightM * BOARD_PX_PER_M),
      background: LED_BACKGROUND,
      lines: board.lines,
      ledGrid: true,
    });
    const mesh = new Mesh(plane, material);
    mesh.name = board.name;
    place(mesh, board.center, board.rotationY, board.widthM, board.heightM);
  }

  const cards = new Map<HotspotId, MeshBasicMaterial>();
  for (const { id, label } of hotspots) {
    const { center, rotationY, widthM, heightM } = screenPlacements[id];
    const material = paint({
      widthPx: Math.round(widthM * SCREEN_PX_PER_M),
      heightPx: Math.round(heightM * SCREEN_PX_PER_M),
      background: LED_BACKGROUND,
      lines: [
        { text: label.toUpperCase(), size: label.length > 12 ? 0.16 : 0.24, color: LED_AMBER },
      ],
      ledGrid: true,
    });
    material.color.setScalar(CARD_IDLE);
    cards.set(id, material);
    const mesh = new Mesh(plane, material);
    mesh.name = `screen-card-${id}`;
    place(mesh, center, rotationY, widthM, heightM);
  }

  const ring = new RingGeometry(HALO_RADIUS_M * 0.82, HALO_RADIUS_M, 48);
  const haloMaterial = new MeshBasicMaterial({
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const halos = new InstancedMesh(ring, haloMaterial, hotspots.length);
  halos.name = 'hotspot-halos';
  const matrix = new Matrix4();
  const flat = new Matrix4().makeRotationX(-Math.PI / 2);
  hotspots.forEach(({ id }, index) => {
    const [x, , z] = landmarkPositions[id];
    halos.setMatrixAt(index, matrix.copy(flat).setPosition(x, HALO_Y_M, z));
    halos.setColorAt(index, HALO_IDLE);
  });
  group.add(halos);

  let isDisposed = false;
  return {
    group,
    highlight(id) {
      for (const [cardId, material] of cards)
        material.color.setScalar(cardId === id ? CARD_HIGHLIGHT : CARD_IDLE);
      hotspots.forEach((hotspot, index) => {
        halos.setColorAt(index, hotspot.id === id ? HALO_HIGHLIGHT : HALO_IDLE);
      });
      if (halos.instanceColor) halos.instanceColor.needsUpdate = true;
    },
    dispose() {
      if (isDisposed) return;
      isDisposed = true;
      plane.dispose();
      ring.dispose();
      haloMaterial.dispose();
      halos.dispose();
      for (const material of materials) material.dispose();
      for (const texture of textures) texture.dispose();
      group.clear();
    },
  };
}
