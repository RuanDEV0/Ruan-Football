# Guia — Padrão do código gerado

Vale para todo código escrito ou alterado por agentes: `src/`, `scripts/`, `tests/`, `.claude/hooks/`. As regras de cada área (cena, interface, conteúdo) complementam este guia. O roteiro de trabalho que aplica estas regras é `docs/ai/procedures/implement-change.md`.

## Princípios

1. **O mínimo que resolve a tarefa.** Sem abstrações para casos futuros, sem opções que ninguém pediu, sem “já que estou aqui”.
2. **Siga o padrão existente** antes de criar um novo. Procure no repositório como algo parecido já foi feito.
3. **Núcleo puro, borda com efeitos.** Cálculos, decisões e transições ficam em funções puras e testáveis. DOM, WebGL, rede e tempo ficam numa camada fina em volta. Na cena, isso permite testar a lógica com Vitest sem WebGL.
4. **Código que se explica.** Nomes, tipos e testes dizem o que o código faz. Comentários só ligam o código ao projeto (seção “Comentários”).
5. **Falhe cedo e com contexto.** Erros esperados são tratados onde há o que fazer (ex.: falha de carregamento leva à apresentação alternativa). Erros inesperados não são engolidos.

## TypeScript

- `strict` e `noUncheckedIndexedAccess`. Proibido `any`: use `unknown` e refine com verificação de tipo.
- Funções exportadas com tipo de retorno explícito. API pública de `src/experience/` com TSDoc de contrato (seção “Comentários”).
- Estados como uniões discriminadas (`{ kind: 'loading', progress: number }`), não booleanos combinados. Literais `as const` em vez de `enum`.
- Dados imutáveis por padrão (`readonly`, `as const satisfies`).
- Proibidos sem justificativa em comentário: `!` (non-null), `as` para forçar tipo, `@ts-expect-error`. `@ts-ignore` é sempre proibido.
- Números com significado viram constantes nomeadas com unidade: `ARRIVAL_DURATION_MS`, `FIELD_LENGTH_M`, `FPS_DOWNGRADE_THRESHOLD`.

## Nomes

- Inglês no código; pt-BR em texto visível e conteúdo (`AGENTS.md`, Convenções).
- Booleanos com `is`, `has`, `should`, `can`. Funções com verbo. Unidades no nome quando houver (`Ms`, `Px`, `M`).
- Arquivos `kebab-case.ts`; componentes `PascalCase.astro`; testes `nome.test.ts` (unidade) e `nome.spec.ts` (e2e).

## Comentários

**Regra:** comentário nunca diz o que o código faz ou vai fazer. Isso é papel dos nomes, dos tipos e dos testes. Comentário existe somente para ligar o código ao projeto, quando essa ligação não está visível no próprio código.

**Permitido:**

| Tipo                     | Quando                                                                                                                                                                                                                                         | Exemplo                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Cabeçalho de papel       | Apenas em arquivos essenciais para o projeto: pontos de entrada, contratos, fontes únicas de dados, hooks, scripts de verificação, configurações centrais. Uma a três linhas sobre o papel do arquivo, quem depende dele e onde está a decisão | `// Contrato público da cena (plano 3.4). Mudanças exigem ADR.`    |
| Correlação com o projeto | Uma linha cujo motivo vem de fora do código: decisão do plano, ADR, orçamento, regra do `AGENTS.md`, limitação de navegador ou ferramenta                                                                                                      | `// Teto de pixelRatio do perfil médio: orçamento do plano 3.11.`  |
| Armadilha                | Comportamento não óbvio que levaria alguém a “corrigir” o código e quebrá-lo                                                                                                                                                                   | `# Não use if ( … ): dentro de uma condição o bash ignora set -e.` |
| Diretiva de ferramenta   | `eslint-disable`, `@ts-expect-error`, `shellcheck disable`, sempre na linha afetada e com o motivo na linha anterior                                                                                                                           | `// Motivo: tipo do three/examples incompleto.`                    |
| `TODO`                   | Somente no formato `TODO(etapa-N): o que falta e por quê`                                                                                                                                                                                      | `// TODO(etapa-4): trocar a cápsula pelo GLB do personagem.`       |

