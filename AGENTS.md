# AGENTS.md — Portfólio Ruan Oliveira

Regras canônicas para qualquer agente de IA neste repositório (Claude Code, Codex, Gemini CLI, GitHub Copilot, Cursor e outros). Os arquivos específicos de cada ferramenta apenas apontam para este documento. **Em caso de conflito, este arquivo vence**; e o plano aprovado vence este arquivo em decisões de produto.

## Projeto

Portfólio de Ruan Oliveira (desenvolvimento backend, APIs e aplicações web, Boa Vista–RR), com um campo society 3D explorável sobre um site estático completo. O conteúdo profissional é HTML acessível; o 3D é uma camada opcional.

- **Fonte da verdade:** `docs/PLANO-IMPLEMENTACAO.md` (aprovado em 06/11/2026). Leia a seção relevante antes de agir.
  - Produto e experiência: seções 1, 2 e 5 a 7.
  - Arquitetura, stack, estrutura, configurações e orçamentos: seção 3.
  - Etapas e tarefas: seção 4. Decisões: seção 12. Riscos: seção 13.
- **Índice da documentação para IA:** `docs/ai/README.md`.

## Estado atual

**Etapa 0: concluída com a base local em 07/11/2026** (`docs/decisoes/0003-etapa-0-concluida-localmente.md`). Astro estático, páginas provisórias, schemas, cena de teste, testes e workflow de CI escritos; `scripts/verify.sh --full` passou localmente. Hospedagem, prévia por PR e execução remota da CI foram transferidas para antes da validação da Etapa 2 e dependem de autorização explícita para Git e hospedagem. **Etapa 1 em andamento:** a parte editorial foi iniciada com o material de Ruan: contatos e apresentação aplicados, roteiro e pendências em `docs/conteudo/etapa-1.md`; capturas de frontend serão fornecidas depois. Evidências de código e inspeção do vídeo recebidas em 07/11/2026: `docs/conteudo/evidencias-locais.md` e `docs/conteudo/video-penalti.md`; certificado AWS em rascunho na coleção. Aparência inicial do personagem definida com fotos de Ruan em 07/11/2026: `docs/conteudo/personagem.md` e folha `assets-src/referencias/folha-boneco.html`. Detalhes e pendências da Etapa 0 em `docs/etapa-0-verificacao.md`.

Ao concluir uma etapa, atualize esta seção.

## Stack

Astro (saída estática) · TypeScript `strict` · Three.js (`WebGLRenderer`) · GSAP · coleções de conteúdo com Zod · CSS nativo com tokens · pnpm · Node.js LTS · ESLint + Prettier · Vitest · Playwright + axe-core · Lighthouse CI · GitHub Actions · Cloudflare Pages. Detalhes e alternativas descartadas: plano, seções 3.2 e 3.3.

## Comandos

Disponíveis desde já:

```sh
scripts/verify.sh            # verificação única: harness + aplicação (o que existir)
scripts/verify.sh --full     # inclui e2e e Lighthouse
scripts/verify.sh --files A B   # só o que os arquivos afetam (usado pelo hook Stop)
tests/harness/run.sh [filtro]   # testes dos scripts e hooks
scripts/check-ai-docs.sh     # consistência desta documentação
scripts/check-assets.sh      # origem das referências, originais fora do Git, marcas
```

Disponíveis na base local (chamados por `scripts/verify.sh`):

```sh
pnpm install          # instalar dependências
pnpm dev              # servidor de desenvolvimento
pnpm check            # astro check + tipos
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm test             # Vitest
pnpm test:e2e         # Playwright + axe
pnpm build            # build estático em dist/
```

Os pipelines `pnpm assets:models` e `pnpm assets:video` ainda serão implementados com os materiais das respectivas etapas.

## Mapa do repositório

Estrutura completa no plano, seção 3.7. Resumo:

| Caminho                                                                   | Conteúdo                                          | Guia                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| `src/experience/`                                                         | Cena 3D em TypeScript puro                        | `docs/ai/guides/experience-3d.md`    |
| `src/content/`, `src/data/`                                               | Projetos, experiência, formação, perfil, hotspots | `docs/ai/guides/content.md`          |
| `src/pages/`, `src/components/`, `src/layouts/`, `src/ui/`, `src/styles/` | Páginas, interface e acessibilidade               | `docs/ai/guides/ui-accessibility.md` |
| `assets-src/`, `public/models/`, `public/video/`                          | Modelos, texturas e vídeo                         | `docs/ai/guides/assets.md`           |
| Todo código (`src/`, `scripts/`, `tests/`, `.claude/hooks/`)              | Padrão do código gerado, comentários e testes     | `docs/ai/guides/code-standards.md`   |
| `tests/`, `.github/workflows/`, `scripts/verify.sh`                       | Testes, verificação e CI                          | `docs/ai/guides/quality.md`          |
| `docs/decisoes/`                                                          | ADRs                                              | `docs/ai/procedures/create-adr.md`   |

**Leia o guia da área antes de editar arquivos dela.**

## Regras invioláveis

