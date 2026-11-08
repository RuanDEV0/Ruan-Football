import type { QualityProfile } from '@/lib/capabilities';

// Tetos de pixelRatio do plano 3.6.
export const pixelRatioLimits = { high: 2, medium: 1.5, low: 1 } as const satisfies Record<
  QualityProfile,
  number
>;
// Hipóteses da Etapa 2 (plano 3.11: 60 FPS no computador, 30 no celular), a revisar com a medição
// nos aparelhos de Ruan. O perfil baixo não tem para onde cair.
const FPS_DOWNGRADE_THRESHOLDS = { high: 45, medium: 30, low: 0 } as const satisfies Record<
  QualityProfile,
  number
>;
export const FPS_WINDOW_MS = 2000;
// Com renderização sob demanda, um intervalo maior que este é pausa, não lentidão.
const FRAME_GAP_MS = 250;

export function pixelRatioFor(profile: QualityProfile, devicePixelRatio: number): number {
  return Math.min(Math.max(devicePixelRatio, 1), pixelRatioLimits[profile]);
}

export function lowerQuality(profile: QualityProfile): QualityProfile | null {
  if (profile === 'high') return 'medium';
  if (profile === 'medium') return 'low';
  return null;
}

export function shouldDowngrade(profile: QualityProfile, averageFps: number): boolean {
  return averageFps < FPS_DOWNGRADE_THRESHOLDS[profile];
}

export interface FpsWindow {
  /** Devolve a média de FPS ao completar uma janela; caso contrário, null. */
  add(frameMs: number): number | null;
}

export function createFpsWindow(): FpsWindow {
  let elapsedMs = 0;
  let frames = 0;
  return {
    add(frameMs) {
      if (frameMs > FRAME_GAP_MS || frameMs <= 0) {
        elapsedMs = 0;
        frames = 0;
        return null;
      }
      elapsedMs += frameMs;
      frames += 1;
      if (elapsedMs < FPS_WINDOW_MS) return null;
      const average = (frames * 1000) / elapsedMs;
      elapsedMs = 0;
      frames = 0;
      return average;
    },
  };
}
