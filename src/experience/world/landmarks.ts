import { Box3, Group, Mesh, Vector3 } from 'three';
import { hotspots, type HotspotId } from '@/data/hotspots';
import type { Kit } from './kit';
import {
  GOAL_DEPTH_M,
  GOAL_HEIGHT_M,
  GOAL_WIDTH_M,
  landmarkPositions,
  screenPlacements,
} from './layout';
import { boxNetSegments } from './nets';

const HIT_AREA_MARGIN_M = 0.2;
const BACKING_BORDER_M = 0.16;
const BACKING_DEPTH_M = 0.08;

export function buildGoalFrame(kit: Kit, name: string): Group {
  const { materials, lineMaterials, addBox, addLines } = kit;
  const goal = new Group();
  goal.name = name;
  const half = GOAL_WIDTH_M / 2;
  for (const x of [-half, half]) {
    addBox(goal, materials.line, [0.12, GOAL_HEIGHT_M, 0.12], [x, GOAL_HEIGHT_M / 2, 0]);
    addBox(
      goal,
      materials.metal,
      [0.08, GOAL_HEIGHT_M, 0.08],
      [x, GOAL_HEIGHT_M / 2, -GOAL_DEPTH_M],
    );
    addBox(
      goal,
      materials.metal,
      [0.08, 0.08, GOAL_DEPTH_M],
      [x, GOAL_HEIGHT_M, -GOAL_DEPTH_M / 2],
    );
    addBox(goal, materials.metal, [0.06, 0.06, GOAL_DEPTH_M], [x, 0.03, -GOAL_DEPTH_M / 2]);
  }
  addBox(goal, materials.line, [GOAL_WIDTH_M + 0.1, 0.12, 0.12], [0, GOAL_HEIGHT_M, 0]);
  addBox(goal, materials.metal, [GOAL_WIDTH_M, 0.08, 0.08], [0, GOAL_HEIGHT_M, -GOAL_DEPTH_M]);
  addBox(goal, materials.metal, [GOAL_WIDTH_M, 0.06, 0.06], [0, 0.03, -GOAL_DEPTH_M]);
  addLines(
    goal,
    'goal-net',
    boxNetSegments({
      width: GOAL_WIDTH_M,
      height: GOAL_HEIGHT_M,
      depth: GOAL_DEPTH_M,
      spacingM: 0.2,
      faces: ['back', 'top', 'left', 'right'],
    }),
    lineMaterials.net,
  );
  return goal;
}

/** Fundo físico da tela do ADR 0006, logo atrás da posição em que a cena coloca o HTML. */
function addScreenBacking(kit: Kit, landmark: Group, id: HotspotId): Mesh {
  const { center, rotationY, widthM, heightM } = screenPlacements[id];
  const origin = landmarkPositions[id];
  const inset = BACKING_DEPTH_M / 2 + 0.02;
  const backing = kit.addBox(
    landmark,
    kit.materials.dark,
    [widthM + BACKING_BORDER_M, heightM + BACKING_BORDER_M, BACKING_DEPTH_M],
    [
      center[0] - origin[0] - Math.sin(rotationY) * inset,
      center[1] - origin[1],
      center[2] - origin[2] - Math.cos(rotationY) * inset,
    ],
  );
  backing.rotation.y = rotationY;
  backing.name = 'screen-backing';
  return backing;
}

/** Área de clique simplificada: a caixa que envolve o marco inteiro, com margem. */
function fitHitArea(kit: Kit, landmark: Group): void {
  const bounds = new Box3().setFromObject(landmark);
  const size = bounds.getSize(new Vector3()).addScalar(HIT_AREA_MARGIN_M * 2);
  const center = bounds.getCenter(new Vector3());
  kit.addHitArea(landmark, [size.x, size.y, size.z], [center.x, center.y, center.z]);
}

export function createLandmarks(kit: Kit): Record<HotspotId, Group> {
  const { materials, geometries, addBox } = kit;
  const scoreboard = new Group();
  // O próprio painel do placar é o fundo do telão; o cartão aceso vem de signage.ts.
  addBox(scoreboard, materials.dark, [4.16, 2.36, 0.3], [0, 4.1, 0]).name = 'screen-backing';
  addBox(scoreboard, materials.metal, [4.3, 0.12, 0.45], [0, 5.34, 0]);
  for (const x of [-1.4, 1.4]) addBox(scoreboard, materials.metal, [0.15, 3, 0.15], [x, 1.5, 0]);

  const bench = new Group();
  addBox(bench, materials.dark, [1, 0.18, 4], [0, 0.65, 0]);
  addBox(bench, materials.dark, [0.15, 0.8, 4], [0.45, 1.1, 0]);
  for (const z of [-1.5, 1.5]) addBox(bench, materials.metal, [0.8, 0.6, 0.15], [0, 0.3, z]);
  const shelter = new Group();
  shelter.name = 'bench-shelter';
  bench.add(shelter);
  addBox(shelter, materials.wall, [0.12, 2.3, 4.6], [0.85, 1.15, 0]);
  addBox(shelter, materials.roof, [1.9, 0.12, 4.8], [0.1, 2.36, 0]);
  for (const z of [-2.3, 2.3]) addBox(shelter, materials.wall, [1.5, 2.3, 0.1], [0.15, 1.15, z]);
  const tacticsBoard = new Group();
  tacticsBoard.name = 'tactics-board';
  bench.add(tacticsBoard);
  addScreenBacking(kit, tacticsBoard, 'bench');
  for (const z of [-1.2, 1.2])
    addBox(tacticsBoard, materials.metal, [0.07, 2.5, 0.07], [-1.38, 1.25, z]);

  const character = new Group();
  // TODO(etapa-4): substituir a cápsula pelo personagem aprovado por Ruan.
  const capsule = new Mesh(geometries.capsule, materials.red);
  capsule.name = 'character-placeholder';
  capsule.position.y = 0.85;
  capsule.castShadow = true;
  character.add(capsule);
  const sign = new Group();
  sign.name = 'character-sign';
  character.add(sign);
  const signBacking = addScreenBacking(kit, sign, 'character');
  const signBottom = screenPlacements.character.center[1] - screenPlacements.character.heightM / 2;
  addBox(
    sign,
    materials.metal,
    [0.08, signBottom, 0.08],
    [signBacking.position.x, signBottom / 2, signBacking.position.z],
  );

  const goal = buildGoalFrame(kit, '');
  const goalScreen = new Group();
  goalScreen.name = 'goal-screen';
  goal.add(goalScreen);
  const goalBacking = addScreenBacking(kit, goalScreen, 'goal');
  const goalScreenTop = screenPlacements.goal.center[1] + screenPlacements.goal.heightM / 2;
  for (const x of [-2.2, 2.2])
    addBox(
      goalScreen,
      materials.metal,
      [0.12, goalScreenTop, 0.12],
      [x, goalScreenTop / 2, goalBacking.position.z - 0.08],
    );

  const landmarks: Record<HotspotId, Group> = { scoreboard, bench, character, goal };
  for (const { id, object } of hotspots) {
    fitHitArea(kit, landmarks[id]);
    landmarks[id].name = object;
    const [x, y, z] = landmarkPositions[id];
    landmarks[id].position.set(x, y, z);
  }
  return landmarks;
}
