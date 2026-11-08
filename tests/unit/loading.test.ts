import { describe, expect, it } from 'vitest';
import { loadingStep } from '@/ui/loading';

describe('football loading screen', () => {
  it('advances only on real loading steps, from download to the kicked ball', () => {
    expect(loadingStep({ isCodeLoaded: false, sceneRatio: 0, hasWarmedUp: false })).toEqual({
      percent: 0,
      done: 0,
      label: 'Baixando o campo…',
      isComplete: false,
    });
    expect(loadingStep({ isCodeLoaded: true, sceneRatio: 0, hasWarmedUp: false })).toMatchObject({
      percent: 25,
      done: 1,
      label: 'Montando o campo…',
    });
    expect(
      loadingStep({ isCodeLoaded: true, sceneRatio: 1 / 3, hasWarmedUp: false }),
    ).toMatchObject({
      percent: 50,
      label: 'Preparando materiais e luzes…',
    });
    expect(
      loadingStep({ isCodeLoaded: true, sceneRatio: 2 / 3, hasWarmedUp: false }),
    ).toMatchObject({
      percent: 75,
      label: 'Acendendo os refletores…',
    });
    expect(loadingStep({ isCodeLoaded: true, sceneRatio: 1, hasWarmedUp: true })).toEqual({
      percent: 100,
      done: 4,
      label: 'Bola em jogo!',
      isComplete: true,
    });
  });

  it('never reports progress beyond the steps that actually finished', () => {
    expect(loadingStep({ isCodeLoaded: false, sceneRatio: 1, hasWarmedUp: true }).percent).toBe(0);
    expect(loadingStep({ isCodeLoaded: true, sceneRatio: 7, hasWarmedUp: true }).percent).toBe(100);
    expect(loadingStep({ isCodeLoaded: true, sceneRatio: -1, hasWarmedUp: true }).percent).toBe(25);
  });

  it('keeps the ball bouncing at 100% until the minimum bounce time, without kicking it', () => {
    expect(loadingStep({ isCodeLoaded: true, sceneRatio: 1, hasWarmedUp: false })).toEqual({
      percent: 100,
      done: 4,
      label: 'Aquecendo a bola…',
      isComplete: false,
    });
    expect(loadingStep({ isCodeLoaded: true, sceneRatio: 2 / 3, hasWarmedUp: true })).toMatchObject(
      { percent: 75, isComplete: false },
    );
  });
});
