import { describe, expect, it } from 'vitest';
import { initialSnapshot, transition, type StateEvent } from '@/experience/state/machine';

function run(...events: StateEvent[]): string {
  return events.reduce(transition, initialSnapshot).state;
}

describe('experience state machine', () => {
  it('goes from entry through loading and arrival to exploring', () => {
    expect(run('load')).toBe('loading');
    expect(run('load', 'arrive')).toBe('arrival');
    expect(run('load', 'arrive', 'finish')).toBe('exploring');
  });

  it('moves between hotspot focus and the overview', () => {
    expect(run('load', 'arrive', 'finish', 'focus')).toBe('focus');
    expect(run('load', 'arrive', 'finish', 'focus', 'focus')).toBe('focus');
    expect(run('load', 'arrive', 'finish', 'focus', 'close')).toBe('exploring');
    expect(run('load', 'arrive', 'finish', 'focus', 'open', 'close')).toBe('exploring');
  });

  it('resumes into the state that was active before pausing', () => {
    expect(run('load', 'arrive', 'pause', 'resume')).toBe('arrival');
    expect(run('load', 'arrive', 'finish', 'focus', 'pause', 'resume')).toBe('focus');
    expect(run('load', 'arrive', 'finish', 'pause', 'pause', 'resume')).toBe('exploring');
  });

  it('ignores events that do not apply and recovers from failure only by loading again', () => {
    expect(run('resume')).toBe('entry');
    expect(run('focus')).toBe('entry');
    expect(run('load', 'focus')).toBe('loading');
    expect(run('load', 'arrive', 'focus')).toBe('arrival');
    expect(run('load', 'error')).toBe('fallback');
    expect(run('load', 'error', 'resume')).toBe('fallback');
    expect(run('load', 'error', 'load')).toBe('loading');
  });

  it('does not pause outside the running scene', () => {
    expect(run('pause')).toBe('entry');
    expect(run('load', 'pause')).toBe('loading');
  });
});
