import { Vector3, type Camera } from 'three';
import { hotspots, type HotspotId } from '@/data/hotspots';
import { hotspotAnchors } from '@/experience/world/layout';
import { placeLabels, type Box, type LabelInput } from './label-layout';
import { ndcToScreen } from './projection';
import { projectScreenBounds } from './screen-layer';

export interface HotspotLayer {
  /** Durante transições de câmera os botões ficam ocultos e o layout não é recalculado. */
  update(camera: Camera, widthPx: number, heightPx: number, isMoving: boolean): void;
  dispose(): void;
}

/**
 * Os botões pertencem à interface; a cena só altera `transform`, `data-offscreen`, `data-moving` e
 * as variáveis `--leader*` da linha-guia.
 */
export function createHotspotLayer(
  buttons: ReadonlyMap<HotspotId, HTMLElement>,
  onHighlight: (id: HotspotId | null) => void,
): HotspotLayer {
  // Foco e ponteiro sobre o botão acendem o objeto no campo (ADR 0007).
  const unbind = [...buttons].flatMap(([id, element]) => {
    const on = (): void => {
      onHighlight(id);
    };
    const off = (): void => {
      onHighlight(null);
    };
    const pairs = [
      ['focus', on],
      ['pointerenter', on],
      ['blur', off],
      ['pointerleave', off],
    ] as const;
    for (const [type, listener] of pairs) element.addEventListener(type, listener);
    return pairs.map(([type, listener]) => () => {
      element.removeEventListener(type, listener);
    });
  });
  const entries = [...buttons].map(([id, element]) => ({
    element,
    anchor: new Vector3(...hotspotAnchors[id]),
    width: 0,
    height: 0,
    lastTransform: '',
    lastLeader: '',
    wasVisible: true,
  }));
  let wasMoving = false;
  const projected = new Vector3();
  let measuredFor = '';
  const measure = (key: string): void => {
    if (key === measuredFor && entries.every(({ width }) => width > 0)) return;
    measuredFor = key;
    for (const entry of entries) {
      entry.width = entry.element.offsetWidth;
      entry.height = entry.element.offsetHeight;
    }
  };
  return {
    update(camera, widthPx, heightPx, isMoving) {
      if (isMoving !== wasMoving) {
        for (const { element } of entries) element.toggleAttribute('data-moving', isMoving);
        wasMoving = isMoving;
      }
      if (isMoving) return;
      measure(`${String(widthPx)}x${String(heightPx)}`);
      const inputs: LabelInput[] = entries.map(({ anchor, width, height }) => {
        const point = ndcToScreen(projected.copy(anchor).project(camera), widthPx, heightPx);
        return { x: point.x, y: point.y, width, height, isVisible: point.isVisible };
      });
      const cards = hotspots
        .map(({ id }) => projectScreenBounds(id, camera, widthPx, heightPx))
        .filter((card): card is Box => card !== null);
      const placed = placeLabels(inputs, { width: widthPx, height: heightPx }, cards);
      entries.forEach((entry, index) => {
        const label = placed[index];
        const input = inputs[index];
        if (!label || !input) return;
        const transform = `translate(${String(Math.round(label.left))}px, ${String(Math.round(label.top))}px)`;
        if (transform !== entry.lastTransform) {
          entry.element.style.transform = transform;
          entry.lastTransform = transform;
        }
        const leader = [
          label.leaderPx,
          label.leaderStartX,
          label.leaderStartY,
          label.leaderAngleDeg,
        ]
          .map((value) => String(Math.round(value)))
          .join('|');
        if (leader !== entry.lastLeader) {
          const { style } = entry.element;
          style.setProperty('--leader', `${String(Math.round(label.leaderPx))}px`);
          style.setProperty('--leader-x', `${String(Math.round(label.leaderStartX))}px`);
          style.setProperty('--leader-y', `${String(Math.round(label.leaderStartY))}px`);
          style.setProperty('--leader-angle', `${String(Math.round(label.leaderAngleDeg))}deg`);
          entry.lastLeader = leader;
        }
        if (input.isVisible !== entry.wasVisible) {
          entry.element.toggleAttribute('data-offscreen', !input.isVisible);
          entry.wasVisible = input.isVisible;
        }
      });
    },
    dispose() {
      for (const remove of unbind) remove();
    },
  };
}
