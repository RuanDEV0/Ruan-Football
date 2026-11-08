import { describe, expect, it } from 'vitest';
import {
  projectSchema,
  experienceSchema,
  educationSchema,
  certificationSchema,
} from '@/lib/content-schemas';
import { selectQuality } from '@/lib/capabilities';

const draft = {
  title: 'Exemplo fictício',
  summary: 'Apenas fixture',
  order: 0,
  featured: false,
  status: 'development',
  role: '[[PENDENTE: autoria]]',
  period: { start: '2026-11' },
  stack: ['Exemplo'],
  links: {},
  publishable: false,
};

describe('publication contract', () => {
  it('accepts unpublished drafts and rejects pending public claims', () => {
    expect(projectSchema.safeParse(draft).success).toBe(true);
    expect(projectSchema.safeParse({ ...draft, publishable: true }).success).toBe(false);
  });
  it('rejects invalid dates, reversed periods and unsafe links', () => {
    expect(projectSchema.safeParse({ ...draft, period: { start: '2026-13' } }).success).toBe(false);
    expect(
      projectSchema.safeParse({ ...draft, period: { start: '2026-11', end: '2025-01' } }).success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...draft, links: { demo: 'javascript:alert(1)' } }).success,
    ).toBe(false);
  });
  it('requires facts for experience, education and certifications', () => {
    for (const schema of [experienceSchema, educationSchema, certificationSchema]) {
      expect(schema.safeParse({ title: 'Exemplo', publishable: true }).success).toBe(false);
    }
  });
});

describe('optional scene', () => {
  it('uses fallback without WebGL and low quality for data saving', () => {
    expect(selectQuality({ hasWebGL: false, saveData: false, memoryGb: 8 })).toBe('fallback');
    expect(selectQuality({ hasWebGL: true, saveData: true, memoryGb: 8 })).toBe('low');
    expect(selectQuality({ hasWebGL: true, saveData: false, memoryGb: 4 })).toBe('medium');
    expect(selectQuality({ hasWebGL: true, saveData: false, memoryGb: 8 })).toBe('high');
  });
});

it('blocks pending text in the body of a public project', async () => {
  const { isPublishable } = await import('@/lib/publication');
  expect(isPublishable({ data: { publishable: false }, body: '[[PENDENTE: texto]]' })).toBe(false);
  expect(() =>
    isPublishable({ data: { publishable: true }, body: '[[PENDENTE: texto]]' }),
  ).toThrow();
  expect(isPublishable({ data: { publishable: true }, body: 'Conteúdo revisado.' })).toBe(true);
});