**Proibido:**

- Narrar passos: `// cria o renderer`, `// percorre os arquivos`, `# 1. Verifica os arquivos`.
- Repetir a assinatura em prosa: `// recebe o id e retorna o hotspot`.
- Banners de seção que só rotulam o que vem abaixo: `// --- Câmera ---`. Se o arquivo precisa de seções, ele precisa ser dividido.
- Cabeçalho em arquivo comum, que não seja essencial para o projeto.
- Código comentado; comentários de conversa ou histórico (“alterado a pedido”, “gerado por IA”, “antes era X”). O histórico fica no Git.
- TSDoc que descreve passos. Na API pública de `src/experience/`, o TSDoc registra apenas o contrato: unidades, pré-condições, eventos emitidos e erros.

**Teste rápido:** se o comentário continuaria verdadeiro com outro código fazendo a mesma coisa, ou se ele some quando o nome da função melhora, apague o comentário e melhore o nome.

## Marcas no código

- Sem `console.log` fora de `src/experience/debug/`.

## Imports e fronteiras

- Alias `@/` para `src/`. Sem caminhos relativos que subam mais de um nível (`../../`).
- Fronteiras aplicadas pelo ESLint a partir da Etapa 0 (`no-restricted-imports`):

  | Em                              | Não pode importar                                                 |
  | ------------------------------- | ----------------------------------------------------------------- |
  | `src/experience/**`             | `astro:*`, `@/ui/*`, `@/components/*`, `@/layouts/*`, `@/pages/*` |
  | Fora de `src/experience/`       | `three`, `three/*`, `gsap` (exceto pelo `boot()` público)         |
  | `src/content/**`, `src/data/**` | Qualquer módulo de interface ou da cena                           |

- Dependência nova: justificar no relatório o problema, o peso e a alternativa sem dependência (`AGENTS.md`, regra 8).

## Padronização automática (a partir da Etapa 0)

- **Prettier:** `printWidth: 100`, `singleQuote: true`, `trailingComma: 'all'`, `semi: true`, com `prettier-plugin-astro`. O hook do Claude Code formata cada arquivo editado.
- **ESLint:** `typescript-eslint` (`strictTypeChecked`), `eslint-plugin-astro` com regras de acessibilidade e as fronteiras acima. `--max-warnings 0`.
- **EditorConfig:** UTF-8, LF, 2 espaços (`.editorconfig`, já presente).
- Não reformate arquivos que a tarefa não tocou.

## Shell (scripts/, .claude/hooks/, tests/harness/)

- `#!/usr/bin/env bash`, `set -uo pipefail`; bash 4.4 ou superior.
- Cabeçalho com propósito e uso; `--help` imprime o cabeçalho.
- Todas as variáveis entre aspas; arrays para listas de arquivos; nada de `eval`.
- Códigos de saída: `0` sucesso, `1` verificação falhou, `2` uso incorreto.
- Hooks nunca quebram a sessão: dependência ausente leva a `exit 0` silencioso.
- Sem acesso à rede. Diretório de trabalho configurável (`--root`) para permitir teste em fixture.
- Limpo no `shellcheck` (configuração em `.shellcheckrc`).
- Testado em `tests/harness/`. Script novo, teste novo.

## Testes

| Tipo de mudança                              | Teste obrigatório                                              |
| -------------------------------------------- | -------------------------------------------------------------- |
| Lógica pura (estado, perfil, cálculo, dados) | Vitest em `tests/unit/`                                        |
| Página, componente ou interação              | Playwright + axe em `tests/e2e/`                               |
| Cena 3D                                      | Vitest da lógica extraída + Playwright dos estados e eventos   |
| Script ou hook                               | `tests/harness/test-*.sh`                                      |
| Conteúdo                                     | Schema (`pnpm check`) + `docs/ai/procedures/review-content.md` |
| Correção de bug                              | Teste que reproduz o bug antes da correção                     |

- Testes descrevem comportamento (`test_stop_never_blocks_twice`, `it('drops quality one level after sustained low fps')`), não implementação.
- Cada teste prepara seus próprios dados; nenhum depende da ordem de execução.
- Um teste que nunca falhou não prova nada: veja “Testar o teste” no procedimento.
