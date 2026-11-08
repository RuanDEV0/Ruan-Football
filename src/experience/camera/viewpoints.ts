import type { HotspotId } from '@/data/hotspots';
import { screenPlacements, type ScreenPlacement, type Vec3 } from '@/experience/world/layout';

export type { Vec3 } from '@/experience/world/layout';
export interface Viewpoint {
  readonly position: Vec3;
  readonly target: Vec3;
}
export type ViewId = HotspotId | 'overview' | 'arrival' | 'kick';
export type Layout = 'wide' | 'narrow';

export const CAMERA_FOV_DEG = 50;
// Fração da viewport ocupada pela tela focada: no celular, o máximo legível; no computador, sobra
// contexto do campo em volta.
const SCREEN_FILL = { wide: 0.55, narrow: 0.9 } as const satisfies Record<Layout, number>;
const CAMERA_LIFT_M = 0.4;
// Proporções guardadas com esta precisão: o resultado é reutilizado a cada quadro das transições.
const ASPECT_CACHE_DECIMALS = 3;

// A vista geral foi aprovada por Ruan (ADR 0004); a chegada é hipótese da Etapa 2.
const fixedViewpoints = {
  overview: {
    wide: { position: [30, 22, 49], target: [0, 0, 16] },
    narrow: { position: [2, 28, 84], target: [2, 0, 16] },
  },
  arrival: {
    wide: { position: [14, 4, 64], target: [5, 1.5, 30] },
    narrow: { position: [5, 5, 62], target: [3, 1, 24] },
  },
  // Atrás da bola chutada na chegada, de frente para o gol de “Pênalti” (ADR 0008).
  kick: {
    wide: { position: [-3, 3.2, -3], target: [0.3, 1.1, -20] },
    narrow: { position: [-1.5, 3.8, 1], target: [0.3, 1.1, -20] },
  },
} as const satisfies Record<'overview' | 'arrival' | 'kick', Record<Layout, Viewpoint>>;

/** De frente para a tela, à distância em que ela ocupa `SCREEN_FILL` da viewport com essa proporção. */
export function screenViewpoint(screen: ScreenPlacement, aspect: number): Viewpoint {
  const tanHalfFov = Math.tan(((CAMERA_FOV_DEG / 2) * Math.PI) / 180);
  const fill = SCREEN_FILL[layoutFor(aspect)];
  const distance = Math.max(
    screen.widthM / (fill * 2 * tanHalfFov * aspect),
    screen.heightM / (fill * 2 * tanHalfFov),
  );
  const [x, y, z] = screen.center;
  return {
    position: [
      x + Math.sin(screen.rotationY) * distance,
      y + CAMERA_LIFT_M,
      z + Math.cos(screen.rotationY) * distance,
    ],
    target: screen.center,
  };
}

const screenViewpointCache = new Map<string, Viewpoint>();

export function layoutFor(aspect: number): Layout {
  return aspect < 1 ? 'narrow' : 'wide';
}

export function viewpointFor(id: ViewId, aspect: number): Viewpoint {
  const layout = layoutFor(aspect);
  if (id === 'overview' || id === 'arrival' || id === 'kick') return fixedViewpoints[id][layout];
  const key = `${id}:${aspect.toFixed(ASPECT_CACHE_DECIMALS)}`;
  const cached = screenViewpointCache.get(key);
  if (cached) return cached;
  const viewpoint = screenViewpoint(screenPlacements[id], aspect);
  screenViewpointCache.set(key, viewpoint);
  return viewpoint;
}
