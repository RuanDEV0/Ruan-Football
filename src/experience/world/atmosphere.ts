// Noite do campo (plano 3.3 e ADR 0007): fundo, névoa, estrelas e o brilho dos refletores sem
// pós-processamento. Luzes dinâmicas limitadas a uma direcional e uma hemisférica (guia da cena).
import {
  AdditiveBlending,
  BufferGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  ShaderMaterial,
  Vector3,
} from 'three';
import { FIELD_LENGTH_M, FIELD_WIDTH_M, floodlightLamps } from './layout';

export const NIGHT_COLOR = 0x070d12;
const FOG_NEAR_M = 70;
const FOG_FAR_M = 175;
const STAR_COUNT = 260;
const STAR_DOME_RADIUS_M = 140;
// Cada torre leva esta fração da chegada para acender; a seguinte começa um pouco depois, e a
// última termina antes do fim, com folga para o arredondamento.
const TOWER_RAMP = 0.4;
const TOWER_STAGGER = 0.18;
const HEMISPHERE_DARK = 0.7;
const HEMISPHERE_LIT = 1.5;
const KEY_LIT = 2.6;
const GLOW_SIZE_M = 5;
// Teto do halo: de perto, o refletor não pode lavar o céu atrás das telas.
const GLOW_MAX_PX = 96;
const CONE_RADIUS_M = 5;
const CONE_OPACITY = 0.03;
const POOL_OPACITY = 0.11;

export interface Atmosphere {
  readonly group: Group;
  readonly key: DirectionalLight;
  readonly background: Color;
  readonly fog: Fog;
  /** 0 com os refletores apagados, 1 com todos acesos; as torres acendem em sequência. */
  setIgnition(value: number): void;
  /** Escala dos halos, em pixels por metro a 1 m da câmera: altura da viewport / (2 tan(fov/2)). */
  setPixelScale(value: number): void;
  dispose(): void;
}

export function towerIgnition(value: number, tower: number): number {
  return Math.min(Math.max((value - tower * TOWER_STAGGER) / TOWER_RAMP, 0), 1);
}

// Gerador fixo: as estrelas ficam no mesmo lugar em toda visita e nas capturas do ciclo visual.
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const glowVertex = /* glsl */ `
  attribute float intensity;
  uniform float pixelScale;
  uniform float sizeM;
  uniform float maxSizePx;
  varying float vIntensity;
  void main() {
    vIntensity = intensity;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = min(sizeM * pixelScale / -view.z, maxSizePx);
    gl_Position = projectionMatrix * view;
  }
`;
const glowFragment = /* glsl */ `
  varying float vIntensity;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = smoothstep(0.35, 0.0, d);
    float halo = smoothstep(1.0, 0.0, d) * 0.35;
    gl_FragColor = vec4(vec3(1.0, 0.93, 0.78) * (core + halo) * vIntensity, 1.0);
  }
`;

