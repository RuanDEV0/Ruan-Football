// API pública da cena: interface e renderização se comunicam apenas por este contrato (plano 3.4).
// Mudanças no contrato exigem ADR (a última: 0006).
import { gsap } from 'gsap';
import { Material, Mesh, type Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { hotspots, type HotspotId } from '@/data/hotspots';
import type { QualityProfile } from '@/lib/capabilities';
import { createCameraRig } from './camera/rig';
import { CAMERA_FOV_DEG } from './camera/viewpoints';
import { sleepTickerWhenIdle } from './core/ticker';
import { createFpsWindow, pixelRatioFor, shouldDowngrade, lowerQuality } from './core/quality';
import type { DebugPanel } from './debug/panel';
import { createHotspotLayer } from './interaction/hotspot-layer';
import { createScreenLayer } from './interaction/screen-layer';
import { bindPointer } from './interaction/pointer';
import { initialSnapshot, transition, type StateEvent } from './state/machine';
import { createAtmosphere } from './world/atmosphere';
import { createField } from './world/field';
import { createKickAnimation } from './world/kick';
import { landmarkPositions } from './world/layout';
import { createSignPainter } from './world/sign-painter';
import { createSignage } from './world/signage';

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
  /** Move a câmera ao ponto de vista do hotspot; encerra a chegada se ainda estiver em curso. */
  goTo(id: HotspotId): Promise<void>;
  /** Volta à vista geral a partir de um hotspot. */
  showOverview(): Promise<void>;
  /** Começa a chegada (“Entrar em campo”); antes disso a cena mostra o acesso e ignora `goTo`. */
  start(): void;
  /** Encerra a chegada e emite `arrival:done` uma única vez. */
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
export interface BootOptions {
  readonly quality: QualityProfile;
  /** Com movimento reduzido, a chegada vira corte e as transições são instantâneas (plano 3.5). */
  readonly reducedMotion: boolean;
  /** Botões criados pela interface dentro do container; a cena apenas os posiciona. */
  readonly hotspotButtons?: ReadonlyMap<HotspotId, HTMLElement>;
  /** Telas HTML criadas pela interface; a cena as posiciona no cenário (ADR 0006). */
  readonly screens?: ReadonlyMap<HotspotId, HTMLElement>;
  /** Progresso real da montagem, de 0 a 1: campo montado, materiais compilados e primeiro quadro. */
  readonly onProgress?: (ratio: number) => void;
  /** Renderização contínua e painel de medição para aparelhos reais; nunca em visitas normais. */
  readonly debug?: boolean;
}

// Chegada curta do plano (Etapa 2), sempre com “Pular”: a câmera acompanha a bola chutada até o gol e
// sobe para a vista geral (ADR 0008). Hipóteses a validar com Ruan.
const ARRIVAL_CHASE_S = 1.8;
const ARRIVAL_PULLBACK_S = 1.5;
const ARRIVAL_DURATION_S = ARRIVAL_CHASE_S + ARRIVAL_PULLBACK_S;
const VIEWPOINT_DURATION_S = 1.1;
// Fração da chegada em que os refletores acendem; terminam antes de a câmera parar.
const IGNITION_SHARE = 0.85;
const SHADOW_MAP_PX = 1024;
const SHADOW_EXTENT_M = 3;
const STICKY_EVENTS = ['progress', 'ready', 'arrival:done'] as const;

const MOUNT_STEPS = 3;

/**
 * O container pertence à interface. Resolve depois do primeiro quadro, com a cena parada no acesso
 * até `start()`. Rejeita falhas de WebGL; dispose libera GPU e listeners.
 */
export async function boot(container: HTMLElement, options: BootOptions): Promise<Experience> {
  const debug = options.debug ? await import('./debug/panel') : null;
  const mounted = mount(container, options, debug?.createDebugPanel(container) ?? null);
  try {
    mounted.report(1 / MOUNT_STEPS);
    await mounted.compile();
    mounted.report(2 / MOUNT_STEPS);
    mounted.firstFrame();
    mounted.report(1);
    return mounted.experience;
  } catch (error: unknown) {
    mounted.experience.dispose();
    throw error;
  }
}

interface Mounted {
  readonly experience: Experience;
  report(ratio: number): void;
  compile(): Promise<void>;
  firstFrame(): void;
}

function mount(
  container: HTMLElement,
  options: BootOptions,
  debugPanel: DebugPanel | null,
): Mounted {
  let snapshot = transition(initialSnapshot, 'load');
  let quality = options.quality;
  let isDisposed = false;
  let isPaused = false;
  const events = new EventTarget();
  const sticky = new Map<keyof ExperienceEvents, unknown>();
  const emit = <E extends keyof ExperienceEvents>(event: E, payload: ExperienceEvents[E]): void => {
    if ((STICKY_EVENTS as readonly string[]).includes(event)) sticky.set(event, payload);
    events.dispatchEvent(new CustomEvent(event, { detail: payload }));
  };
  const send = (event: StateEvent): void => {
    snapshot = transition(snapshot, event);
  };

  const renderer = new WebGLRenderer({ antialias: options.quality !== 'low', alpha: true });
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.sceneCanvas = '';
  const scene = new Scene();
  const camera = new PerspectiveCamera(CAMERA_FOV_DEG, 1, 0.1, 200);
  const field = createField();
  const atmosphere = createAtmosphere();
  const signage = createSignage(createSignPainter(renderer.capabilities.getMaxAnisotropy()));
  scene.add(field.group, atmosphere.group, signage.group);
  scene.background = atmosphere.background;
  scene.fog = atmosphere.fog;
  // A luz principal vem do refletor mais próximo do personagem, o único com sombra dinâmica.
  const keyLight = atmosphere.key;
  const [characterX, , characterZ] = landmarkPositions.character;
  keyLight.target.position.set(characterX, 0, characterZ);
  keyLight.shadow.mapSize.set(SHADOW_MAP_PX, SHADOW_MAP_PX);
  Object.assign(keyLight.shadow.camera, {
    left: -SHADOW_EXTENT_M,
    right: SHADOW_EXTENT_M,
    top: SHADOW_EXTENT_M,
    bottom: -SHADOW_EXTENT_M,
    near: 1,
    far: 60,
  });

  // Destaque de um ponto: botão em foco ou sob o ponteiro tem prioridade sobre o objeto no canvas.
  let buttonHighlight: HotspotId | null = null;
  let canvasHighlight: HotspotId | null = null;
  const refreshHighlight = (): void => {
    signage.highlight(buttonHighlight ?? canvasHighlight);
    invalidate();
  };
  const hotspotLayer = options.hotspotButtons
    ? createHotspotLayer(options.hotspotButtons, (id) => {
        buttonHighlight = id;
        refreshHighlight();
      })
    : null;
  const screenLayer = options.screens ? createScreenLayer(options.screens) : null;
  const goalObject = hotspots.find(({ id }) => id === 'goal')?.object ?? '';
  const kickedBall = field.group.getObjectByName('kick-ball');
  const kick = kickedBall
    ? createKickAnimation(
        kickedBall,
        field.group.getObjectByName(goalObject)?.getObjectByName('goal-net'),
        () => {
          invalidate();
        },
      )
    : null;
  const fpsWindow = createFpsWindow();
  let frameId = 0;
  let lastFrameMs = 0;
  let debugShown = false;
  let width = 1;
  let height = 1;

  const draw = (): void => {
    renderer.render(scene, camera);
    screenLayer?.render(camera);
    hotspotLayer?.update(camera, width, height, rig.isMoving);
  };
  const invalidate = (): void => {
    if (isDisposed || isPaused || frameId !== 0) return;
    frameId = requestAnimationFrame(frame);
  };
  const rig = createCameraRig(camera, invalidate);
  function frame(timeMs: number): void {
    frameId = 0;
    const deltaMs = timeMs - lastFrameMs;
    lastFrameMs = timeMs;
    draw();
    if (!rig.isMoving && !debugPanel) return;
    const averageFps = fpsWindow.add(deltaMs);
    if (debugPanel && (averageFps !== null || !debugShown)) {
      debugShown = true;
      debugPanel.show({
        averageFps,
        profile: quality,
        pixelRatio: renderer.getPixelRatio(),
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
      });
    }
    if (averageFps !== null && shouldDowngrade(quality, averageFps)) {
      const lower = lowerQuality(quality);
      if (lower) {
        applyQuality(lower);
        emit('quality:downgrade', lower);
      }
    }
    invalidate();
  }

  const resize = (): void => {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    atmosphere.setPixelScale(height / (2 * Math.tan(((CAMERA_FOV_DEG / 2) * Math.PI) / 180)));
    screenLayer?.setSize(width, height);
    rig.refresh();
    invalidate();
  };
  function applyQuality(profile: QualityProfile): void {
    quality = profile;
    const shadows = profile === 'high';
    if (renderer.shadowMap.enabled !== shadows) {
      renderer.shadowMap.enabled = shadows;
      keyLight.castShadow = shadows;
      scene.traverse((object: Object3D) => {
        if (!(object instanceof Mesh)) return;
        const assigned: unknown = object.material;
        for (const material of Array.isArray(assigned) ? assigned : [assigned])
          if (material instanceof Material) material.needsUpdate = true;
      });
    }
    renderer.setPixelRatio(pixelRatioFor(profile, window.devicePixelRatio));
    resize();
  }

  // Os refletores acendem durante a chegada (ADR 0007); com movimento reduzido, já estão acesos.
  const ignition = { value: 0 };
  let ignitionTween: gsap.core.Tween | null = null;
  const igniteFully = (): void => {
    if (ignitionTween) sleepTickerWhenIdle();
    ignitionTween?.kill();
    ignitionTween = null;
    ignition.value = 1;
    atmosphere.setIgnition(1);
  };
  let arrivalDone = false;
  const finishArrival = (): void => {
    if (arrivalDone) return;
    arrivalDone = true;
    igniteFully();
    kick?.finish();
    send('finish');
    emit('arrival:done', undefined);
  };
  // Quadro síncrono ao chegar: a interface move o foco para botões que precisam estar posicionados.
  const moveTo = (view: HotspotId | 'overview'): Promise<void> =>
    rig.moveTo(view, options.reducedMotion ? 0 : VIEWPOINT_DURATION_S).then(() => {
      if (!isDisposed) draw();
    });

  const hitAreas = hotspots.flatMap(({ object }) => {
    const hitArea = field.group.getObjectByName(object)?.getObjectByName('hit-area');
    return hitArea ? [hitArea] : [];
  });
  const unbindPointer = bindPointer(canvas, {
    camera,
    hitAreas,
    // Na tela focada a câmera fica de frente: é o que permite posicionar o HTML em 2D (ADR 0007).
    canOrbit: () => snapshot.state === 'exploring',
    orbitBy: (delta) => {
      rig.orbitBy(delta);
    },
    hover: (id) => {
      canvasHighlight = id;
      refreshHighlight();
      emit('hotspot:hover', id);
    },
    select: (id) => {
      if (snapshot.state === 'exploring' || snapshot.state === 'focus') emit('hotspot:select', id);
    },
  });
  const observer = new ResizeObserver(resize);
  const contextLost = (event: Event): void => {
    event.preventDefault();
    experience.pause();
    send('error');
    emit('error', new Error('O contexto WebGL foi interrompido.'));
  };
  canvas.addEventListener('webglcontextlost', contextLost);
  container.append(canvas);
  observer.observe(container);
  applyQuality(options.quality);

  const experience: Experience = {
    goTo: (id) => {
      if (isDisposed || isPaused || snapshot.state === 'fallback' || snapshot.state === 'loading')
        return Promise.resolve();
      if (snapshot.state === 'arrival') finishArrival();
      send('focus');
      return moveTo(id);
    },
    showOverview: () => {
      if (isDisposed || isPaused || snapshot.state === 'fallback' || snapshot.state === 'loading')
        return Promise.resolve();
      send('close');
      return moveTo('overview');
    },
    start: () => {
      if (isDisposed || snapshot.state !== 'loading') return;
      send('arrive');
      if (options.reducedMotion) {
        void rig.moveTo('overview', 0);
        draw();
        finishArrival();
        return;
      }
      ignitionTween = gsap.to(ignition, {
        value: 1,
        duration: ARRIVAL_DURATION_S * IGNITION_SHARE,
        ease: 'none',
        onUpdate: () => {
          atmosphere.setIgnition(ignition.value);
          invalidate();
        },
        onComplete: sleepTickerWhenIdle,
      });
      kick?.play();
      void rig
        .moveTo('kick', ARRIVAL_CHASE_S)
        .then(() => (rig.view === 'kick' ? rig.moveTo('overview', ARRIVAL_PULLBACK_S) : undefined))
        .then(() => {
          if (rig.view === 'overview') finishArrival();
        });
    },
    skipArrival: () => {
      if (snapshot.state !== 'arrival') return;
      void rig.moveTo('overview', 0);
      // Quadro síncrono: os botões precisam estar visíveis quando a interface mover o foco.
      draw();
      finishArrival();
    },
    setQuality: applyQuality,
    pause: () => {
      send('pause');
      isPaused = true;
      rig.pause();
      ignitionTween?.pause();
      kick?.pause();
      cancelAnimationFrame(frameId);
      frameId = 0;
    },
    resume: () => {
      if (isDisposed || snapshot.state === 'fallback') return;
      send('resume');
      isPaused = false;
      rig.resume();
      ignitionTween?.resume();
      kick?.resume();
      invalidate();
    },
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      cancelAnimationFrame(frameId);
      ignitionTween?.kill();
      kick?.dispose();
      rig.dispose();
      hotspotLayer?.dispose();
      unbindPointer();
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', contextLost);
      field.dispose();
      atmosphere.dispose();
      signage.dispose();
      screenLayer?.dispose();
      debugPanel?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
    on: (event, cb) => {
      const listener = (value: Event): void => {
        // O emissor privado associa cada evento ao payload do contrato público.
        if (value instanceof CustomEvent)
          cb((value as CustomEvent<ExperienceEvents[typeof event]>).detail);
      };
      events.addEventListener(event, listener);
      if (sticky.has(event)) {
        queueMicrotask(() => {
          // `emit` só grava em `sticky` o payload tipado do mesmo evento.
          if (!isDisposed) cb(sticky.get(event) as ExperienceEvents[typeof event]);
        });
      }
      return () => {
        events.removeEventListener(event, listener);
      };
    },
  };
  return {
    experience,
    report: (ratio) => {
      emit('progress', ratio);
      options.onProgress?.(ratio);
    },
    compile: async () => {
      await renderer.compileAsync(scene, camera);
    },
    firstFrame: () => {
      draw();
      emit('ready', undefined);
    },
  };
}
