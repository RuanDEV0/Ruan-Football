// Posições dos marcos interativos, compartilhadas pela montagem do campo, pelos pontos de vista e
// pela projeção dos botões. Escala provisória da Etapa 2, em metros; não é um campo real.
import type { HotspotId } from '@/data/hotspots';

export type Vec3 = readonly [number, number, number];

export const FIELD_WIDTH_M = 18;
export const FIELD_LENGTH_M = 40;
export const PENALTY_SPOT_DISTANCE_M = 6;
export const FENCE_X_M = 10;
export const FENCE_Z_M = 21;
export const FLOODLIGHT_HEIGHT_M = 9;
export const FENCE_HEIGHT_M = 3;
export const GOAL_WIDTH_M = 5;
export const GOAL_HEIGHT_M = 2.5;
export const GOAL_DEPTH_M = 1;
export const BALL_RADIUS_M = 0.22;
// Torres fora dos cantos do alambrado; o refletor fica voltado para o campo.
const FLOODLIGHT_OFFSET_M = [0.8, 0.6] as const;
export const floodlightTowers = (
  [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ] as const
).map(
  ([sx, sz]) =>
    [
      sx * (FENCE_X_M + FLOODLIGHT_OFFSET_M[0]),
      0,
      sz * (FENCE_Z_M + FLOODLIGHT_OFFSET_M[1]),
    ] as const,
);
// Cabeça do refletor, deslocada da torre para dentro do campo: origem dos halos e feixes.
export const floodlightLamps = floodlightTowers.map(
  ([x, , z]) => [x - Math.sign(x), FLOODLIGHT_HEIGHT_M - 0.1, z] as const satisfies Vec3,
);

export const landmarkPositions = {
  scoreboard: [-6, 0, -21],
  bench: [11, 0, 2],
  character: [4, 0, 5],
  goal: [0, 0, -19.7],
} as const satisfies Record<HotspotId, Vec3>;

// Ponto logo acima de cada objeto, onde a linha-guia do botão termina.
export const hotspotAnchors = {
  scoreboard: [-6, 5.55, -21],
  bench: [11, 2.6, 2],
  character: [4, 1.95, 5],
  goal: [0, 2.75, -19.7],
} as const satisfies Record<HotspotId, Vec3>;

// Resolução das telas HTML e dos cartões que as substituem em repouso: 1 m equivale a 200 px (ADR 0006).
export const SCREEN_PX_PER_M = 200;

export interface ScreenPlacement {
  /** Centro da face da tela, em metros. */
  readonly center: Vec3;
  /** Rotação em Y; com 0, a tela olha para +z. */
  readonly rotationY: number;
  readonly widthM: number;
  readonly heightM: number;
}

// Telas do ADR 0006: telão do placar, quadro tático junto ao banco, placa ao lado do personagem e
// telão acima do gol, sobre o alambrado. Cada uma tem um suporte físico em landmarks.ts.
export const screenPlacements = {
  scoreboard: { center: [-6, 4.1, -20.83], rotationY: 0, widthM: 4, heightM: 2.2 },
  bench: { center: [9.55, 1.7, 2], rotationY: -Math.PI / 2, widthM: 2.6, heightM: 2.1 },
  character: { center: [5.7, 2.05, 4.2], rotationY: 0.45, widthM: 2.6, heightM: 3.1 },
  goal: { center: [0, 4.25, -20.88], rotationY: 0, widthM: 4, heightM: 2.3 },
} as const satisfies Record<HotspotId, ScreenPlacement>;
