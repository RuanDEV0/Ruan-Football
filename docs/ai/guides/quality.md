# Guia — Qualidade, testes e CI

Áreas: `tests/`, `.github/workflows/`, `scripts/verify.sh`, configurações de ferramentas. Referências no plano: seções 3.8, 3.10, 3.11 e 9. Padrão de código e de testes: `docs/ai/guides/code-standards.md`.

## Ponto único de verificação

`scripts/verify.sh` é o mesmo comando para agentes, hook Stop e CI. Ele roda o que existe no momento e relata cada etapa como `ok`, `FALHOU` ou `pulado (motivo)`. Antes da Etapa 0, a aplicação aparece como `pulado`.

- Antes da aplicação, confere se o Node ativo corresponde ao `.nvmrc`. Com versão errada, falha com a instrução `nvm use` e não roda os comandos `pnpm`, cujo erro seria enganoso.
- Se `pnpm build` falhar, `test:e2e` e `test:performance` ficam `pulado`: o Lighthouse lê `dist/` e mediria o build anterior.
- Com Node divergente do `.nvmrc`, ativa a versão pelo nvm se ela estiver instalada; sem ela, falha indicando `nvm install`. Hooks e CI não herdam o `nvm use` do terminal. `scripts/processes.sh start` usa a mesma ativação (`scripts/lib/node.sh`) e avisa quando a versão não está instalada; o supervisor termina junto com o comando.
- Depois de um build bem-sucedido, `scripts/check-budgets.sh` mede em gzip o JS inicial (scripts das páginas e imports estáticos) e o código da cena (o restante); ultrapassar o orçamento é `FALHOU`.

| Modo                          | Uso                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `scripts/verify.sh`           | Fim de qualquer tarefa                                                                       |
| `scripts/verify.sh --full`    | Tarefas que tocam páginas, interface ou cena; inclui e2e e Lighthouse                        |
| `scripts/verify.sh --files …` | Hook Stop: ESLint nos arquivos alterados, testes relacionados do Vitest e harness, se tocado |

Novas verificações entram em `scripts/verify.sh`, com teste em `tests/harness/test-verify.sh`, nunca só na CI ou só num hook.

## Camadas de verificação

| Camada                     | Comando                               | Quando rodar                                                                                                                         |
| -------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Tipos                      | `pnpm check`                          | Toda mudança em código ou conteúdo                                                                                                   |
| Padrão de código           | `pnpm lint`                           | Toda mudança em código                                                                                                               |
| Unidade                    | `pnpm test`                           | Lógica: estados, perfis, dados, utilitários                                                                                          |
| Navegação e acessibilidade | `pnpm test:e2e`                       | Mudanças em páginas, interface ou integração com a cena                                                                              |
| Build                      | `pnpm build`                          | Antes de entregar qualquer tarefa                                                                                                    |
| Desempenho                 | Lighthouse CI (na CI)                 | Mudanças que afetam carregamento ou bundle                                                                                           |
| Documentação para IA       | `scripts/check-ai-docs.sh`            | Mudanças em `AGENTS.md`, `docs/`, `README.md` ou nos adaptadores; inclui referências quebradas em relatórios de etapa, ADRs e README |
| Assets e referências       | `scripts/check-assets.sh`             | Mudanças em `assets-src/`, `public/` ou `src/`                                                                                       |
| Orçamentos de bundle       | `scripts/check-budgets.sh`            | Após cada build, dentro de `scripts/verify.sh`                                                                                       |
| Capturas da cena           | `pnpm capture`                        | Ciclo visual de objetos, câmera e composição; inspeção, não asserção                                                                 |
| Harness                    | `tests/harness/run.sh` + `shellcheck` | Mudanças em `scripts/`, `.claude/hooks/` ou `tests/harness/`                                                                         |

## O que testar

- **Vitest (`tests/unit/`):** máquina de estados, escolha e queda de perfil de qualidade, coerência entre `hotspots.ts` e as rotas existentes, schemas de conteúdo, utilitários puros. Lógica que precisa de teste deve ser separada do Three.js.
- **Playwright (`tests/e2e/`):** Chromium, WebKit e Firefox, em viewport de computador e de celular.
  - Todas as rotas abrem e passam no axe sem violações sérias ou críticas.
  - Navegação completa só por teclado, incluindo abrir e fechar o painel.
  - Com WebGL desativado, menu e conteúdo funcionam e a apresentação alternativa aparece.
  - Com `prefers-reduced-motion`, não há chegada animada.
  - O vídeo não toca sozinho.
- **Harness (`tests/harness/`):** cada script e hook tem testes em fixture isolada (`make_fixture`), sem tocar no repositório real. O próprio runner é testado (`test-runner.sh`).
- **Não teste pixels da cena 3D** com captura de tela automatizada: o resultado é instável. Teste estados e eventos, incluindo geometria observável dos botões (dentro da cena, sem sobreposição, 44 px).
- **Cena no Playwright:** `scene-*.spec.ts` roda no Chromium de computador e no Chromium com celular emulado (toque); os demais motores ficam com navegação, axe, planta ilustrada e falha de WebGL.
- **Capturas para inspeção:** `pnpm capture` (`playwright.capture.config.ts`) salva imagens em `.captures/`, ignorada pelo Git. Servem ao ciclo visual; não são asserção.

## Orçamentos (plano, 3.11)

LCP ≤ 2,5 s · CLS ≤ 0,1 · JS inicial sem a cena ≤ 50 KB gzip · código da cena ≤ 250 KB gzip · modelos e texturas ≤ 3 MB · ≤ 100 draw calls · ≤ 150 mil triângulos · 60 FPS no computador e ≥ 30 estáveis no celular · vídeo 1080p ≤ 8 MB.

Com uma prévia aguardando validação na porta 4321, rode o e2e e as capturas em outra porta: `PREVIEW_PORT=4330 scripts/verify.sh --full` ou `PREVIEW_PORT=4330 pnpm capture`. O JS inicial e o código da cena são medidos separadamente por `scripts/check-budgets.sh`. Como a home imersiva carrega a cena na abertura (ADR 0006), o Lighthouse mede a soma dos dois (≤ 307.200 bytes).

Os valores serão revisados após a Etapa 2. Ultrapassou um orçamento: relate o número medido e a causa; não ajuste o limite por conta própria.

## CI (a partir da Etapa 0)

A CI em `.github/workflows/ci.yml` instala Node, pnpm e os navegadores, e roda `scripts/verify.sh --full` (harness, aplicação, e2e e Lighthouse). A configuração externa da hospedagem e a execução remota permanecem pendentes de autorização. As páginas locais já incluem `noindex`. A CI não publica em produção até a aprovação da Etapa 8.

## Relatório honesto

- Liste os comandos executados e os resultados reais.
- Separe o que foi verificado automaticamente, o que foi verificado manualmente e o que **não** foi verificado (por exemplo: “não testado em iPhone real”).
- Teste falhando é relatado como falha, com a saída relevante. Não desative, pule ou afrouxe um teste para fazer a CI passar sem autorização de Ruan.

## Encerramento do ciclo

Depois da validação explícita de Ruan, seguir `docs/ai/procedures/close-implementation.md` para encerrar os processos registrados no ciclo e confirmar o resultado. O Stop do agente não equivale à aprovação. Testes do gerenciador usam processos descartáveis em fixtures Linux, incluindo filhos órfãos, isolamento de ciclos, identidade de PID e encerramento forçado.
