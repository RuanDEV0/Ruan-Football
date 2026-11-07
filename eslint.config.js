import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

const uiImports = {
  group: [
    'astro:*',
    '@/ui',
    '@/ui/**',
    '@/components/**',
    '@/layouts/**',
    '@/pages/**',
    '**/ui/**',
    '**/components/**',
    '**/layouts/**',
    '**/pages/**',
  ],
  message: 'A cena e os dados não dependem da interface (AGENTS.md).',
};
const deepRelative = { group: ['../../**'], message: 'Use o alias @/ para src/.' };

const dynamicSceneRule = {
  selector:
    'ImportExpression[source.value=/^(three|gsap)/], ImportExpression[source.value=/experience\\u002F.+/]',
  message: 'Carregue somente a API pública da cena, nunca seus detalhes internos.',
};
const dynamicUiRule = {
  selector:
    'ImportExpression[source.value=/^(astro:|.*\\u002F(ui|components|layouts|pages)\\u002F)/]',
  message: 'A cena não pode carregar módulos da interface.',
};

export default defineConfig(
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      '.lighthouseci/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.strictTypeChecked.map((config) => ({ ...config, files: ['**/*.ts'] })),
  ...astro.configs['flat/recommended'],
  ...astro.configs['jsx-a11y-recommended'],
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['src/experience/**/*.{ts,js}'],
    rules: {
      'no-restricted-syntax': ['error', dynamicUiRule],
      'no-restricted-imports': ['error', { patterns: [uiImports, deepRelative] }],
    },
  },
  {
    files: ['src/**/*.{ts,js,astro}'],
    ignores: ['src/experience/**'],
    rules: {
      'no-restricted-syntax': ['error', dynamicSceneRule],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            deepRelative,
            {
              group: [
                'three',
                'three/**',
                'gsap',
                'gsap/**',
                '@/experience/**',
                '**/experience/**',
              ],
              message: 'Use apenas boot() e os tipos da API pública da cena.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/{content,data}/**/*.ts', 'src/content.config.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        dynamicUiRule,
        dynamicSceneRule,
        {
          selector: "ImportExpression[source.value='@/experience']",
          message: 'Os dados não dependem da cena.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { ...uiImports, group: uiImports.group.filter((pattern) => pattern !== 'astro:*') },
            deepRelative,
            {
              group: [
                'three',
                'three/**',
                'gsap',
                'gsap/**',
                '@/experience',
                '@/experience/**',
                '**/experience/**',
              ],
              message: 'Os dados não dependem da cena.',
            },
          ],
        },
      ],
    },
  },
);
