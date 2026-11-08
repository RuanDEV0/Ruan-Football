import { PerspectiveCamera } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { hotspots, type HotspotId } from '@/data/hotspots';
import { CAMERA_FOV_DEG, viewpointFor } from '@/experience/camera/viewpoints';
import { createHotspotLayer } from '@/experience/interaction/hotspot-layer';
import { projectScreenBounds } from '@/experience/interaction/screen-layer';

function fakeButtons(): Map<HotspotId, HTMLElement> {
  // A camada só registra ouvintes ao ser criada; EventTarget basta fora do navegador.
  return new Map(hotspots.map(({ id }) => [id, new EventTarget() as unknown as HTMLElement]));
}

describe('hotspot markers', () => {
  it('lights the object in the field while its marker has focus or the pointer', () => {
    const buttons = fakeButtons();
    const onHighlight = vi.fn<(id: HotspotId | null) => void>();
    const layer = createHotspotLayer(buttons, onHighlight);
    const [first, second] = hotspots;
    buttons.get(first.id)?.dispatchEvent(new Event('focus'));
    expect(onHighlight).toHaveBeenLastCalledWith(first.id);
    buttons.get(first.id)?.dispatchEvent(new Event('blur'));
    expect(onHighlight).toHaveBeenLastCalledWith(null);
    buttons.get(second.id)?.dispatchEvent(new Event('pointerenter'));
    expect(onHighlight).toHaveBeenLastCalledWith(second.id);
    buttons.get(second.id)?.dispatchEvent(new Event('pointerleave'));
    expect(onHighlight).toHaveBeenLastCalledWith(null);
    layer.dispose();
    onHighlight.mockClear();
    buttons.get(first.id)?.dispatchEvent(new Event('focus'));
    expect(onHighlight).not.toHaveBeenCalled();
  });
});

// Tamanho aproximado dos marcadores medido nas capturas: pictograma de 44 px e letreiro.
const MARKER_WIDTH_PX = 180;
const MARKER_HEIGHT_PX = 52;

interface FakeMarker {
  readonly element: HTMLElement;
  readonly style: { transform: string };
}

function fakeMarker(): FakeMarker {
  const target = new EventTarget();
  const style = { transform: '', setProperty: (): void => undefined };
  // A camada lê apenas tamanho, estilo e atributos; o restante do HTMLElement não é usado.
  const element = Object.assign(target, {
    offsetWidth: MARKER_WIDTH_PX,
    offsetHeight: MARKER_HEIGHT_PX,
    style,
    toggleAttribute: (): boolean => true,
  }) as unknown as HTMLElement;
  return { element, style };
}

describe('hotspot markers in the overview', () => {
  for (const [widthPx, heightPx] of [
    [1280, 900],
    [360, 800],
  ] as const) {
    it(`do not cover the lit screen cards at ${String(widthPx)} × ${String(heightPx)}`, () => {
      const markers = new Map(hotspots.map(({ id }) => [id, fakeMarker()]));
      const layer = createHotspotLayer(
        new Map([...markers].map(([id, { element }]) => [id, element])),
        () => undefined,
      );
      const aspect = widthPx / heightPx;
      const { position, target } = viewpointFor('overview', aspect);
      const camera = new PerspectiveCamera(CAMERA_FOV_DEG, aspect, 0.1, 200);
      camera.position.set(...position);
      camera.lookAt(...target);
      camera.updateMatrixWorld();
      layer.update(camera, widthPx, heightPx, false);
      for (const [markerId, { style }] of markers) {
        const match = /translate\((-?\d+)px, (-?\d+)px\)/.exec(style.transform);
        expect(match, markerId).not.toBeNull();
        const left = Number(match?.[1]);
        const top = Number(match?.[2]);
        for (const { id: cardId } of hotspots) {
          const card = projectScreenBounds(cardId, camera, widthPx, heightPx);
          if (!card) continue;
          const covers =
            left < card.right &&
            card.left < left + MARKER_WIDTH_PX &&
            top < card.bottom &&
            card.top < top + MARKER_HEIGHT_PX;
          expect(covers, `${markerId} cobre o cartão ${cardId}`).toBe(false);
        }
      }
      layer.dispose();
    });
  }
});
