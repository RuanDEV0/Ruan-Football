export type NetFace = 'back' | 'top' | 'left' | 'right' | 'front';
export interface NetBox {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly spacingM: number;
  readonly faces: readonly NetFace[];
}
type Point = readonly [number, number, number];

function addGrid(
  values: number[],
  spacingM: number,
  origin: Point,
  u: Point,
  v: Point,
  uLength: number,
  vLength: number,
): void {
  if (!(spacingM > 0)) throw new RangeError('O espaçamento da rede precisa ser positivo.');
  const at = (a: number, b: number): Point => [
    origin[0] + u[0] * a + v[0] * b,
    origin[1] + u[1] * a + v[1] * b,
    origin[2] + u[2] * a + v[2] * b,
  ];
  const steps = (length: number): number[] => {
    const count = Math.max(1, Math.round(length / spacingM));
    return Array.from({ length: count + 1 }, (_, i) => (i / count) * length);
  };
  for (const a of steps(uLength)) values.push(...at(a, 0), ...at(a, vLength));
  for (const b of steps(vLength)) values.push(...at(0, b), ...at(uLength, b));
}

/** Pares de pontos para LineSegments; caixa com boca em z = 0, fundo em z = -depth e base em y = 0. */
export function boxNetSegments({ width, height, depth, spacingM, faces }: NetBox): Float32Array {
  const values: number[] = [];
  const half = width / 2;
  const grid = (origin: Point, u: Point, v: Point, uLength: number, vLength: number): void => {
    addGrid(values, spacingM, origin, u, v, uLength, vLength);
  };
  for (const face of faces) {
    if (face === 'back') grid([-half, 0, -depth], [1, 0, 0], [0, 1, 0], width, height);
    if (face === 'front') grid([-half, 0, 0], [1, 0, 0], [0, 1, 0], width, height);
    if (face === 'top') grid([-half, height, -depth], [1, 0, 0], [0, 0, 1], width, depth);
    if (face === 'left') grid([-half, 0, -depth], [0, 0, 1], [0, 1, 0], depth, height);
    if (face === 'right') grid([half, 0, -depth], [0, 0, 1], [0, 1, 0], depth, height);
  }
  return new Float32Array(values);
}

/** Grade vertical do chão até `heightM`, entre dois pontos [x, z]. */
export function panelSegments(
  from: readonly [number, number],
  to: readonly [number, number],
  heightM: number,
  spacingM: number,
): Float32Array {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  const values: number[] = [];
  addGrid(
    values,
    spacingM,
    [from[0], 0, from[1]],
    [dx / length, 0, dz / length],
    [0, 1, 0],
    length,
    heightM,
  );
  return new Float32Array(values);
}
