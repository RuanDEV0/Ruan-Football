import { describe, expect, it } from 'vitest';
import {
  ANCHOR_CLEARANCE_PX,
  placeLabels,
  type LabelInput,
  type PlacedLabel,
} from '@/experience/interaction/label-layout';

const bounds = { width: 800, height: 600 };
const WIDTH = 120;
const HEIGHT = 44;
const label = (x: number, y: number): LabelInput => ({
  x,
  y,
  width: WIDTH,
  height: HEIGHT,
  isVisible: true,
});

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}
const rect = ({ left, top }: PlacedLabel): Rect => ({ left, top, width: WIDTH, height: HEIGHT });
function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.left < b.left + b.width &&
    b.left < a.left + a.width &&
    a.top < b.top + b.height &&
    b.top < a.top + a.height
  );
}
function leaderEnd(item: PlacedLabel): [number, number] {
  const angle = (item.leaderAngleDeg * Math.PI) / 180;
  return [
    item.left + item.leaderStartX - Math.sin(angle) * item.leaderPx,
    item.top + item.leaderStartY + Math.cos(angle) * item.leaderPx,
  ];
}

describe('hotspot label layout', () => {
  it('keeps a lone label centered right above its anchor with no leader', () => {
    const [placed] = placeLabels([label(400, 300)], bounds);
    expect(placed).toMatchObject({ left: 340, top: 256, leaderPx: 0 });
  });

  it('separates crowded labels and points each leader at its own anchor', () => {
    const inputs = [label(400, 300), label(430, 290), label(380, 280), label(410, 250)];
    const placed = placeLabels(inputs, bounds);
    placed.forEach((a, i) => {
      for (const b of placed.slice(i + 1)) expect(overlaps(rect(a), rect(b))).toBe(false);
    });
    placed.forEach((item, index) => {
      const input = inputs[index];
      if (!input) return;
      const [x, y] = leaderEnd(item);
      expect(x).toBeCloseTo(input.x, 3);
      expect(y).toBeCloseTo(input.y, 3);
    });
    expect(placed.some(({ leaderPx }) => leaderPx > 0)).toBe(true);
  });

  it('never covers the anchor of another label', () => {
    const inputs = [label(400, 300), label(420, 330)];
    const placed = placeLabels(inputs, bounds);
    placed.forEach((item, index) => {
      inputs.forEach((other, otherIndex) => {
        if (otherIndex === index) return;
        const box = rect(item);
        const covers =
          other.x > box.left - ANCHOR_CLEARANCE_PX &&
          other.x < box.left + box.width + ANCHOR_CLEARANCE_PX &&
          other.y > box.top - ANCHOR_CLEARANCE_PX &&
          other.y < box.top + box.height + ANCHOR_CLEARANCE_PX;
        expect(covers, `${String(index)} cobre ${String(otherIndex)}`).toBe(false);
      });
    });
  });

  it('avoids leaders crossing other labels when a diagonal placement is free', () => {
    const narrow = { width: 312, height: 576 };
    const inputs = [
      { x: 222, y: 230, width: 175, height: 50, isVisible: true },
      { x: 171, y: 245, width: 122, height: 44, isVisible: true },
      { x: 145, y: 205, width: 94, height: 44, isVisible: true },
      { x: 108, y: 185, width: 88, height: 44, isVisible: true },
    ];
    const placed = placeLabels(inputs, narrow);
    placed.forEach((item, index) => {
      const input = inputs[index];
      if (!input) return;
      const [endX, endY] = leaderEnd(item);
      const startX = item.left + item.leaderStartX;
      const startY = item.top + item.leaderStartY;
      placed.forEach((other, otherIndex) => {
        const box = inputs[otherIndex];
        if (otherIndex === index || !box) return;
        for (let t = 0.02; t < 1; t += 0.02) {
          const x = startX + (endX - startX) * t;
          const y = startY + (endY - startY) * t;
          const inside =
            x > other.left &&
            x < other.left + box.width &&
            y > other.top &&
            y < other.top + box.height;
          expect(inside, `linha ${String(index)} cruza rótulo ${String(otherIndex)}`).toBe(false);
        }
      });
    });
  });

  it('never moves a label below its own anchor, so it does not hide its object', () => {
    const inputs = [label(400, 300), label(420, 200), label(380, 190)];
    placeLabels(inputs, bounds).forEach((item, index) => {
      const input = inputs[index];
      if (input) expect(item.top + HEIGHT, String(index)).toBeLessThanOrEqual(input.y);
    });
  });

  it('prefers the smallest displacement, moving sideways when it is shorter', () => {
    const [, moved] = placeLabels([label(400, 300), label(500, 300)], bounds);
    expect(moved?.top).toBe(256);
    expect(moved?.left).toBeGreaterThan(400);
  });

  it('keeps labels inside the scene horizontally and below the top edge', () => {
    const [left, right, top] = placeLabels(
      [label(10, 300), label(795, 300), label(400, 20)],
      bounds,
    );
    expect(left?.left).toBe(0);
    expect(right?.left).toBe(800 - WIDTH);
    expect(top?.top).toBeGreaterThanOrEqual(0);
  });

  it('ignores hidden labels when resolving collisions', () => {
    const [, visible] = placeLabels(
      [{ ...label(400, 300), isVisible: false }, label(400, 300)],
      bounds,
    );
    expect(visible).toMatchObject({ left: 340, top: 256, leaderPx: 0 });
  });

  it('keeps labels off obstacles such as the lit screen cards', () => {
    const card = { left: 320, top: 230, right: 480, bottom: 290 };
    const [placed] = placeLabels([label(400, 300)], bounds, [card]);
    expect(placed).toBeDefined();
    if (!placed) return;
    const box = rect(placed);
    expect(
      overlaps(box, {
        left: card.left,
        top: card.top,
        width: card.right - card.left,
        height: card.bottom - card.top,
      }),
    ).toBe(false);
    expect(box.top).toBeLessThanOrEqual(256);
  });
});
