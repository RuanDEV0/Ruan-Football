import { gsap } from 'gsap';

/**
 * A cena renderiza sob demanda (guia da cena, “Desempenho”), mas o ticker do GSAP segue pedindo
 * quadros depois que a última animação termina. Chamado ao fim de cada tween; o próximo tween o religa.
 */
export function sleepTickerWhenIdle(): void {
  // Depois do quadro atual: o tween que acabou ainda está na linha do tempo durante o onComplete.
  setTimeout(() => {
    if (gsap.globalTimeline.getChildren(true, true, true).length === 0) gsap.ticker.sleep();
  }, 0);
}
