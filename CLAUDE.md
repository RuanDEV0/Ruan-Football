# CLAUDE.md

As regras deste projeto valem para todos os agentes e ficam em `AGENTS.md`, importado abaixo. Este arquivo contém apenas o que é específico do Claude Code.

@AGENTS.md

## Específico do Claude Code

- **Guias por área:** `.claude/rules/` carrega o guia correspondente ao caminho editado. Se a regra não carregar, leia o guia indicado no “Mapa do repositório”.
- **Skills (atalhos dos procedimentos):** `/implement-change <descrição>`, `/start-stage <N>`, `/add-project <slug>`, `/review-content [caminho]`, `/create-adr <título>`, `/verify-delivery`.
- **Subagentes somente leitura:**
  - `content-reviewer`: confere textos profissionais contra as regras editoriais.
  - `delivery-reviewer`: avalia arquitetura, acessibilidade e orçamentos de uma mudança.

  Use-os quando Ruan pedir revisão ou ao final de uma etapa; não os acione para tarefas pequenas.
- **Permissões** (`.claude/settings.json`): `git commit` e `git push` sempre pedem confirmação, e isso não substitui a regra 6 do `AGENTS.md`. Só proponha commit se Ruan pedir.
- **Hooks** (`.claude/hooks/`):
  - `format-file.sh`: formata com Prettier cada arquivo editado (a partir da Etapa 0).
  - `track-edit.sh`: registra os arquivos editados na sessão.
  - `verify-on-stop.sh`: ao encerrar a resposta, roda `scripts/verify.sh --files` nesses arquivos. Se falhar, devolve a falha uma vez para você corrigir ou relatar. Não substitui `scripts/verify.sh` completo no fim de uma tarefa.
- **Preferências pessoais:** `CLAUDE.local.md` e `.claude/settings.local.json`, ambos fora do Git.
