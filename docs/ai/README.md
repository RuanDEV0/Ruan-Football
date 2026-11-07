# Documentação para agentes de IA

Este diretório reúne o contexto que os agentes de IA usam neste projeto. A regra central é **uma fonte, vários adaptadores**: as regras ficam em `AGENTS.md` e nos guias abaixo, e cada ferramenta recebe apenas um arquivo fino que aponta para elas.

## Estrutura

```text
AGENTS.md                         # regras canônicas (todas as ferramentas)
docs/ai/
├── README.md                     # este índice
├── guides/                       # regras por área do código
│   ├── experience-3d.md          # src/experience/
│   ├── content.md                # src/content/, src/data/
│   ├── ui-accessibility.md       # páginas, componentes, interface
│   ├── assets.md                 # modelos, texturas, vídeo, imagens
│   ├── code-standards.md         # padrão do código gerado, comentários, testes
│   └── quality.md                # testes, CI, desempenho
└── procedures/                   # roteiros passo a passo
    ├── implement-change.md       # padrão: teste → implementação → melhoria → verificação
    ├── start-stage.md
    ├── add-project.md
    ├── review-content.md
    ├── create-adr.md
    └── verify-delivery.md
```

## Como cada ferramenta recebe o contexto

| Ferramenta | Arquivo lido automaticamente | Contexto por área | Roteiros |
| --- | --- | --- | --- |
| **Claude Code** | `CLAUDE.md` (importa `AGENTS.md`) | `.claude/rules/*.md`, carregadas pelo caminho do arquivo editado | Skills em `.claude/skills/` (`/implement-change`, `/start-stage`, `/add-project`, `/review-content`, `/create-adr`, `/verify-delivery`) e subagentes em `.claude/agents/` |
| **Codex** (CLI, IDE e nuvem) | `AGENTS.md` | Tabela “Mapa do repositório” do `AGENTS.md` | Tabela “Procedimentos” do `AGENTS.md` |
| **Gemini CLI** | `GEMINI.md` (importa `AGENTS.md`) | Igual ao Codex | Igual ao Codex |
| **GitHub Copilot** (chat, revisão e agente) | `.github/copilot-instructions.md`; o agente também lê `AGENTS.md` | `.github/instructions/*.instructions.md` (`applyTo`) | Igual ao Codex |
| **Cursor** | `AGENTS.md` | `.cursor/rules/*.mdc` (`globs`) | Igual ao Codex |
| Outras (Aider, Windsurf, Zed…) | Configure a ferramenta para ler `AGENTS.md` | — | — |

## Configuração do Claude Code (`.claude/`)

| Arquivo | Função |
| --- | --- |
| `settings.json` | Permissões compartilhadas: libera os comandos de verificação; pede confirmação para `git commit`, `git push`, `pnpm add` e deploy; bloqueia `.env` e `push --force`; liga os hooks |
| `hooks/format-file.sh` | PostToolUse: Prettier no arquivo editado (a partir da Etapa 0) |
| `hooks/track-edit.sh` | PostToolUse: registra os arquivos editados na sessão em `.claude/.state/` |
| `hooks/verify-on-stop.sh` | Stop: roda `scripts/verify.sh --files` nos arquivos editados; em falha, devolve ao agente uma única vez |
| `rules/` | Lembretes por caminho que remetem aos guias |
| `skills/` | Atalhos para os procedimentos |
| `agents/content-reviewer.md` | Subagente que confere textos contra as regras editoriais, sem editar |
| `agents/delivery-reviewer.md` | Subagente que avalia acessibilidade, desempenho e arquitetura de uma mudança, sem editar |

Preferências pessoais ficam em `.claude/settings.local.json` e `CLAUDE.local.md`, ambos fora do Git.

## Como manter

1. Mudou uma regra geral: edite `AGENTS.md`.
2. Mudou uma regra de área: edite o guia em `guides/`. Os adaptadores não mudam.
3. Criou uma área nova: crie o guia, adicione-o ao mapa do `AGENTS.md` e crie os adaptadores escopados (`.claude/rules/`, `.github/instructions/`, `.cursor/rules/`).
4. Criou um procedimento: adicione-o à tabela do `AGENTS.md` e, se útil, crie a skill correspondente em `.claude/skills/`.
5. Mudou um script ou hook: escreva ou ajuste o teste em `tests/harness/` primeiro.
6. Rode `scripts/verify.sh` antes de considerar a mudança pronta.

## Verificação do próprio harness

| Peça | Função |
| --- | --- |
| `scripts/verify.sh` | Ponto único de verificação para agentes, hook Stop e CI; relata cada etapa como `ok`, `FALHOU` ou `pulado` |
| `scripts/check-ai-docs.sh` | Arquivos obrigatórios, imports, tamanho do `AGENTS.md`, adaptadores por guia, frontmatter e referências |
| `tests/harness/` | Testes de scripts e hooks em fixtures isoladas, inclusive do próprio runner |
| `.shellcheckrc`, `.editorconfig` | Padrão de shell e de formatação |
| `.github/workflows/ci.yml` | Roda `scripts/verify.sh` em cada PR (com `shellcheck`) |
