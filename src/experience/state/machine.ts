export type ExperienceState =
  'entry' | 'loading' | 'arrival' | 'exploring' | 'focus' | 'panel' | 'paused' | 'fallback';
export type StateEvent =
  'load' | 'ready' | 'arrive' | 'skip' | 'focus' | 'open' | 'close' | 'pause' | 'resume' | 'error';

export function transition(state: ExperienceState, event: StateEvent): ExperienceState {
  if (event === 'error') return 'fallback';
  if (event === 'load' && (state === 'entry' || state === 'fallback')) return 'loading';
  if (event === 'ready' && state === 'loading') return 'exploring';
  if (event === 'arrive' && state === 'loading') return 'arrival';
  if (event === 'skip' && state === 'arrival') return 'exploring';
  if (event === 'focus' && state === 'exploring') return 'focus';
  if (event === 'open' && state === 'focus') return 'panel';
  if (event === 'close' && (state === 'panel' || state === 'focus')) return 'exploring';
  if (event === 'pause' && ['arrival', 'exploring', 'focus', 'panel'].includes(state))
    return 'paused';
  if (event === 'resume' && state === 'paused') return 'exploring';
  return state;
}
