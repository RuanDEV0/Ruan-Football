export type QualityProfile = 'high' | 'medium' | 'low';
export interface Capabilities {
  readonly hasWebGL: boolean;
  readonly saveData: boolean;
  readonly memoryGb?: number;
}
export function selectQuality(capabilities: Capabilities): QualityProfile | 'fallback' {
  if (!capabilities.hasWebGL) return 'fallback';
  if (capabilities.saveData || (capabilities.memoryGb ?? 4) < 4) return 'low';
  return (capabilities.memoryGb ?? 4) >= 8 ? 'high' : 'medium';
}
