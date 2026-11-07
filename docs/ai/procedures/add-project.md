# Procedimento — Adicionar ou atualizar um projeto

Use para criar ou revisar um estudo de caso em `src/content/projetos/`. Antes, leia `docs/ai/guides/content.md`.

1. **Reunir as fontes.** Liste o material recebido de Ruan: descrição, repositório, telas, métricas, autorização. Sem fonte, não há fato.
2. **Criar o arquivo** `src/content/projetos/<slug>.md`, com slug em `kebab-case` e sem acentos (ex.: `sirius.md`, `car-diagnosis-scheduling.md`).
3. **Preencher o frontmatter** conforme o schema (`src/content.config.ts`). Comece com `publishable: false`.
4. **Escrever o corpo** nas sete seções do guia de conteúdo. Em “Minha participação”, separe explicitamente o trabalho de Ruan do trabalho da equipe.
5. **Evidências:**
   - Backend: diagrama SVG em `src/assets/projetos/<slug>/` e exemplos de requisição e resposta em blocos de código com linguagem (`http`, `json`).
   - Com interface: capturas em `src/assets/projetos/<slug>/`, com `alt` descritivo.
   - Métricas sempre com o cenário de medição.
6. **Marcar lacunas** com `[[PENDENTE: …]]`. Não deixe seção vazia sem marcador.
7. **Destaque e ordem:** só altere `featured` e `order` conforme o plano, seção 7, ou por pedido de Ruan.
8. **Verificar:** `pnpm check` e `pnpm build`. Confira a página na prévia local (`pnpm dev`).
9. **Revisar** com `docs/ai/procedures/review-content.md`. Somente após a aprovação de Ruan mude para `publishable: true`.
10. **Relatar** as pendências e o que precisa de confirmação de Ruan.
