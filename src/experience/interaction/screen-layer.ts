import { Vector3, type Camera } from 'three';
import type { HotspotId } from '@/data/hotspots';
import { SCREEN_PX_PER_M, screenPlacements } from '@/experience/world/layout';
import { ndcToScreen } from './projection';

export interface ScreenLayer {
  setSize(widthPx: number, heightPx: number): void;
  render(camera: Camera): void;
  dispose(): void;
}

// Reutilizados a cada quadro: nada de alocação no laço de renderização (guia da cena).
const along = new Vector3();
const point = new Vector3();

export interface ScreenRect {
  readonly centerX: number;
  readonly centerY: number;
  /** Escala do elemento, cuja largura de layout é `widthM × SCREEN_PX_PER_M`. */
  readonly scale: number;
}

/**
 * Retângulo da tela na viewport: centro projetado e escala pela largura projetada na altura do centro.
 * Só vale de frente para a tela, que é quando ela aparece (ADR 0007).
 */
export function projectScreen(
  id: HotspotId,
  camera: Camera,
  widthPx: number,
  heightPx: number,
): ScreenRect {
  const { center, rotationY, widthM } = screenPlacements[id];
  along.set(Math.cos(rotationY), 0, -Math.sin(rotationY)).multiplyScalar(widthM / 2);
  const middle = ndcToScreen(point.fromArray(center).project(camera), widthPx, heightPx);
  const left = ndcToScreen(point.fromArray(center).sub(along).project(camera), widthPx, heightPx);
  const right = ndcToScreen(point.fromArray(center).add(along).project(camera), widthPx, heightPx);
  const projectedWidth = Math.hypot(right.x - left.x, right.y - left.y);
  return {
    centerX: middle.x,
    centerY: middle.y,
    scale: projectedWidth / (widthM * SCREEN_PX_PER_M),
  };
}

export interface ScreenBounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

const up = new Vector3();

/**
 * Caixa em px que envolve a face da tela (e o cartão aceso no lugar dela) vista de qualquer ângulo;
 * `null` quando algum canto fica atrás da câmera.
 */
export function projectScreenBounds(
  id: HotspotId,
  camera: Camera,
  widthPx: number,
  heightPx: number,
): ScreenBounds | null {
  const { center, rotationY, widthM, heightM } = screenPlacements[id];
  along.set(Math.cos(rotationY), 0, -Math.sin(rotationY)).multiplyScalar(widthM / 2);
  up.set(0, heightM / 2, 0);
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const side of [-1, 1])
    for (const vertical of [-1, 1]) {
      point.fromArray(center).addScaledVector(along, side).addScaledVector(up, vertical);
      point.project(camera);
      if (point.z > 1) return null;
      const corner = ndcToScreen(point, widthPx, heightPx);
      left = Math.min(left, corner.x);
      right = Math.max(right, corner.x);
      top = Math.min(top, corner.y);
      bottom = Math.max(bottom, corner.y);
    }
  return { left, top, right, bottom };
}

/**
 * As telas pertencem à interface; a cena só define tamanho e `transform` 2D de cada uma. O CSS3DRenderer
 * foi descartado: no Chrome, nada dentro do contexto 3D dele recebia cliques (ADR 0007).
 */
export function createScreenLayer(screens: ReadonlyMap<HotspotId, HTMLElement>): ScreenLayer {
  const entries = [...screens].map(([id, element]) => {
    const { widthM, heightM } = screenPlacements[id];
    element.style.width = `${String(widthM * SCREEN_PX_PER_M)}px`;
    element.style.height = `${String(heightM * SCREEN_PX_PER_M)}px`;
    return { id, element, lastTransform: '' };
  });
  let width = 1;
  let height = 1;
  let isDisposed = false;
  return {
    setSize(widthPx, heightPx) {
      width = widthPx;
      height = heightPx;
    },
    render(camera) {
      // Também as ocultas: a interface revela a tela logo após o quadro síncrono do fim do movimento.
      for (const entry of entries) {
        const { centerX, centerY, scale } = projectScreen(entry.id, camera, width, height);
        const transform = `translate(${centerX.toFixed(1)}px, ${centerY.toFixed(1)}px) translate(-50%, -50%) scale(${scale.toFixed(4)})`;
        if (transform === entry.lastTransform) continue;
        entry.element.style.transform = transform;
        entry.lastTransform = transform;
      }
    },
    dispose() {
      if (isDisposed) return;
      isDisposed = true;
      for (const { element } of entries) {
        element.style.removeProperty('transform');
        element.style.removeProperty('width');
        element.style.removeProperty('height');
      }
    },
  };
}
