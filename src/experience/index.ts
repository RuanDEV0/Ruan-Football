// API pública da cena: interface e renderização se comunicam apenas por este contrato (plano 3.4).
import type { HotspotId } from '@/data/hotspots';
import { pixelRatioLimits } from './core/quality';
import type { QualityProfile } from '@/lib/capabilities';
import { transition, type ExperienceState } from './state/machine';

export type { QualityProfile } from '@/lib/capabilities';
export interface ExperienceEvents {
  progress: number;
  ready: undefined;
  'arrival:done': undefined;
  'hotspot:hover': HotspotId | null;
  'hotspot:select': HotspotId;
  'quality:downgrade': QualityProfile;
  error: Error;
}
export interface Experience {
  goTo(id: HotspotId): Promise<void>;
  skipArrival(): void;
  setQuality(profile: QualityProfile): void;
  pause(): void;
  resume(): void;
  dispose(): void;
  on<E extends keyof ExperienceEvents>(
    event: E,
    cb: (payload: ExperienceEvents[E]) => void,
  ): () => void;
}
interface BootOptions {
  readonly quality: QualityProfile;
  readonly reducedMotion: boolean;
}

/** O container pertence à interface. Rejeita falhas de WebGL; dispose libera GPU e listeners. */
export async function boot(container: HTMLElement, options: BootOptions): Promise<Experience> {
  const { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, WebGLRenderer } =
    await import('three');
  let state: ExperienceState = transition('entry', 'load');
  let isDisposed = false;
  const events = new EventTarget();
  const emit = <E extends keyof ExperienceEvents>(event: E, payload: ExperienceEvents[E]): void => {
    events.dispatchEvent(new CustomEvent(event, { detail: payload }));
  };
  const renderer = new WebGLRenderer({ antialias: options.quality !== 'low', alpha: true });
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new Scene();
  const TEST_CAMERA_FOV_DEG = 45;
  const TEST_CAMERA_NEAR_M = 0.1;
  const TEST_CAMERA_FAR_M = 100;
  const TEST_CAMERA_DISTANCE_M = 4;
  const TEST_ROTATION_RAD_PER_MS = 0.0003;
  const camera = new PerspectiveCamera(
    TEST_CAMERA_FOV_DEG,
    1,
    TEST_CAMERA_NEAR_M,
    TEST_CAMERA_FAR_M,
  );
  camera.position.z = TEST_CAMERA_DISTANCE_M;
  const geometry = new BoxGeometry();
  const material = new MeshNormalMaterial();
  const cube = new Mesh(geometry, material);
  scene.add(cube);

  const resize = (): void => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  const setQuality = (profile: QualityProfile): void => {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioLimits[profile]));
    resize();
  };
  const draw = (): void => {
    renderer.render(scene, camera);
  };
  const pause = (): void => {
    state = transition(state, 'pause');
    renderer.setAnimationLoop(null);
  };
  const resume = (): void => {
    if (isDisposed || state === 'fallback') return;
    state = transition(state, 'resume');
    if (options.reducedMotion) draw();
    else
      renderer.setAnimationLoop((timeMs) => {
        cube.rotation.y = timeMs * TEST_ROTATION_RAD_PER_MS;
        renderer.render(scene, camera);
      });
  };
  const observer = new ResizeObserver(() => {
    resize();
    draw();
  });
  const contextLost = (event: Event): void => {
    event.preventDefault();
    pause();
    state = transition(state, 'error');
    emit('error', new Error('O contexto WebGL foi interrompido.'));
  };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  container.append(renderer.domElement);
  observer.observe(container);
  setQuality(options.quality);
  state = transition(state, 'ready');
  resume();

  return {
    // TODO(etapa-2): ligar os pontos de vista à câmera quando o campo substituir o cubo.
    goTo: async () => {},
    skipArrival: () => {
      state = transition(state, 'skip');
      emit('arrival:done', undefined);
    },
    setQuality,
    pause,
    resume,
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      pause();
      observer.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
    on: (event, cb) => {
      const listener = (value: Event): void => {
        // O emissor privado associa cada evento ao payload do contrato público.
        if (value instanceof CustomEvent)
          cb((value as CustomEvent<ExperienceEvents[typeof event]>).detail);
      };
      events.addEventListener(event, listener);
      if (event === 'ready' || event === 'progress') {
        queueMicrotask(() => {
          if (isDisposed) return;
          if (event === 'progress') emit('progress', 1);
          else emit('ready', undefined);
        });
      }
      return () => {
        events.removeEventListener(event, listener);
      };
    },
  };
}
