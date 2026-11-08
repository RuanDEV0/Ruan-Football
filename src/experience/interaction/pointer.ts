import { Raycaster, Vector2, type Camera, type Object3D } from 'three';
import type { HotspotId } from '@/data/hotspots';
import { hotspotIdFromName } from './projection';

// Abaixo deste deslocamento o gesto é toque/clique; acima, ajuste da órbita limitada.
const DRAG_THRESHOLD_PX = 6;
const ORBIT_RAD_PER_PX = 0.005;

export interface PointerHandlers {
  readonly camera: Camera;
  readonly hitAreas: Object3D[];
  canOrbit(): boolean;
  orbitBy(deltaRad: number): void;
  hover(id: HotspotId | null): void;
  select(id: HotspotId): void;
}

/** Complementa os botões HTML (guia da cena, “Hotspots”); devolve a função que remove os listeners. */
export function bindPointer(canvas: HTMLCanvasElement, handlers: PointerHandlers): () => void {
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  let pointerId: number | null = null;
  let startX = 0;
  let lastX = 0;
  let isDragging = false;
  let hovered: HotspotId | null = null;

  const pick = (event: PointerEvent): HotspotId | null => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, handlers.camera);
    for (const hit of raycaster.intersectObjects(handlers.hitAreas, false)) {
      const id = hotspotIdFromName(hit.object.parent?.name ?? '');
      if (id) return id;
    }
    return null;
  };
  const setHover = (id: HotspotId | null): void => {
    if (id === hovered) return;
    hovered = id;
    canvas.style.cursor = id ? 'pointer' : '';
    handlers.hover(id);
  };
  const down = (event: PointerEvent): void => {
    if (!event.isPrimary) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    lastX = event.clientX;
    isDragging = false;
  };
  const move = (event: PointerEvent): void => {
    if (pointerId !== event.pointerId) {
      if (event.pointerType === 'mouse') setHover(pick(event));
      return;
    }
    if (Math.abs(event.clientX - startX) > DRAG_THRESHOLD_PX) isDragging = true;
    if (isDragging && handlers.canOrbit())
      handlers.orbitBy(-(event.clientX - lastX) * ORBIT_RAD_PER_PX);
    lastX = event.clientX;
  };
  const up = (event: PointerEvent): void => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    if (isDragging) return;
    const id = pick(event);
    if (id) handlers.select(id);
  };
  const cancel = (event: PointerEvent): void => {
    if (pointerId === event.pointerId) pointerId = null;
  };
  const leave = (): void => {
    setHover(null);
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('pointerleave', leave);
  return () => {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', cancel);
    canvas.removeEventListener('pointerleave', leave);
  };
}
