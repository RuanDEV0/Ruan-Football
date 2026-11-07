import { hotspots } from './hotspots';

export const navigation = [
  ...hotspots
    .filter((hotspot) => hotspot.id !== 'goal')
    .map(({ label, route }) => ({ label, route })),
  { label: 'Formação', route: '/formacao' },
  { label: 'Contato', route: '/contato' },
  { label: 'Currículo', route: '/curriculo' },
] as const;
