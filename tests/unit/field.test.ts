import { Box3, InstancedMesh, Line, Mesh, Quaternion, Vector3, type Object3D } from 'three';
import { expect, it, vi } from 'vitest';
import { hotspots } from '@/data/hotspots';
import { createField } from '@/experience/world/field';
import { kickBallAt } from '@/experience/world/kick';
import {
  FIELD_LENGTH_M,
  PENALTY_SPOT_DISTANCE_M,
  screenPlacements,
} from '@/experience/world/layout';

function isMesh(object: Object3D): object is Mesh {
  return object instanceof Mesh;
}

it('builds a compact field with every planned landmark and the shared hotspot names', () => {
  const field = createField();
  for (const { object } of hotspots) {
    const landmark = field.group.getObjectByName(object);
    expect(landmark, object).toBeDefined();
    if (landmark) expect(new Box3().setFromObject(landmark).isEmpty()).toBe(false);
  }
  expect(field.group.getObjectByName('pitch')).toBeDefined();
  expect(field.group.getObjectByName('fence')).toBeDefined();
  expect(field.group.getObjectByName('ball')).toBeDefined();
  field.dispose();
});

function isRendered(object: Object3D): object is Mesh | Line {
  let current: Object3D | null = object;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return object instanceof Mesh || object instanceof Line;
}

it('keeps geometry within the prototype budgets and releases shared resources once', () => {
  const field = createField();
  const geometries = new Set<Mesh['geometry']>();
  const materials = new Set<Exclude<Mesh['material'], unknown[]>>();
  let drawCalls = 0;
  let triangles = 0;
  field.group.traverse((object) => {
    if (!(object instanceof Mesh || object instanceof Line)) return;
    const drawable: Mesh | Line = object;
    geometries.add(drawable.geometry);
    for (const material of Array.isArray(drawable.material)
      ? drawable.material
      : [drawable.material])
      materials.add(material);
    if (!isRendered(object)) return;
    drawCalls += 1;
    if (!isMesh(object)) return;
    const instances = object instanceof InstancedMesh ? object.count : 1;
    triangles +=
      ((object.geometry.index?.count ?? object.geometry.attributes.position?.count ?? 0) / 3) *
      instances;
  });
  expect(drawCalls).toBeGreaterThan(0);
  expect(drawCalls).toBeLessThanOrEqual(100);
  expect(triangles).toBeLessThanOrEqual(150000);
  const spies = [...geometries, ...materials].map((resource) => vi.spyOn(resource, 'dispose'));
  field.dispose();
  field.dispose();
  for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1);
});

it('provides two separated goals and the confirmed entrance facilities outside the pitch', () => {
  const field = createField();
  const pitch = field.group.getObjectByName('pitch');
  expect(pitch).toBeDefined();
  if (!pitch) return;
  const pitchBounds = new Box3().setFromObject(pitch);
  expect(pitchBounds.max.z - pitchBounds.min.z).toBeGreaterThan(28);
  const goals = [hotspots.find(({ id }) => id === 'goal')?.object ?? '', 'entrance-goal'].map(
    (name) => field.group.getObjectByName(name),
  );
  for (const goal of goals) expect(goal).toBeDefined();
  if (goals[0] && goals[1])
    expect(Math.abs(goals[0].position.z - goals[1].position.z)).toBeGreaterThan(35);
  for (const name of [
    'kiosk',
    'storage',
    'restroom',
    'chairs',
    'soap-football',
    'trampoline',
    'entrance-path',
  ]) {
    const object = field.group.getObjectByName(name);
    expect(object, name).toBeDefined();
    if (object)
      expect(new Box3().setFromObject(object).min.z, name).toBeGreaterThan(pitchBounds.max.z);
  }
  for (const name of ['kiosk-window', 'kiosk-door', 'storage-door', 'restroom-door'])
    expect(field.group.getObjectByName(name), name).toBeDefined();
  field.dispose();
});

it('keeps the entrance path clear of buildings and play equipment', () => {
  const field = createField();
  const path = field.group.getObjectByName('entrance-path');
  expect(path).toBeDefined();
  if (!path) return;
  const pathBounds = new Box3().setFromObject(path);
  for (const name of ['kiosk', 'storage', 'restroom', 'chairs', 'soap-football', 'trampoline']) {
    const object = field.group.getObjectByName(name);
    expect(object).toBeDefined();
    if (!object) continue;
    const bounds = new Box3().setFromObject(object);
    expect(bounds.max.x < pathBounds.min.x || bounds.min.x > pathBounds.max.x, name).toBe(true);
  }
  const soap = field.group.getObjectByName('soap-football');
  const trampoline = field.group.getObjectByName('trampoline');
  if (soap && trampoline) expect(soap.position.z).toBeGreaterThan(trampoline.position.z);
  field.dispose();
});

