import { gsap } from 'gsap';
import { Vector3, type PerspectiveCamera } from 'three';
import { sleepTickerWhenIdle } from '@/experience/core/ticker';
import { clampOrbit, orbitPosition } from './orbit';
import { viewpointFor, type Vec3, type ViewId } from './viewpoints';

export interface CameraRig {
  readonly isMoving: boolean;
  readonly view: ViewId;
  /** Com duração 0, posiciona sem animação; a promessa resolve também quando outro movimento a interrompe. */
  moveTo(view: ViewId, durationS: number): Promise<void>;
  orbitBy(deltaRad: number): void;
  /** Reaplica o ponto de vista atual depois de mudar a proporção da câmera. */
  refresh(): void;
  pause(): void;
  resume(): void;
  dispose(): void;
}

export function createCameraRig(camera: PerspectiveCamera, onChange: () => void): CameraRig {
  // O GSAP liga o ticker ao carregar; a cena renderiza sob demanda e o primeiro tween o religa.
  gsap.ticker.sleep();
  const position = new Vector3();
  const target = new Vector3();
  const fromPosition = new Vector3();
  const fromTarget = new Vector3();
  let view: ViewId = 'arrival';
  let orbit = 0;
  let tween: gsap.core.Tween | null = null;
  let settle: (() => void) | null = null;
  const progress = { value: 0 };

  const apply = (): void => {
    camera.position.copy(position);
    camera.lookAt(target);
    onChange();
  };
  const placeAtRest = (): void => {
    const destination = viewpointFor(view, camera.aspect);
    position.set(...orbitPosition(destination, orbit));
    target.set(...destination.target);
    apply();
  };
  const lerpTo = (value: Vec3, from: Vector3, into: Vector3, t: number): void => {
    into.set(
      from.x + (value[0] - from.x) * t,
      from.y + (value[1] - from.y) * t,
      from.z + (value[2] - from.z) * t,
    );
  };
  const interrupt = (): void => {
    if (tween) sleepTickerWhenIdle();
    tween?.kill();
    tween = null;
    settle?.();
    settle = null;
  };
  placeAtRest();

  return {
    get isMoving() {
      return tween !== null;
    },
    get view() {
      return view;
    },
    moveTo(next, durationS) {
      interrupt();
      view = next;
      orbit = 0;
      if (durationS <= 0) {
        placeAtRest();
        return Promise.resolve();
      }
      fromPosition.copy(position);
      fromTarget.copy(target);
      progress.value = 0;
      return new Promise((resolve) => {
        settle = resolve;
        tween = gsap.to(progress, {
          value: 1,
          duration: durationS,
          ease: 'power2.inOut',
          onUpdate: () => {
            const destination = viewpointFor(view, camera.aspect);
            lerpTo(destination.position, fromPosition, position, progress.value);
            lerpTo(destination.target, fromTarget, target, progress.value);
            apply();
          },
          onComplete: () => {
            tween = null;
            sleepTickerWhenIdle();
            placeAtRest();
            settle?.();
            settle = null;
          },
        });
      });
    },
    orbitBy(deltaRad) {
      if (tween) return;
      orbit = clampOrbit(orbit + deltaRad);
      placeAtRest();
    },
    refresh() {
      if (!tween) placeAtRest();
    },
    pause() {
      tween?.pause();
    },
    resume() {
      tween?.resume();
    },
    dispose() {
      interrupt();
    },
  };
}
