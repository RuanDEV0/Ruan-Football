import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CAMERA_FOV_DEG, viewpointFor, type Vec3 } from '@/experience/camera/viewpoints';
import { kickBallAt } from '@/experience/world/kick';
import {
  BALL_RADIUS_M,
  FENCE_HEIGHT_M,
  FENCE_Z_M,
  GOAL_DEPTH_M,
  GOAL_HEIGHT_M,
  GOAL_WIDTH_M,
  landmarkPositions,
  screenPlacements,
} from '@/experience/world/layout';

const SAMPLES = 2000;
const path = Array.from({ length: SAMPLES + 1 }, (_, index) => kickBallAt(index / SAMPLES));
const [goalX, , goalLineZ] = landmarkPositions.goal;

function cameraFor(view: 'arrival' | 'kick', aspect: number): PerspectiveCamera {
  const { position, target } = viewpointFor(view, aspect);
  const camera = new PerspectiveCamera(CAMERA_FOV_DEG, aspect, 0.1, 200);
  camera.position.set(...position);
  camera.lookAt(...target);
  camera.updateMatrixWorld();
  return camera;
}

function isInView(point: Vec3, camera: PerspectiveCamera): boolean {
  const ndc = new Vector3(...point).project(camera);
  return ndc.z < 1 && Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1;
}

describe('arrival kick into the goal', () => {
  it('starts in front of the arrival camera, as the ball kicked from the loading screen', () => {
    for (const aspect of [16 / 9, 1280 / 900, 360 / 800]) {
      expect(isInView(kickBallAt(0), cameraFor('arrival', aspect)), String(aspect)).toBe(true);
    }
  });

  it('clears the fence by the entrance', () => {
    const nearFence = path.filter(([, , z]) => Math.abs(z - FENCE_Z_M) < 0.5);
    expect(nearFence.length).toBeGreaterThan(0);
    for (const [, y] of nearFence) expect(y).toBeGreaterThan(FENCE_HEIGHT_M + BALL_RADIUS_M);
  });

  it('crosses the far goal line between the posts and under the crossbar', () => {
    const index = path.findIndex(([, , z]) => z <= goalLineZ);
    const crossing = path[index];
    expect(crossing).toBeDefined();
    if (!crossing) return;
    const [x, y] = crossing;
    expect(Math.abs(x - goalX)).toBeLessThan(GOAL_WIDTH_M / 2 - BALL_RADIUS_M);
    expect(y).toBeLessThan(GOAL_HEIGHT_M - BALL_RADIUS_M);
    for (const [, , z] of path.slice(index))
      expect(z).toBeGreaterThanOrEqual(goalLineZ - GOAL_DEPTH_M + BALL_RADIUS_M - 1e-9);
  });

  it('comes to rest on the ground inside the net', () => {
    const [x, y, z] = kickBallAt(1);
    expect(y).toBeCloseTo(BALL_RADIUS_M, 6);
    expect(z).toBeLessThan(goalLineZ);
    expect(z).toBeGreaterThanOrEqual(goalLineZ - GOAL_DEPTH_M + BALL_RADIUS_M);
    expect(Math.abs(x - goalX)).toBeLessThan(GOAL_WIDTH_M / 2);
    expect(kickBallAt(7)).toEqual(kickBallAt(1));
    expect(kickBallAt(-1)).toEqual(kickBallAt(0));
  });

  it('frames the whole far goal while the camera chases the ball', () => {
    const half = GOAL_WIDTH_M / 2;
    const corners: Vec3[] = [
      [goalX - half, 0, goalLineZ],
      [goalX + half, 0, goalLineZ],
      [goalX - half, GOAL_HEIGHT_M, goalLineZ],
      [goalX + half, GOAL_HEIGHT_M, goalLineZ],
    ];
    for (const aspect of [16 / 9, 1280 / 900, 360 / 800]) {
      const camera = cameraFor('kick', aspect);
      for (const corner of corners)
        expect(isInView(corner, camera), `${String(aspect)} ${corner.join(',')}`).toBe(true);
      expect(isInView(kickBallAt(1), camera)).toBe(true);
    }
  });

  it('chases the ball without grazing the character or the screens on the way', () => {
    // A câmera interpola a posição em linha reta entre os pontos de vista (camera/rig.ts).
    const MIN_CLEARANCE_M = 3;
    const obstacles: Vec3[] = [
      landmarkPositions.character,
      ...Object.values(screenPlacements).map(({ center }) => center),
    ];
    for (const aspect of [16 / 9, 1280 / 900, 360 / 800]) {
      const from = viewpointFor('arrival', aspect).position;
      const to = viewpointFor('kick', aspect).position;
      for (let step = 0; step <= 100; step += 1) {
        const t = step / 100;
        const x = from[0] + (to[0] - from[0]) * t;
        const z = from[2] + (to[2] - from[2]) * t;
        for (const [ox, , oz] of obstacles)
          expect(Math.hypot(x - ox, z - oz), `${String(aspect)} t=${String(t)}`).toBeGreaterThan(
            MIN_CLEARANCE_M,
          );
      }
    }
  });
});
