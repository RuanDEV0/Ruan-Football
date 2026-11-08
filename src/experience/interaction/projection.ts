import { hotspots, type HotspotId } from '@/data/hotspots';

export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
  readonly isVisible: boolean;
}

export function ndcToScreen(
  ndc: { readonly x: number; readonly y: number; readonly z: number },
  widthPx: number,
  heightPx: number,
): ScreenPoint {
  const isVisible = ndc.z >= -1 && ndc.z <= 1 && Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1;
  return { x: ((ndc.x + 1) / 2) * widthPx, y: ((1 - ndc.y) / 2) * heightPx, isVisible };
}

export function hotspotIdFromName(name: string): HotspotId | null {
  return hotspots.find(({ object }) => object === name)?.id ?? null;
}
