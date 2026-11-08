import { Group, InstancedMesh, Matrix4, Mesh } from 'three';
import { createEntrance } from './entrance';
import { instanceBlocks } from './instance-blocks';
import { createKit } from './kit';
import { kickBallAt } from './kick';
import { buildGoalFrame, createLandmarks } from './landmarks';
import {
  BALL_RADIUS_M,
  FENCE_HEIGHT_M,
  FENCE_X_M,
  FENCE_Z_M,
  FIELD_LENGTH_M,
  FIELD_WIDTH_M,
  FLOODLIGHT_HEIGHT_M,
  PENALTY_SPOT_DISTANCE_M,
  floodlightTowers,
} from './layout';
import { panelSegments } from './nets';

// Abertura do alambrado alinhada ao caminho de entrada (ADR 0004).
const FENCE_GATE_X_M = [4, 6] as const;
const DIORAMA_DEPTH_M = 2.4;

export function createField(): { group: Group; dispose: () => void } {
  const kit = createKit();
  const { materials, geometries, lineMaterials, addBox, addLines } = kit;
  const group = new Group();
  const halfWidth = FIELD_WIDTH_M / 2;
  const halfLength = FIELD_LENGTH_M / 2;

  // Base espessa do diorama: o campo flutua sobre o fundo noturno (ADR 0007).
  addBox(group, materials.ground, [32, DIORAMA_DEPTH_M, 64], [0, -0.15 - DIORAMA_DEPTH_M / 2, 10]);
  const pitch = addBox(group, materials.turf, [FIELD_WIDTH_M, 0.2, FIELD_LENGTH_M], [0, -0.1, 0]);
  pitch.name = 'pitch';
  pitch.receiveShadow = true;
  for (const x of [-halfWidth, halfWidth])
    addBox(group, materials.line, [0.1, 0.02, FIELD_LENGTH_M], [x, 0.02, 0]);
  for (const z of [-halfLength, 0, halfLength])
    addBox(group, materials.line, [FIELD_WIDTH_M, 0.02, 0.1], [0, 0.02, z]);
  for (const end of [-1, 1]) {
    addBox(group, materials.line, [8, 0.02, 0.1], [0, 0.02, end * 16]);
    for (const x of [-4, 4]) addBox(group, materials.line, [0.1, 0.02, 4], [x, 0.02, end * 18]);
    const spot = new Mesh(geometries.disc, materials.line);
    spot.name = 'penalty-spot';
    spot.rotation.x = -Math.PI / 2;
    spot.position.set(0, 0.031, end * (halfLength - PENALTY_SPOT_DISTANCE_M));
    group.add(spot);
  }
  const centerCircle = new Mesh(geometries.ring, materials.line);
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.y = 0.03;
  group.add(centerCircle);
  const centerSpot = new Mesh(geometries.disc, materials.line);
  centerSpot.rotation.x = -Math.PI / 2;
  centerSpot.position.y = 0.031;
  group.add(centerSpot);

  const fence = new Group();
  fence.name = 'fence';
  group.add(fence);
  const posts: [number, number][] = [];
  for (let z = -FENCE_Z_M; z <= FENCE_Z_M; z += 3)
    for (const x of [-FENCE_X_M, FENCE_X_M]) posts.push([x, z]);
  for (let x = -8; x <= 8; x += 4) for (const z of [-FENCE_Z_M, FENCE_Z_M]) posts.push([x, z]);
  const postMesh = new InstancedMesh(geometries.box, materials.metal, posts.length);
  const matrix = new Matrix4();
  posts.forEach(([x, z], index) => {
    matrix.makeScale(0.09, FENCE_HEIGHT_M, 0.09).setPosition(x, FENCE_HEIGHT_M / 2, z);
    postMesh.setMatrixAt(index, matrix);
  });
  fence.add(postMesh);
  const [gateStart, gateEnd] = FENCE_GATE_X_M;
  const frontLeftWidth = gateStart + FENCE_X_M;
  const frontRightWidth = FENCE_X_M - gateEnd;
  for (const y of [0.7, 1.4, 2.1, FENCE_HEIGHT_M]) {
    for (const x of [-FENCE_X_M, FENCE_X_M])
      addBox(fence, materials.metal, [0.04, 0.04, FENCE_Z_M * 2], [x, y, 0]);
    addBox(fence, materials.metal, [FENCE_X_M * 2, 0.04, 0.04], [0, y, -FENCE_Z_M]);
    addBox(
      fence,
      materials.metal,
      [frontLeftWidth, 0.04, 0.04],
      [-FENCE_X_M + frontLeftWidth / 2, y, FENCE_Z_M],
    );
    addBox(
      fence,
      materials.metal,
      [frontRightWidth, 0.04, 0.04],
      [FENCE_X_M - frontRightWidth / 2, y, FENCE_Z_M],
    );
  }
  const panels = [
    [
      [-FENCE_X_M, -FENCE_Z_M],
      [-FENCE_X_M, FENCE_Z_M],
    ],
    [
      [FENCE_X_M, -FENCE_Z_M],
      [FENCE_X_M, FENCE_Z_M],
    ],
    [
      [-FENCE_X_M, -FENCE_Z_M],
      [FENCE_X_M, -FENCE_Z_M],
    ],
    [
      [-FENCE_X_M, FENCE_Z_M],
      [gateStart, FENCE_Z_M],
    ],
    [
      [gateEnd, FENCE_Z_M],
      [FENCE_X_M, FENCE_Z_M],
    ],
  ] as const;
  const meshParts = panels.map(([from, to]) => panelSegments(from, to, FENCE_HEIGHT_M, 0.5));
  const fenceMesh = new Float32Array(meshParts.reduce((total, part) => total + part.length, 0));
  meshParts.reduce((offset, part) => {
    fenceMesh.set(part, offset);
    return offset + part.length;
  }, 0);
  addLines(fence, 'fence-mesh', fenceMesh, lineMaterials.fence);

  const floodlights = new Group();
  floodlights.name = 'floodlights';
  group.add(floodlights);
  for (const [x, , z] of floodlightTowers) {
    const towards = -Math.sign(x) * 0.5;
    addBox(
      floodlights,
      materials.metal,
      [0.22, FLOODLIGHT_HEIGHT_M, 0.22],
      [x, FLOODLIGHT_HEIGHT_M / 2, z],
    );
    addBox(floodlights, materials.metal, [0.9, 0.12, 0.12], [x + towards, FLOODLIGHT_HEIGHT_M, z]);
    addBox(
      floodlights,
      materials.lamp,
      [0.3, 0.7, 1.4],
      [x + towards * 2, FLOODLIGHT_HEIGHT_M - 0.1, z],
    );
  }

  const landmarks = createLandmarks(kit);
  for (const landmark of Object.values(landmarks)) group.add(landmark);
  const entranceGoal = buildGoalFrame(kit, 'entrance-goal');
  entranceGoal.position.z = -landmarks.goal.position.z;
  entranceGoal.rotation.y = Math.PI;
  group.add(entranceGoal);
  group.add(createEntrance(kit));
  const instances = instanceBlocks(group, geometries.box);
  const ball = new Mesh(geometries.sphere, materials.line);
  ball.name = 'ball';
  ball.position.set(0, BALL_RADIUS_M, -(halfLength - PENALTY_SPOT_DISTANCE_M));
  group.add(ball);
  const kickedBall = new Mesh(geometries.sphere, materials.line);
  kickedBall.name = 'kick-ball';
  kickedBall.position.set(...kickBallAt(1));
  group.add(kickedBall);

  let isDisposed = false;
  return {
    group,
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      postMesh.dispose();
      for (const mesh of instances) mesh.dispose();
      kit.dispose();
      group.clear();
    },
  };
}
