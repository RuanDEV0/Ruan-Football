import { describe, expect, it } from 'vitest';
import { hotspots } from '@/data/hotspots';
import { MAX_ORBIT_RAD, clampOrbit, orbitPosition } from '@/experience/camera/orbit';
import { PerspectiveCamera, Vector3 } from 'three';
import { CAMERA_FOV_DEG, layoutFor, viewpointFor, type Vec3 } from '@/experience/camera/viewpoints';
import { projectScreen } from '@/experience/interaction/screen-layer';
import { SCREEN_PX_PER_M, landmarkPositions, screenPlacements } from '@/experience/world/layout';

const WIDE = 16 / 9;
const NARROW = 9 / 16;
// O texto das telas é proporcional à largura delas (4cqi): 320 px renderizados dão fonte de ~13 px.
const MIN_SCREEN_WIDTH_PX = 320;

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

describe('guided viewpoints', () => {
  it('switches to the narrow composition below square aspect ratios', () => {
    expect(layoutFor(WIDE)).toBe('wide');
    expect(layoutFor(1)).toBe('wide');
    expect(layoutFor(NARROW)).toBe('narrow');
  });

  it('keeps the overview framing approved by Ruan', () => {
    expect(viewpointFor('overview', WIDE)).toEqual({ position: [30, 22, 49], target: [0, 0, 16] });
    expect(viewpointFor('overview', NARROW)).toEqual({
      position: [2, 28, 84],
      target: [2, 0, 16],
    });
  });

  it('frames each hotspot screen whole, facing the camera and large enough to read', () => {
    for (const { id } of hotspots) {
      const screen = screenPlacements[id];
      for (const [aspect, viewportWidthPx] of [
        [WIDE, 1280],
        [1280 / 900, 1280],
        [NARROW, 360],
        [360 / 800, 360],
      ] as const) {
        const { position, target } = viewpointFor(id, aspect);
        const camera = new PerspectiveCamera(CAMERA_FOV_DEG, aspect, 0.1, 200);
        camera.position.set(...position);
        camera.lookAt(...target);
        camera.updateMatrixWorld();
        const normal = new Vector3(Math.sin(screen.rotationY), 0, Math.cos(screen.rotationY));
        const toCamera = new Vector3(...position).sub(new Vector3(...screen.center)).normalize();
        expect(normal.dot(toCamera), `${id} de frente`).toBeGreaterThan(Math.cos(Math.PI / 6));
        const xs: number[] = [];
        for (const [u, v] of [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ] as const) {
          const corner = new Vector3(
            screen.center[0] + normal.z * u * (screen.widthM / 2),
            screen.center[1] + v * (screen.heightM / 2),
            screen.center[2] - normal.x * u * (screen.widthM / 2),
          ).project(camera);
          expect(Math.abs(corner.x), `${id} canto x`).toBeLessThan(0.98);
          expect(Math.abs(corner.y), `${id} canto y`).toBeLessThan(0.98);
          expect(corner.z, `${id} à frente da câmera`).toBeLessThan(1);
          xs.push(corner.x);
        }
        const renderedWidthPx = ((Math.max(...xs) - Math.min(...xs)) / 2) * viewportWidthPx;
        expect(renderedWidthPx, `${id} legível em ${String(aspect)}`).toBeGreaterThanOrEqual(
          MIN_SCREEN_WIDTH_PX,
        );
      }
      const landmark = landmarkPositions[id];
      expect(distance([screen.center[0], 0, screen.center[2]], landmark), id).toBeLessThan(3);
    }
  });

  it('starts the arrival away from the overview so the visitor sees movement', () => {
    for (const aspect of [WIDE, NARROW]) {
      const start = viewpointFor('arrival', aspect);
      expect(distance(start.position, viewpointFor('overview', aspect).position)).toBeGreaterThan(
        10,
      );
    }
  });
});

describe('limited orbit', () => {
  const view = { position: [10, 6, 10], target: [0, 1, 0] } as const;

  it('clamps the azimuth offset to the allowed range', () => {
    expect(clampOrbit(10)).toBe(MAX_ORBIT_RAD);
    expect(clampOrbit(-10)).toBe(-MAX_ORBIT_RAD);
    expect(clampOrbit(0.1)).toBeCloseTo(0.1);
  });

  it('rotates around the target keeping height and distance', () => {
    expect(orbitPosition(view, 0)).toEqual(view.position);
    const rotated = orbitPosition(view, 0.3);
    expect(rotated[1]).toBeCloseTo(view.position[1]);
    expect(distance(rotated, view.target)).toBeCloseTo(distance(view.position, view.target));
    expect(rotated[0]).not.toBeCloseTo(view.position[0]);
  });

  it('never rotates beyond the limit even when asked to', () => {
    expect(orbitPosition(view, 5)).toEqual(orbitPosition(view, MAX_ORBIT_RAD));
  });
});

describe('screens placed over the field', () => {
  it('centers the focused screen and scales it to the framing of its viewpoint', () => {
    for (const { id } of hotspots) {
      for (const [widthPx, heightPx] of [
        [1280, 900],
        [360, 800],
      ] as const) {
        const aspect = widthPx / heightPx;
        const { position, target } = viewpointFor(id, aspect);
        const camera = new PerspectiveCamera(CAMERA_FOV_DEG, aspect, 0.1, 200);
        camera.position.set(...position);
        camera.lookAt(...target);
        camera.updateMatrixWorld();
        const rect = projectScreen(id, camera, widthPx, heightPx);
        expect(Math.abs(rect.centerX - widthPx / 2), `${id} centro x`).toBeLessThan(2);
        expect(Math.abs(rect.centerY - heightPx / 2), `${id} centro y`).toBeLessThan(2);
        const screen = screenPlacements[id];
        const renderedWidth = rect.scale * screen.widthM * SCREEN_PX_PER_M;
        const renderedHeight = rect.scale * screen.heightM * SCREEN_PX_PER_M;
        expect(renderedWidth, `${id} cabe na largura`).toBeLessThanOrEqual(widthPx);
        expect(renderedHeight, `${id} cabe na altura`).toBeLessThanOrEqual(heightPx);
        expect(renderedWidth, `${id} legível`).toBeGreaterThanOrEqual(MIN_SCREEN_WIDTH_PX);
      }
    }
  });
});
