import { ESLint } from 'eslint';
import { expect, it } from 'vitest';

const eslint = new ESLint();

it.each([
  ['src/ui/experience.ts', "import { Scene } from 'three';"],
  ['src/ui/experience.ts', "void import('three');"],
  ['src/ui/experience.ts', "void import('@/experience/core/quality');"],
  ['src/experience/index.ts', "import '@/ui/experience';"],
  ['src/experience/index.ts', "void import('@/ui/experience');"],
  ['src/data/profile.ts', "import '@/experience';"],
  ['src/data/profile.ts', "void import('@/experience');"],
  ['src/data/profile.ts', "void import('@/ui/experience');"],
])(
  'rejects a forbidden dependency in %s: %s',
  async (filePath, source) => {
    const results = await eslint.lintText(source, { filePath });
    expect(
      results
        .flatMap((result) => result.messages)
        .some(
          (message) =>
            message.ruleId === 'no-restricted-imports' || message.ruleId === 'no-restricted-syntax',
        ),
    ).toBe(true);
  },
  20000,
);

it('allows the UI to load the public scene entry', async () => {
  const results = await eslint.lintText("void import('@/experience');", {
    filePath: 'src/ui/experience.ts',
  });
  expect(
    results
      .flatMap((result) => result.messages)
      .filter(
        (message) =>
          message.ruleId === 'no-restricted-imports' || message.ruleId === 'no-restricted-syntax',
      ),
  ).toEqual([]);
});
