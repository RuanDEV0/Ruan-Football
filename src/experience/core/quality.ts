import type { QualityProfile } from '@/lib/capabilities';
export const pixelRatioLimits = { high: 2, medium: 1.5, low: 1 } as const satisfies Record<
  QualityProfile,
  number
>;
