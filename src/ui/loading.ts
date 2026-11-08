export interface LoadingState {
  /** O chunk da cena terminou de baixar. */
  readonly isCodeLoaded: boolean;
  /** Progresso informado por `onProgress` de `boot()`, de 0 a 1. */
  readonly sceneRatio: number;
  /** A bola já quicou o tempo mínimo pedido por Ruan (ADR 0008). */
  readonly hasWarmedUp: boolean;
}
export interface LoadingStep {
  readonly percent: number;
  /** Etapas concluídas, de 0 a 4. */
  readonly done: number;
  readonly label: string;
  readonly isComplete: boolean;
}

// Quatro etapas reais (ADR 0006): código da cena, campo montado, materiais compilados, primeiro quadro.
export const STEP_COUNT = 4;
const labels = [
  'Baixando o campo…',
  'Montando o campo…',
  'Preparando materiais e luzes…',
  'Acendendo os refletores…',
] as const;
// A bola quicando é chutada para dentro do campo no fechamento (ADR 0008).
const WARM_UP_LABEL = 'Aquecendo a bola…';
const FINAL_LABEL = 'Bola em jogo!';

export function loadingStep({ isCodeLoaded, sceneRatio, hasWarmedUp }: LoadingState): LoadingStep {
  const sceneSteps = Math.round(Math.min(Math.max(sceneRatio, 0), 1) * (STEP_COUNT - 1));
  const done = isCodeLoaded ? 1 + sceneSteps : 0;
  const isLoaded = done === STEP_COUNT;
  const isComplete = isLoaded && hasWarmedUp;
  const finalLabel = isComplete ? FINAL_LABEL : WARM_UP_LABEL;
  return {
    percent: Math.round((done / STEP_COUNT) * 100),
    done,
    label: isLoaded ? finalLabel : (labels[done] ?? labels[0]),
    isComplete,
  };
}
