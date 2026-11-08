export interface LabelInput {
  /** Âncora projetada, em px do container. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly isVisible: boolean;
}
export interface PlacedLabel {
  readonly left: number;
  readonly top: number;
  /** Linha-guia: começa em (leaderStartX, leaderStartY) dentro do rótulo e termina na âncora. */
  readonly leaderPx: number;
  readonly leaderStartX: number;
  readonly leaderStartY: number;
  /** Rotação CSS, em graus, de uma linha que aponta para baixo. */
  readonly leaderAngleDeg: number;
}

/** Raio em volta de cada âncora que nenhum outro rótulo pode cobrir. */
export const ANCHOR_CLEARANCE_PX = 10;
const GAP_PX = 6;
const CROSSING_PENALTY = 10_000;

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}
interface Segment {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

function intersects(a: Box, b: Box): boolean {
  return (
    a.left < b.right + GAP_PX &&
    b.left < a.right + GAP_PX &&
    a.top < b.bottom + GAP_PX &&
    b.top < a.bottom + GAP_PX
  );
}

function crosses({ x1, y1, x2, y2 }: Segment, box: Box): boolean {
  let start = 0;
  let end = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const edges: [number, number][] = [
    [-dx, x1 - box.left],
    [dx, box.right - x1],
    [-dy, y1 - box.top],
    [dy, box.bottom - y1],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) start = Math.max(start, t);
    else end = Math.min(end, t);
    if (start > end) return false;
  }
  return end - start > 1e-6;
}

function leaderFor(input: LabelInput, left: number, top: number): Segment {
  const x1 = Math.min(Math.max(input.x, left), left + input.width);
  const y1 = Math.min(Math.max(input.y, top), top + input.height);
  return { x1, y1, x2: input.x, y2: input.y };
}

interface Anchor {
  readonly owner: number;
  readonly isVisible: boolean;
  readonly box: Box;
}
interface Position {
  readonly left: number;
  readonly top: number;
}
// Com até 5 rótulos, testar todas as ordens custa no máximo 120 passadas e evita o ótimo local.
const MAX_PERMUTED_LABELS = 5;

function permutations(values: readonly number[]): number[][] {
  if (values.length <= 1) return [[...values]];
  return values.flatMap((value, index) =>
    permutations([...values.slice(0, index), ...values.slice(index + 1)]).map((rest) => [
      value,
      ...rest,
    ]),
  );
}

function placeInOrder(
  inputs: readonly LabelInput[],
  bounds: { readonly width: number },
  anchors: readonly Anchor[],
  obstacles: readonly Box[],
  naturals: readonly Position[],
  order: readonly number[],
): { positions: Position[]; cost: number } {
  const positions = [...naturals];
  const placedBoxes: Box[] = [];
  const placedLeaders: Segment[] = [];
  let total = 0;
  for (const index of order) {
    const input = inputs[index];
    const natural = naturals[index];
    if (!input || !natural) continue;
    const clampLeft = (left: number): number =>
      Math.min(Math.max(left, 0), Math.max(bounds.width - input.width, 0));
    const boxAt = (left: number, top: number): Box => ({
      left,
      top,
      right: left + input.width,
      bottom: top + input.height,
    });
    const blockers = [
      ...obstacles,
      ...placedBoxes,
      ...anchors.filter((a) => a.isVisible && a.owner !== index).map((a) => a.box),
    ];
    const lefts = [natural.left];
    const tops = [natural.top];
    for (const blocker of blockers) {
      lefts.push(clampLeft(blocker.left - GAP_PX - input.width), clampLeft(blocker.right + GAP_PX));
      tops.push(blocker.top - GAP_PX - input.height);
    }
    let best: Position | null = null;
    let bestCost = Infinity;
    for (const left of lefts)
      for (const top of tops) {
        if (top < 0 || top > natural.top) continue;
        const box = boxAt(left, top);
        if (blockers.some((blocker) => intersects(box, blocker))) continue;
        const leader = leaderFor(input, left, top);
        const isCrossing =
          placedBoxes.some((placed) => crosses(leader, placed)) ||
          placedLeaders.some((placed) => crosses(placed, box));
        const cost =
          Math.hypot(left - natural.left, top - natural.top) + (isCrossing ? CROSSING_PENALTY : 0);
        if (cost < bestCost) {
          best = { left, top };
          bestCost = cost;
        }
      }
    if (!best) {
      let top = natural.top;
      for (
        let blocker = blockers.find((b) => intersects(boxAt(natural.left, top), b));
        blocker && top > 0;
        blocker = blockers.find((b) => intersects(boxAt(natural.left, top), b))
      )
        top = Math.max(blocker.top - GAP_PX - input.height, 0);
      best = { left: natural.left, top };
      bestCost = CROSSING_PENALTY * 10;
    }
    total += bestCost;
    positions[index] = best;
    placedBoxes.push(boxAt(best.left, best.top));
    placedLeaders.push(leaderFor(input, best.left, best.top));
  }
  return { positions, cost: total };
}

/**
 * Rótulos acima das âncoras. Em colisão, escolhe a combinação com menor deslocamento total, sem
 * cobrir âncoras alheias nem `obstacles` (os cartões das telas, ADR 0007) e evitando que linhas-guia
 * cruzem outros rótulos.
 */
export function placeLabels(
  inputs: readonly LabelInput[],
  bounds: { readonly width: number; readonly height: number },
  obstacles: readonly Box[] = [],
): PlacedLabel[] {
  const anchors: Anchor[] = inputs.map(({ x, y, isVisible }, owner) => ({
    owner,
    isVisible,
    box: {
      left: x - ANCHOR_CLEARANCE_PX,
      right: x + ANCHOR_CLEARANCE_PX,
      top: y - ANCHOR_CLEARANCE_PX,
      bottom: y + ANCHOR_CLEARANCE_PX,
    },
  }));
  const naturals: Position[] = inputs.map(({ x, y, width, height }) => ({
    left: Math.min(Math.max(x - width / 2, 0), Math.max(bounds.width - width, 0)),
    top: Math.max(y - height, 0),
  }));
  const lowestFirst = inputs
    .map((input, index) => ({ input, index }))
    .filter(({ input }) => input.isVisible)
    .sort((a, b) => b.input.y - a.input.y)
    .map(({ index }) => index);
  const orders =
    lowestFirst.length <= MAX_PERMUTED_LABELS ? permutations(lowestFirst) : [lowestFirst];
  let best = placeInOrder(inputs, bounds, anchors, obstacles, naturals, lowestFirst);
  for (const order of orders) {
    const attempt = placeInOrder(inputs, bounds, anchors, obstacles, naturals, order);
    if (attempt.cost < best.cost) best = attempt;
  }

  return inputs.map((input, index) => {
    const { left, top } = best.positions[index] ?? { left: 0, top: 0 };
    const { x1, y1, x2, y2 } = leaderFor(input, left, top);
    const length = Math.hypot(x2 - x1, y2 - y1);
    return {
      left,
      top,
      leaderPx: length < 1 ? 0 : length,
      leaderStartX: x1 - left,
      leaderStartY: y1 - top,
      leaderAngleDeg: (Math.atan2(-(x2 - x1), y2 - y1) * 180) / Math.PI,
    };
  });
}
