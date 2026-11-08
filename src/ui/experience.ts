// Ponte entre a home imersiva e a cena opcional (ADR 0006): só usa a API de boot() e os eventos
// tipados (AGENTS.md, regra 4). Sem a cena, a planta ilustrada e o menu continuam como caminho principal.
import type { Experience } from '@/experience';
import { hotspots, type HotspotId } from '@/data/hotspots';
import { selectQuality, type QualityProfile } from '@/lib/capabilities';
import { loadingStep } from './loading';
import { showLoaderStep } from './loader-view';

type DeviceNavigator = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
type StageMode = 'intro' | 'loading' | 'ready' | 'playing' | 'illustration';

const stage = document.querySelector<HTMLElement>('[data-stage]');
const container = document.querySelector<HTMLElement>('[data-scene]');
const enter = document.querySelector<HTMLButtonElement>('[data-enter]');
const light = document.querySelector<HTMLButtonElement>('[data-light]');
const status = document.querySelector<HTMLElement>('[data-status]');
const statusText = document.querySelector<HTMLElement>('[data-status-text]');
const loader = document.querySelector<HTMLElement>('[data-loader]');
const hotspotLayer = document.querySelector<HTMLElement>('[data-hotspot-layer]');
const skip = document.querySelector<HTMLButtonElement>('[data-skip]');
const overviewButtons = document.querySelectorAll<HTMLButtonElement>('[data-overview]');
const hotspotButtons = new Map<HotspotId, HTMLButtonElement>();
const screens = new Map<HotspotId, HTMLElement>();
for (const { id } of hotspots) {
  const button = document.querySelector<HTMLButtonElement>(`[data-hotspot="${id}"]`);
  const screen = document.querySelector<HTMLElement>(`[data-screen="${id}"]`);
  if (button) hotspotButtons.set(id, button);
  if (screen) screens.set(id, screen);
}
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Pausa no fechamento do carregamento antes de entrar em campo (ADR 0007): o visitante vê a bola ser
// chutada para longe, e ela reaparece na chegada (ADR 0008); com movimento reduzido, a entrada é imediata.
const FINISH_HOLD_MS = reducedMotion ? 0 : 900;
// Quique mínimo pedido por Ruan antes do chute, mesmo quando o carregamento real termina antes (ADR
// 0008); sem animação, com movimento reduzido, não há o que esperar.
const MIN_BOUNCE_MS = reducedMotion ? 0 : 5000;
let bounceStartMs = 0;
let experience: Experience | undefined;
let isLoading = false;
let isLight = false;
let focused: HotspotId | null = null;
let hasEnterIntent = false;
let beginTimer = 0;

// Função, não leitura direta: o visitante pode ativar o modo leve durante os awaits do carregamento.
function isLightMode(): boolean {
  return isLight;
}

// A região viva fica fora da apresentação, que se oculta durante o jogo; a cópia visível não anuncia.
function announce(message: string): void {
  if (status) status.textContent = message;
  if (statusText) statusText.textContent = message;
}

function setStageMode(mode: StageMode): void {
  if (stage) stage.dataset.mode = mode;
  if (mode !== 'loading' && mode !== 'ready' && mode !== 'playing')
    delete document.documentElement.dataset.sceneAuto;
  if (container)
    container.dataset.mode = mode === 'intro' || mode === 'illustration' ? 'illustration' : 'scene';
  if (enter) enter.hidden = mode === 'loading' || mode === 'ready' || mode === 'playing';
  if (hotspotLayer) {
    hotspotLayer.hidden = mode !== 'loading' && mode !== 'ready' && mode !== 'playing';
    if (mode !== 'playing') hotspotLayer.toggleAttribute('data-arriving', true);
  }
  if (mode !== 'playing') {
    if (skip) skip.hidden = true;
    closeScreen();
  }
  if (mode !== 'ready') window.clearTimeout(beginTimer);
}

function remainingBounceMs(): number {
  return Math.max(Math.ceil(bounceStartMs + MIN_BOUNCE_MS - performance.now()), 0);
}

function showProgress(isCodeLoaded: boolean, sceneRatio: number): void {
  const hasWarmedUp = remainingBounceMs() === 0;
  if (loader) showLoaderStep(loader, loadingStep({ isCodeLoaded, sceneRatio, hasWarmedUp }));
}

function closeScene(): void {
  experience?.dispose();
  experience = undefined;
}

function closeScreen(): void {
  if (focused) {
    const screen = screens.get(focused);
    if (screen) screen.hidden = true;
  }
  focused = null;
  if (container) container.dataset.view = 'overview';
  for (const button of hotspotButtons.values()) button.removeAttribute('aria-current');
}

function focusHotspot(id: HotspotId): void {
  const hotspot = hotspots.find((item) => item.id === id);
  if (!experience || !hotspot || stage?.dataset.mode !== 'playing') return;
  closeScreen();
  focused = id;
  hotspotButtons.get(id)?.setAttribute('aria-current', 'true');
  if (container) container.dataset.view = 'focus';
  announce(`Vista de ${hotspot.label}.`);
  void experience.goTo(id).then(() => {
    if (focused !== id) return;
    const screen = screens.get(id);
    if (!screen) return;
    screen.hidden = false;
    screen.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  });
}

