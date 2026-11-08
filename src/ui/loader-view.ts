import type { LoadingStep } from './loading';

/** Aplica uma etapa real ao carregamento temático da home. */
export function showLoaderStep(root: HTMLElement, step: LoadingStep): void {
  root.style.setProperty('--progress', String(step.percent / 100));
  root.toggleAttribute('data-complete', step.isComplete);
  root.querySelector('[data-progressbar]')?.setAttribute('aria-valuenow', String(step.percent));
  const label = root.querySelector('[data-loader-step]');
  const percent = root.querySelector('[data-loader-percent]');
  if (label) label.textContent = step.label;
  if (percent) percent.textContent = `${String(step.percent)}%`;
}
