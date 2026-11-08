import type { QualityProfile } from '@/lib/capabilities';

export interface DebugStats {
  readonly averageFps: number | null;
  readonly profile: QualityProfile;
  readonly pixelRatio: number;
  readonly drawCalls: number;
  readonly triangles: number;
}

const profileLabels = { high: 'alto', medium: 'médio', low: 'baixo' } as const satisfies Record<
  QualityProfile,
  string
>;
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export function formatDebugStats(stats: DebugStats): string {
  const fps = stats.averageFps === null ? 'medindo…' : decimal.format(stats.averageFps);
  return [
    `FPS médio ${fps}`,
    `perfil ${profileLabels[stats.profile]}`,
    `pixelRatio ${decimal.format(stats.pixelRatio)}`,
    `${integer.format(stats.drawCalls)} chamadas`,
    `${integer.format(stats.triangles)} triângulos`,
  ].join(' · ');
}