function fadingCone(lamp: Vector3, target: Vector3): BufferGeometry {
  const length = lamp.distanceTo(target);
  const geometry = new ConeGeometry(CONE_RADIUS_M, length, 24, 1, true);
  const positions = geometry.getAttribute('position');
  const colors: number[] = [];
  for (let index = 0; index < positions.count; index += 1) {
    const shade = positions.getY(index) > 0 ? 1 : 0;
    colors.push(shade, shade, shade);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
}

export function createAtmosphere(): Atmosphere {
  const group = new Group();
  group.name = 'atmosphere';
  const background = new Color(NIGHT_COLOR);
  const fog = new Fog(NIGHT_COLOR, FOG_NEAR_M, FOG_FAR_M);
  const hemisphere = new HemisphereLight(0x3a5280, 0x0d1611, HEMISPHERE_DARK);
  const key = new DirectionalLight(0xfff1dc, 0);
  group.add(hemisphere, key, key.target);

  const random = seeded(7);
  const starPositions: number[] = [];
  for (let index = 0; index < STAR_COUNT; index += 1) {
    const azimuth = random() * Math.PI * 2;
    const elevation = 0.12 + random() * 1.2;
    starPositions.push(
      Math.cos(azimuth) * Math.cos(elevation) * STAR_DOME_RADIUS_M,
      Math.sin(elevation) * STAR_DOME_RADIUS_M,
      Math.sin(azimuth) * Math.cos(elevation) * STAR_DOME_RADIUS_M,
    );
  }
  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute('position', new Float32BufferAttribute(starPositions, 3));
  const starMaterial = new PointsMaterial({
    color: 0xc9d6ff,
    size: 1.6,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.7,
    fog: false,
  });
  const stars = new Points(starGeometry, starMaterial);
  stars.name = 'stars';
  group.add(stars);

  const lamps = floodlightLamps.map((lamp) => new Vector3(...lamp));
  const glowGeometry = new BufferGeometry();
  glowGeometry.setAttribute(
    'position',
    new Float32BufferAttribute(
      lamps.flatMap((lamp) => lamp.toArray()),
      3,
    ),
  );
  const glowIntensity = new Float32BufferAttribute(new Float32Array(lamps.length), 1);
  glowGeometry.setAttribute('intensity', glowIntensity);
  const glowMaterial = new ShaderMaterial({
    uniforms: {
      pixelScale: { value: 1 },
      sizeM: { value: GLOW_SIZE_M },
      maxSizePx: { value: GLOW_MAX_PX },
    },
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const glows = new Points(glowGeometry, glowMaterial);
  glows.name = 'floodlight-glows';
  glows.frustumCulled = false;
  group.add(glows);

  const coneMaterials: MeshBasicMaterial[] = [];
  const coneGeometries: BufferGeometry[] = [];
  lamps.forEach((lamp, index) => {
    const target = new Vector3(Math.sign(lamp.x) * 2.5, 0, Math.sign(lamp.z) * 8);
    const geometry = fadingCone(lamp, target);
    const material = new MeshBasicMaterial({
      vertexColors: true,
      color: 0x000000,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });
    const cone = new Mesh(geometry, material);
    cone.name = `floodlight-beam-${String(index)}`;
    cone.position.copy(lamp).add(target).multiplyScalar(0.5);
    cone.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), lamp.clone().sub(target).normalize());
    coneGeometries.push(geometry);
    coneMaterials.push(material);
    group.add(cone);
  });

  const poolGeometry = new CircleGeometry(1, 48);
  const poolColors: number[] = [];
  for (let index = 0; index < poolGeometry.getAttribute('position').count; index += 1) {
    const shade = index === 0 ? 1 : 0;
    poolColors.push(shade, shade, shade * 0.85);
  }
  poolGeometry.setAttribute('color', new Float32BufferAttribute(poolColors, 3));
  const poolMaterial = new MeshBasicMaterial({
    vertexColors: true,
    color: 0x000000,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const pool = new Mesh(poolGeometry, poolMaterial);
  pool.name = 'light-pool';
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.045;
  pool.scale.set(FIELD_WIDTH_M * 0.75, FIELD_LENGTH_M * 0.62, 1);
  group.add(pool);

  const keyLamp = lamps.find((lamp) => lamp.x > 0 && lamp.z > 0) ?? new Vector3(10, 9, 21);
  key.position.set(keyLamp.x, keyLamp.y + 5, keyLamp.z);

  const setIgnition = (value: number): void => {
    const towers = lamps.map((_, index) => towerIgnition(value, index));
    const average = towers.reduce((total, tower) => total + tower, 0) / towers.length;
    towers.forEach((tower, index) => {
      glowIntensity.setX(index, tower);
      coneMaterials[index]?.color.setScalar(tower * CONE_OPACITY);
    });
    glowIntensity.needsUpdate = true;
    poolMaterial.color.setScalar(average * POOL_OPACITY);
    hemisphere.intensity = HEMISPHERE_DARK + (HEMISPHERE_LIT - HEMISPHERE_DARK) * average;
    key.intensity = KEY_LIT * average;
  };
  setIgnition(0);

  let isDisposed = false;
  return {
    group,
    key,
    background,
    fog,
    setIgnition,
    setPixelScale(value) {
      const uniform = glowMaterial.uniforms.pixelScale;
      if (uniform) uniform.value = value;
    },
    dispose() {
      if (isDisposed) return;
      isDisposed = true;
      for (const resource of [
        starGeometry,
        starMaterial,
        glowGeometry,
        glowMaterial,
        poolGeometry,
        poolMaterial,
        ...coneGeometries,
        ...coneMaterials,
      ])
        resource.dispose();
      key.dispose();
      hemisphere.dispose();
      group.clear();
    },
  };
}
