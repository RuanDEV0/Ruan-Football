// Transições centralizadas da cena (plano 3.5); nenhum outro módulo altera o estado diretamente.
export type ExperienceState =
  'entry' | 'loading' | 'arrival' | 'exploring' | 'focus' | 'panel' | 'paused' | 'fallback';
export type StateEvent =
  'load' | 'arrive' | 'finish' | 'focus' | 'open' | 'close' | 'pause' | 'resume' | 'error';

type ActiveState = Extract<ExperienceState, 'arrival' | 'exploring' | 'focus' | 'panel'>;
export interface Snapshot {
  readonly state: ExperienceState;
  readonly resumeTo: ActiveState | null;
}

export const initialSnapshot: Snapshot = { state: 'entry', resumeTo: null };

function isActive(state: ExperienceState): state is ActiveState {
  return state === 'arrival' || state === 'exploring' || state === 'focus' || state === 'panel';
}

function nextState(state: ExperienceState, event: StateEvent): ExperienceState {
  if (event === 'error') return 'fallback';
  if (event === 'load' && (state === 'entry' || state === 'fallback')) return 'loading';
  if (event === 'arrive' && state === 'loading') return 'arrival';
  if (event === 'finish' && state === 'arrival') return 'exploring';
  if (event === 'focus' && state === 'exploring') return 'focus';
  if (event === 'open' && state === 'focus') return 'panel';
  if (event === 'close' && (state === 'panel' || state === 'focus')) return 'exploring';
  return state;
}

export function transition(snapshot: Snapshot, event: StateEvent): Snapshot {
  const { state, resumeTo } = snapshot;
  if (event === 'pause') return isActive(state) ? { state: 'paused', resumeTo: state } : snapshot;
  if (event === 'resume')
    return state === 'paused' && resumeTo ? { state: resumeTo, resumeTo: null } : snapshot;
  const next = nextState(state, event);
  return next === state ? snapshot : { state: next, resumeTo: null };
}
