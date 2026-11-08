import type { Vec3, Viewpoint } from './viewpoints';

// Órbita limitada da decisão 12.2: o visitante ajusta o ângulo sem ver as bordas do cenário.
export const MAX_ORBIT_RAD = 0.35;

export function clampOrbit(azimuthRad: number): number {
  return Math.min(MAX_ORBIT_RAD, Math.max(-MAX_ORBIT_RAD, azimuthRad));
}

export function orbitPosition({ position, target }: Viewpoint, azimuthRad: number): Vec3 {
  const angle = clampOrbit(azimuthRad);
  if (angle === 0) return position;
  const dx = position[0] - target[0];
  const dz = position[2] - target[2];
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [target[0] + dx * cos - dz * sin, position[1], target[2] + dx * sin + dz * cos];
}
