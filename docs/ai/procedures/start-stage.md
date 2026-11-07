# Procedimento — Iniciar ou continuar uma etapa

Use quando Ruan pedir para começar, continuar ou retomar uma etapa do plano (ex.: “inicie a etapa 2”).

1. **Ler a etapa.** Em `PLANO-IMPLEMENTACAO.md`, seção 4, leia Trabalho, Tarefas, Entrega, “Ruan providencia” e Validação. Leia também as seções do plano citadas na etapa.
2. **Conferir o estado.** Veja a seção “Estado atual” do `AGENTS.md`, o checklist da etapa e o repositório (`git status`, arquivos existentes). Identifique o que já foi feito.
3. **Conferir dependências.**
   - Etapas anteriores necessárias estão concluídas?
   - Os materiais que Ruan precisa providenciar (plano, seção 8) foram enviados? Se faltar algo bloqueante, liste e pergunte antes de começar. Se não for bloqueante, siga com `[[PENDENTE: …]]`.
4. **Ler os guias** das áreas que serão tocadas (`AGENTS.md`, “Mapa do repositório”).
5. **Apresentar o recorte.** Antes de editar, mostre em poucas linhas: tarefas que serão feitas agora, arquivos principais, o que fica para depois e qualquer decisão que não esteja no plano. Se houver decisão nova, pare e pergunte.
6. **Executar uma tarefa por vez** com `docs/ai/procedures/implement-change.md`: teste primeiro, implementação mínima, melhoria e `scripts/verify.sh`.
7. **Atualizar o checklist** da etapa no plano, marcando apenas o que foi concluído e verificado. Não altere o texto do plano.
8. **Verificar a entrega** com `docs/ai/procedures/verify-delivery.md`.
9. **Relatar:** o que foi entregue; como Ruan valida (itens de “Validação” da etapa); pendências e materiais necessários; o que não foi verificado.
10. **Não faça commit, push nem PR** sem pedido explícito.