function showOverview(): void {
  if (!experience || !focused) return;
  const origin = hotspotButtons.get(focused);
  closeScreen();
  announce('Visão geral do campo.');
  void experience.showOverview().then(() => {
    if (!focused) origin?.focus({ preventScroll: true });
  });
}

function fallBack(message: string): void {
  closeScene();
  setStageMode('illustration');
  announce(message);
}

function setLight(value: boolean): void {
  isLight = value;
  light?.setAttribute('aria-pressed', String(value));
  if (value) fallBack('Modo leve ativo. Use a planta do campo ou o menu.');
  try {
    localStorage.setItem('light-mode', String(value));
  } catch {
    /* Preferência opcional em navegadores com armazenamento bloqueado. */
  }
}

function connect(scene: Experience): void {
  scene.on('arrival:done', () => {
    const hadSkipFocus = document.activeElement === skip;
    if (skip) skip.hidden = true;
    hotspotLayer?.removeAttribute('data-arriving');
    if (hadSkipFocus) hotspotButtons.values().next().value?.focus({ preventScroll: true });
  });
  scene.on('hotspot:select', focusHotspot);
  scene.on('hotspot:hover', (id) => {
    for (const [buttonId, button] of hotspotButtons)
      button.toggleAttribute('data-hover', buttonId === id);
  });
  scene.on('quality:downgrade', (profile) => {
    if (container) container.dataset.quality = profile;
  });
  scene.on('error', () => {
    fallBack(
      'A cena foi interrompida. Continue pela apresentação leve, com a planta do campo, ou tente entrar novamente.',
    );
  });
}

function detectQuality(): QualityProfile | 'fallback' {
  const device: DeviceNavigator = navigator;
  const context = document.createElement('canvas').getContext('webgl2');
  context?.getExtension('WEBGL_lose_context')?.loseContext();
  return selectQuality({
    hasWebGL: Boolean(context),
    saveData: device.connection?.saveData ?? false,
    memoryGb: device.deviceMemory,
  });
}

async function load(): Promise<void> {
  if (!container || isLoading || experience) return;
  isLoading = true;
  if (enter) enter.disabled = true;
  try {
    const quality = detectQuality();
    if (quality === 'fallback') throw new Error('WebGL2 indisponível.');
    setStageMode('loading');
    bounceStartMs = performance.now();
    showProgress(false, 0);
    announce('Preparando o campo…');
    const { boot } = await import('@/experience');
    if (isLightMode()) return;
    showProgress(true, 0);
    const scene = await boot(container, {
      quality,
      reducedMotion,
      hotspotButtons,
      screens,
      debug: new URLSearchParams(location.search).has('debug'),
      onProgress: (ratio) => {
        showProgress(true, ratio);
      },
    });
    await new Promise((resolve) => setTimeout(resolve, remainingBounceMs()));
    if (isLightMode()) {
      scene.dispose();
      return;
    }
    showProgress(true, 1);
    experience = scene;
    connect(scene);
    if (document.hidden) scene.pause();
    setStageMode('ready');
    announce('Campo provisório carregado. Entrando em campo…');
    beginTimer = window.setTimeout(beginWhenVisible, FINISH_HOLD_MS);
  } catch {
    fallBack(
      'A cena não está disponível. Continue pela apresentação leve, com a planta do campo, ou tente entrar novamente.',
    );
  } finally {
    isLoading = false;
    if (enter) enter.disabled = false;
  }
}

// Sem foco automático na entrada sozinha: ela termina a qualquer momento e não pode tirar o visitante
// do link “Pular para o conteúdo” nem de onde estiver no teclado. Só quem pediu “Entrar no campo”
// recebe o foco em “Pular chegada”.
function begin(): void {
  if (!experience || stage?.dataset.mode !== 'ready') return;
  setStageMode('playing');
  if (skip) skip.hidden = reducedMotion;
  if (reducedMotion) hotspotLayer?.removeAttribute('data-arriving');
  experience.start();
  const target = reducedMotion ? hotspotButtons.values().next().value : skip;
  if (hasEnterIntent) target?.focus({ preventScroll: true });
  hasEnterIntent = false;
}

function beginWhenVisible(): void {
  if (!document.hidden) {
    begin();
    return;
  }
  document.addEventListener('visibilitychange', beginWhenVisible, { once: true });
}

for (const control of [enter, light]) if (control) control.hidden = false;
try {
  isLight = localStorage.getItem('light-mode') === 'true';
} catch {
  /* Preferência opcional em navegadores com armazenamento bloqueado. */
}
light?.setAttribute('aria-pressed', String(isLight));
if (isLight) setStageMode('illustration');
else if (document.documentElement.dataset.sceneAuto !== undefined) void load();

light?.addEventListener('click', () => {
  setLight(!isLight);
});
enter?.addEventListener('click', () => {
  hasEnterIntent = true;
  setLight(false);
  void load();
});
skip?.addEventListener('click', () => {
  experience?.skipArrival();
});
for (const button of overviewButtons) button.addEventListener('click', showOverview);
for (const [id, button] of hotspotButtons)
  button.addEventListener('click', () => {
    focusHotspot(id);
  });
container?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') showOverview();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) experience?.pause();
  else experience?.resume();
});
window.addEventListener('pagehide', () => {
  closeScene();
});