it('faces the kiosk window and room doors toward the pitch, with chairs on that side', () => {
  const field = createField();
  field.group.updateMatrixWorld(true);
  for (const [buildingName, openingName] of [
    ['kiosk', 'kiosk-window'],
    ['storage', 'storage-door'],
    ['restroom', 'restroom-door'],
  ] as const) {
    const building = field.group.getObjectByName(buildingName);
    const opening = field.group.getObjectByName(openingName);
    expect(building).toBeDefined();
    expect(opening).toBeDefined();
    if (!building || !opening) continue;
    const openingBounds = new Box3().setFromObject(opening);
    expect(openingBounds.max.z, openingName).toBeLessThan(building.position.z);
  }
  const chairs = field.group.getObjectByName('chairs');
  const kiosk = field.group.getObjectByName('kiosk');
  const sideDoor = field.group.getObjectByName('kiosk-door');
  expect(chairs).toBeDefined();
  expect(kiosk).toBeDefined();
  expect(sideDoor).toBeDefined();
  if (chairs && kiosk && sideDoor) {
    expect(new Box3().setFromObject(chairs).max.z).toBeLessThan(
      new Box3().setFromObject(kiosk).min.z,
    );
    expect(new Box3().setFromObject(sideDoor).min.x).toBeGreaterThan(kiosk.position.x);
  }
  field.dispose();
});

it('details the goals, fence, lights and markings beyond plain blocks', () => {
  const field = createField();
  const goal = field.group.getObjectByName(hotspots.find(({ id }) => id === 'goal')?.object ?? '');
  const entranceGoal = field.group.getObjectByName('entrance-goal');
  for (const container of [goal, entranceGoal]) {
    const net = container?.getObjectByName('goal-net');
    expect(net, container?.name).toBeInstanceOf(Line);
  }
  expect(field.group.getObjectByName('fence-mesh')).toBeInstanceOf(Line);
  expect(field.group.getObjectByName('trampoline-net')).toBeInstanceOf(Line);
  const floodlights = field.group.getObjectByName('floodlights');
  expect(floodlights).toBeDefined();
  if (floodlights) expect(new Box3().setFromObject(floodlights).max.y).toBeGreaterThan(7);
  expect(field.group.getObjectByName('bench-shelter')).toBeDefined();
  const spots: Object3D[] = [];
  field.group.traverse((object) => {
    if (object.name === 'penalty-spot') spots.push(object);
  });
  const spotZ = FIELD_LENGTH_M / 2 - PENALTY_SPOT_DISTANCE_M;
  expect(spots.map(({ position }) => Math.abs(position.z))).toEqual([spotZ, spotZ]);
  field.dispose();
});

it('places the ball on the penalty spot in front of the penalty goal', () => {
  const field = createField();
  const ball = field.group.getObjectByName('ball');
  expect(ball).toBeDefined();
  if (ball) {
    expect(ball.position.x).toBeCloseTo(0);
    expect(ball.position.z).toBeCloseTo(-(FIELD_LENGTH_M / 2 - PENALTY_SPOT_DISTANCE_M));
  }
  field.dispose();
});

it('gives every hotspot an invisible, simplified hit area around its landmark', () => {
  const field = createField();
  field.group.updateMatrixWorld(true);
  for (const { object } of hotspots) {
    const landmark = field.group.getObjectByName(object);
    const hitArea = landmark?.getObjectByName('hit-area');
    expect(hitArea, object).toBeInstanceOf(Mesh);
    if (!landmark || !(hitArea instanceof Mesh)) continue;
    expect(hitArea.visible).toBe(false);
    const hitBounds = new Box3().setFromObject(hitArea, true);
    const center = new Box3().setFromObject(landmark).getCenter(new Vector3());
    expect(hitBounds.containsPoint(center), object).toBe(true);
  }
  field.dispose();
});

it('lets only the character placeholder cast the dynamic shadow', () => {
  const field = createField();
  const casters: string[] = [];
  field.group.traverse((object) => {
    if (object.castShadow) casters.push(object.parent?.name ?? '');
  });
  expect(casters).toEqual([hotspots.find(({ id }) => id === 'character')?.object]);
  expect(field.group.getObjectByName('pitch')?.receiveShadow).toBe(true);
  field.dispose();
});

it('gives every screen a physical backing right behind it, inside its hotspot', () => {
  const field = createField();
  field.group.updateMatrixWorld(true);
  for (const { id, object } of hotspots) {
    const landmark = field.group.getObjectByName(object);
    const backing = landmark?.getObjectByName('screen-backing');
    expect(backing, object).toBeInstanceOf(Mesh);
    if (!backing) continue;
    const screen = screenPlacements[id];
    const bounds = new Box3().setFromObject(backing);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const normal = new Vector3(Math.sin(screen.rotationY), 0, Math.cos(screen.rotationY));
    const face = new Vector3(...screen.center);
    expect(center.distanceTo(face), object).toBeLessThan(0.2);
    expect(face.clone().sub(center).dot(normal), `${object} atrás da tela`).toBeGreaterThan(0);
    const thickness = new Vector3(0, 0, 1).applyQuaternion(
      backing.getWorldQuaternion(new Quaternion()),
    );
    expect(thickness.dot(normal), `${object} paralelo à tela`).toBeGreaterThan(0.99);
    expect(size.y, object).toBeGreaterThanOrEqual(screen.heightM);
    expect(Math.hypot(size.x, size.z), object).toBeGreaterThanOrEqual(screen.widthM);
    const hitArea = landmark?.getObjectByName('hit-area');
    if (hitArea)
      expect(new Box3().setFromObject(hitArea, true).containsBox(bounds), object).toBe(true);
  }
  field.dispose();
});

it('keeps the ball kicked in the arrival resting inside the far goal net', () => {
  const field = createField();
  const kicked = field.group.getObjectByName('kick-ball');
  expect(kicked).toBeDefined();
  expect(kicked?.position.toArray()).toEqual([...kickBallAt(1)]);
  expect(field.group.getObjectByName('ball')?.position.z).not.toBe(kicked?.position.z);
  field.dispose();
});
