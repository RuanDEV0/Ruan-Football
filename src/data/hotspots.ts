// Mapeamento único entre a navegação HTML e os objetos interativos (plano 3.4).
interface Hotspot {
  readonly id: string;
  readonly label: string;
  readonly route: string;
  readonly object: string;
}
export const hotspots = [
  { id: 'scoreboard', label: 'Projetos', route: '/projetos', object: 'hs_placar' },
  { id: 'bench', label: 'Experiência e formação', route: '/experiencia', object: 'hs_banco' },
  { id: 'character', label: 'Sobre o Ruan', route: '/sobre', object: 'hs_personagem' },
  { id: 'goal', label: 'O pênalti', route: '/sobre#penalti', object: 'hs_gol' },
] as const satisfies readonly Hotspot[];
export type HotspotId = (typeof hotspots)[number]['id'];
