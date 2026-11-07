# 0002 — Versões compatíveis de TypeScript e ESLint

- **Status:** Aceita
- **Data:** 2026-11-06
- **Aprovação:** Ruan, nesta conversa

## Contexto

A Etapa 0 prevê as versões estáveis atuais. Na instalação, TypeScript 7 ultrapassava o suporte declarado pelo typescript-eslint (< 6.1), e ESLint 10 ultrapassava o suporte do eslint-plugin-jsx-a11y (até 9). Ruan aprovou exceções para manter o conjunto compatível.

## Decisão

Fixar TypeScript 6.0.3 e ESLint 9.39.5, com @eslint/js na mesma versão do ESLint e eslint-plugin-astro 1.7.0, cuja faixa de peer inclui ESLint 9. Manter os demais pacotes nas versões estáveis consultadas na instalação, fixados no lockfile. Node 26.13.0 e pnpm 12.18.0 compõem o ambiente reproduzível.

## Alternativas consideradas

| Opção                    | Vantagens                 | Desvantagens                                                                        |
| ------------------------ | ------------------------- | ----------------------------------------------------------------------------------- |
| TypeScript 7 e ESLint 10 | Versões mais novas        | Fora do suporte declarado dos plugins                                               |
| TypeScript 6 e ESLint 9  | Compatibilidade declarada | Atualização posterior necessária; ESLint 9 marcado como descontinuado pelo registro |

## Consequências

Atualizar quando os plugins declararem suporte, com verificações completas. Essas ferramentas não integram o JavaScript entregue ao visitante. A alternativa sem elas seria depender apenas do compilador do Astro e de revisão manual, reduzindo as garantias do plano.

A instalação também precisou alinhar o runtime transitivo de `@astrojs/astro2tsx` ao core 1.11.3 já fixado por ele: a seleção automática de runtime 2 beta causava erro ao importar `@astrojs/check`. A correção estreita está documentada em `pnpm-workspace.yaml`, sem código no bundle público.

O Puppeteer transitivo do Lighthouse recebe `proxy-agent` 8.0.1 em seu próprio escopo, compatível com o peer opcional de `@puppeteer/browsers`. Isso preserva a versão 6 usada pelo CLI do Lighthouse; `pnpm peers check` confirma a resolução sem conflitos.
