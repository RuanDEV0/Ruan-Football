// Modo ?debug (guia da cena, “Depuração”): carregado por import() dinâmico, fora do bundle normal.
// Serve à medição nos aparelhos de referência da Etapa 2, sem DevTools remoto.
import { formatDebugStats, type DebugStats } from './format';

export interface DebugPanel {
  show(stats: DebugStats): void;
  dispose(): void;
}

export function createDebugPanel(container: HTMLElement): DebugPanel {
  const element = document.createElement('p');
  element.className = 'scene-debug';
  element.dataset.testid = 'scene-debug';
  container.append(element);
  return {
    show(stats) {
      element.textContent = formatDebugStats(stats);
    },
    dispose() {
      element.remove();
    },
  };
}