1. **Não invente fatos profissionais.** Datas, cargos, empresas, métricas, autoria, status de projeto e links vêm somente de material fornecido por Ruan. Quando faltar informação, escreva `[[PENDENTE: o que falta]]` e liste a pendência no relatório. Nunca preencha com um valor plausível.
2. **Material institucional não entra no Git sem autorização expressa.** Isso vale para o Sírius, a DPE/RR e qualquer cliente ou empregador, inclusive em commits temporários. Casos com autorização pendente usam `publishable: false`.
3. **Nenhum conteúdo depende do 3D.** Projetos, currículo e contato precisam funcionar sem WebGL, sem JavaScript da cena e sem assistir ao vídeo.
4. **Separação entre cena e interface.** `src/experience/` não importa de `src/ui/`, `src/components/` nem do Astro. A interface não importa `three` e conversa com a cena só pela API de `boot()` e pelos eventos tipados.
5. **Fonte única de dados.** Perfil, contatos, hotspots e projetos são definidos uma vez (`src/data/`, `src/content/`). Não copie esses dados para componentes, para a cena ou para testes.
6. **Git e publicação só com pedido explícito.** Não faça `commit`, `push`, PR, tag nem deploy, e não altere configurações da hospedagem, sem pedido explícito de Ruan na conversa atual.
7. **O plano aprovado não é editado por conta própria.** Marcar tarefas concluídas no checklist da etapa é permitido. Mudar escopo, stack ou decisões exige propor a mudança a Ruan e, se aprovada, registrar um ADR.
8. **Dependências novas precisam de justificativa:** o que resolvem, o peso no bundle e a alternativa sem a dependência. Dependência estrutural exige ADR.
9. **Originais ficam fora do Git e nunca são recomprimidos:** o vídeo original e as fotos pessoais. No repositório entram apenas versões otimizadas.
10. **Marcas de terceiros:** o Flamengo aparece apenas por cores, sem escudo nem nome em elementos visuais. O personagem é um “boneco articulado” próprio, sem nome, logotipo ou formato idêntico ao Playmobil, e os textos públicos não citam essa marca. Não reproduza cenário, componentes ou materiais de outros portfólios.
11. **Não atribua a Ruan experiência que ele não declarou**, por exemplo com Three.js, nem lugares ou memórias pessoais específicas ao campo.
12. **Segredos:** não leia nem grave `.env`. O site é estático; nenhuma chave privada é necessária.

## Convenções

- **Idioma:** identificadores, nomes de arquivos de código e mensagens de commit em **inglês**. Texto para o visitante, conteúdo, rotas públicas (`/projetos`, `/sobre`), documentação e ADRs em **pt-BR**, com acentuação correta.
- **TypeScript:** `strict`, sem `any` (use `unknown` e refine), sem `!` de non-null sem comentário justificando. Prefira tipos derivados dos dados (`as const satisfies`).
- **Nomes:** arquivos de código em `kebab-case.ts`; componentes Astro em `PascalCase.astro`; objetos interativos do Blender com prefixo `hs_`.
- **CSS:** use os tokens de `src/styles/tokens.css`; sem cores ou espaçamentos soltos.
- **Commits** (quando pedidos): Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`).
- **Branches:** `etapa-N/descricao-curta` ou `tipo/descricao-curta`.
- **Comentários:** nunca dizem o que o código faz. Só ligam o código ao projeto: cabeçalho de papel em arquivo essencial, decisão ou restrição externa, armadilha, diretiva com motivo, `TODO(etapa-N)`. Detalhes em `docs/ai/guides/code-standards.md`.
- **Mudanças pequenas e revisáveis.** Uma tarefa por vez, sem refatorações oportunistas fora do escopo.

## Definição de pronto

Uma tarefa só está pronta quando:

- [ ] Seguiu `docs/ai/procedures/implement-change.md`: teste escrito antes e visto falhando, implementação mínima, melhoria com testes verdes.
- [ ] `scripts/verify.sh` passa; `scripts/verify.sh --full` se tocou páginas, interface ou cena (teclado e cenário sem WebGL incluídos).
- [ ] Itens `pulado` foram relatados com o motivo.
- [ ] Os orçamentos da seção 3.11 do plano não foram ultrapassados, ou a ultrapassagem foi relatada.
- [ ] Nenhuma regra inviolável foi quebrada; as pendências `[[PENDENTE: …]]` estão listadas.
- [ ] O relatório final diz o que foi feito, o que foi verificado e o que **não** foi verificado, como teste em aparelho real.

Relate falhas como falhas. Não declare algo verificado sem ter executado a verificação.

## Procedimentos

Roteiros passo a passo, válidos para qualquer agente:

| Quando                                              | Procedimento                             |
| --------------------------------------------------- | ---------------------------------------- |
| Implementar qualquer mudança de código (padrão)     | `docs/ai/procedures/implement-change.md` |
| Iniciar ou continuar uma etapa do plano             | `docs/ai/procedures/start-stage.md`      |
| Adicionar ou atualizar um projeto ou estudo de caso | `docs/ai/procedures/add-project.md`      |
| Revisar textos profissionais antes de publicar      | `docs/ai/procedures/review-content.md`   |
| Registrar uma decisão técnica                       | `docs/ai/procedures/create-adr.md`       |
| Verificar uma entrega antes da validação de Ruan    | `docs/ai/procedures/verify-delivery.md`  |

## Manutenção desta documentação

- `AGENTS.md` é canônico. Os adaptadores (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.github/instructions/`, `.cursor/rules/`, `.claude/`) não repetem regras; apenas apontam para cá e para `docs/ai/`.
- Regras específicas de uma área ficam no guia da área, não aqui.
- Mantenha este arquivo abaixo de 16 KB: o Codex trunca instruções longas.
- Mudou um script, hook ou o próprio harness: teste em `tests/harness/` e `scripts/verify.sh` verde.
- Depois de mover ou renomear arquivos citados aqui, rode `scripts/check-ai-docs.sh`.
