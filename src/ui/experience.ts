import type { Experience } from '@/experience';
import { selectQuality } from '@/lib/capabilities';

type DeviceNavigator = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
const container = document.querySelector<HTMLElement>('[data-scene]');
const enter = document.querySelector<HTMLButtonElement>('[data-enter]');
const light = document.querySelector<HTMLButtonElement>('[data-light]');
const status = document.querySelector<HTMLElement>('[data-status]');
let experience: Experience | undefined;
let isLoading = false;
let isLight = false;

function isLightMode(): boolean {
  return isLight;
}

function announce(message: string): void {
  if (status) status.textContent = message;
}
function setLight(value: boolean): void {
  isLight = value;
  light?.setAttribute('aria-pressed', String(value));
  if (value) {
    experience?.dispose();
    experience = undefined;
    announce('Modo leve ativo. O conteúdo está disponível pelo menu.');
  }
  try {
    localStorage.setItem('light-mode', String(value));
  } catch {
    /* Preferência opcional em navegadores com armazenamento bloqueado. */
  }
}
try {
  setLight(localStorage.getItem('light-mode') === 'true');
} catch {
  /* Preferência opcional em navegadores com armazenamento bloqueado. */
}
light?.addEventListener('click', () => {
  setLight(!isLight);
});

enter?.addEventListener('click', () => {
  const start = async (): Promise<void> => {
    if (!container || isLoading || experience) return;
    isLoading = true;
    enter.disabled = true;
    setLight(false);
    announce('Preparando a cena de teste…');
    try {
      const device: DeviceNavigator = navigator;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2');
      if (!context) throw new Error('WebGL2 indisponível.');
      context.getExtension('WEBGL_lose_context')?.loseContext();
      const { boot } = await import('@/experience');
      if (isLightMode()) return;
      const quality = selectQuality({
        hasWebGL: true,
        saveData: device.connection?.saveData ?? false,
        memoryGb: device.deviceMemory,
      });
      if (quality === 'fallback') return;
      experience = await boot(container, {
        quality,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      });
      if (isLightMode()) {
        experience.dispose();
        experience = undefined;
        return;
      }
      if (document.hidden) experience.pause();
      experience.on('error', () => {
        experience?.dispose();
        experience = undefined;
        announce(
          'A cena foi interrompida. Continue pela apresentação leve ou tente entrar novamente.',
        );
      });
      announce('Cena de teste carregada. Projetos e informações continuam disponíveis pelo menu.');
    } catch {
      experience?.dispose();
      experience = undefined;
      announce(
        'A cena não está disponível. Continue pela apresentação leve ou tente entrar novamente.',
      );
    } finally {
      isLoading = false;
      enter.disabled = false;
    }
  };
  void start();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) experience?.pause();
  else experience?.resume();
});
window.addEventListener('pagehide', () => {
  experience?.dispose();
  experience = undefined;
});
