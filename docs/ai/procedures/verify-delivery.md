# Procedimento — Verificar uma entrega

Use antes de apresentar uma tarefa ou etapa para a validação de Ruan. No Claude Code, a revisão do item 3 pode ser delegada ao subagente `delivery-reviewer`.

1. **Verificações automáticas**, na ordem, registrando o resultado de cada uma:

   ```sh
   scripts/verify.sh          # harness + check, lint, test, build
   scripts/verify.sh --full   # se tocou páginas, interface ou cena
   ```

   Antes da Etapa 0, a aplicação aparece como `pulado`. Relate cada `pulado` com o motivo em vez de omitir.

2. **Orçamentos.** Depois do build, meça o tamanho dos chunks de `dist/_astro/` (gzip) e dos arquivos de `public/models/` e `public/video/`. Compare com o plano, seção 3.11.

3. **Revisão da mudança** (`git diff`), contra:
   - As regras invioláveis do `AGENTS.md`.
   - O guia de cada área tocada.
   - Separação entre cena e interface: `src/experience/` sem imports de UI; UI sem import de `three`.
   - Dados duplicados fora de `src/data/` e `src/content/`.
   - `console.log`, código de depuração fora de `debug/`, `TODO` sem contexto.

4. **Verificação manual possível no ambiente:** abrir a prévia local, navegar por teclado, conferir com movimento reduzido e com WebGL desativado.

5. **Critérios da etapa.** Compare com a Validação da etapa (plano, seção 4) e com os critérios de conclusão (seção 9) que se aplicam.

6. **Relatório para Ruan:**
   - O que foi entregue e onde ver.
   - Resultado de cada verificação, com os números dos orçamentos.
   - O que **não** foi verificado (aparelho real, Safari no iOS, rede lenta…).
   - Pendências `[[PENDENTE: …]]` e perguntas.
   - Como Ruan valida: os passos concretos da Validação da etapa.
