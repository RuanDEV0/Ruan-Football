// Chute da chegada (ADR 0008): a bola chutada no carregamento atravessa o campo e entra no gol do
// ponto “Pênalti”. Trajetória estilizada da Etapa 2, não uma simulação física.
import { gsap } from 'gsap';
import { Vector3, type Object3D } from 'three';
import { sleepTickerWhenIdle } from '@/experience/core/ticker';
import { BALL_RADIUS_M, GOAL_DEPTH_M, landmarkPositions, type Vec3 } from './layout';

const [GOAL_X, , GOAL_LINE_Z] = landmarkPositions.goal;
// À frente da câmera da chegada nas composições larga e estreita.
const KICK_START: Vec3 = [5, 2.5, 50];
const NET_HIT: Vec3 = [GOAL_X + 0.6, 1.1, GOAL_LINE_Z - GOAL_DEPTH_M + BALL_RADIUS_M + 0.05];
const ARC_PEAK_M = 7;
// O restante do tempo é a queda da bola dentro da rede.
const FLIGHT_SHARE = 0.82;
const SPIN_TURNS = 6;
export const KICK_DURATION_S = 2.2;
const NET_BULGE_SCALE = 1.25;
const NET_BULGE_S = 0.12;

const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

function writeKickPosition(progress: number, into: Vector3): Vector3 {
  const u = Math.min(Math.max(progress, 0), 1);
  if (u <= FLIGHT_SHARE) {
    const t = u / FLIGHT_SHARE;
    return into.set(
      lerp(KICK_START[0], NET_HIT[0], t),
      lerp(KICK_START[1], NET_HIT[1], t) + 4 * ARC_PEAK_M * t * (1 - t),
      lerp(KICK_START[2], NET_HIT[2], t),
    );
  }
  const fall = (u - FLIGHT_SHARE) / (1 - FLIGHT_SHARE);
  return into.set(NET_HIT[0], lerp(NET_HIT[1], BALL_RADIUS_M, fall * fall), NET_HIT[2]);
}

/** Posição da bola, em metros, com `progress` de 0 (chute) a 1 (parada no fundo da rede). */
export function kickBallAt(progress: number): Vec3 {
  const { x, y, z } = writeKickPosition(progress, new Vector3());
  return [x, y, z];
}

export interface KickAnimation {
  play(): void;
  /** Leva a bola ao fundo da rede sem animação; usado por “Pular” e ao interromper a chegada. */
  finish(): void;
  pause(): void;
  resume(): void;
  dispose(): void;
}

export function createKickAnimation(
  ball: Object3D,
  net: Object3D | undefined,
  onFrame: () => void,
): KickAnimation {
  const progress = { value: 1 };
  let timeline: gsap.core.Timeline | null = null;
  const place = (): void => {
    writeKickPosition(progress.value, ball.position);
    ball.rotation.x = -progress.value * SPIN_TURNS * 2 * Math.PI;
    onFrame();
  };
  const stop = (): void => {
    if (timeline) sleepTickerWhenIdle();
    timeline?.kill();
    timeline = null;
  };
  return {
    play() {
      stop();
      progress.value = 0;
      place();
      timeline = gsap.timeline({
        onComplete: () => {
          timeline = null;
          sleepTickerWhenIdle();
        },
      });
      timeline.to(progress, {
        value: 1,
        duration: KICK_DURATION_S,
        ease: 'none',
        onUpdate: place,
      });
      if (net)
        timeline.to(
          net.scale,
          { z: NET_BULGE_SCALE, duration: NET_BULGE_S, yoyo: true, repeat: 1, onUpdate: onFrame },
          KICK_DURATION_S * FLIGHT_SHARE,
        );
    },
    finish() {
      stop();
      progress.value = 1;
      net?.scale.setZ(1);
      place();
    },
    pause() {
      timeline?.pause();
    },
    resume() {
      timeline?.resume();
    },
    dispose() {
      stop();
    },
  };
}
