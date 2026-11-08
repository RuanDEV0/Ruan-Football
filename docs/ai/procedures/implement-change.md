# Procedimento — Implementar, testar e melhorar uma mudança

Roteiro padrão para qualquer código gerado por agente: funcionalidade, correção, script ou configuração. Aplica as regras de `docs/ai/guides/code-standards.md`. Para uma etapa inteira, `docs/ai/procedures/start-stage.md` chama este roteiro a cada tarefa.

## 1. Entender e delimitar

- Leia o guia da área e o guia de padrão de código.
- Encontre no repositório como algo parecido já foi feito e siga esse padrão.
- Escreva os **critérios de aceite** como frases verificáveis (“com WebGL desativado, o menu abre a página de projetos”). Se não for possível escrevê-los, falta informação: pergunte.
- Liste os casos de borda: entrada inválida, arquivo ausente, dependência não instalada, sem WebGL, movimento reduzido, tela de 320 px, rede lenta.

## 2. Teste primeiro (vermelho)

- Escreva o teste de cada critério antes do código (tipo de teste conforme a tabela do guia).
- Rode e **confirme que falha pelo motivo esperado**, não por erro de digitação ou import.
- Para correção de bug: o teste reproduz o bug primeiro.

## 3. Implementação mínima (verde)

- Escreva o menor código que faz os testes passarem, seguindo o padrão.
- Rode os testes da área a cada passo pequeno, não só no final.

## 4. Melhorar com os testes verdes (refatorar)

- Nomes, duplicação, funções longas, lógica pura misturada com efeitos, números soltos.
- Comentários que narram o código: apague e melhore o nome no lugar.
- Remova o que não é usado. Não acrescente funcionalidade nesta fase.
- Testes continuam verdes após cada mudança.

## 4.1 Ciclo de validação de objetos e cenas 3D

Obrigatório ao criar ou revisar objetos, composição, materiais ou câmera, inclusive no blockout da Etapa 2. Pedido de Ruan registrado em `docs/decisoes/0004-revisao-do-campo-e-ciclo-visual.md`.

1. **Implementar** um incremento com critérios observáveis e testes prévios de comportamento.
2. **Validar** testes e capturas reais da cena em tela larga e estreita: `pnpm capture` gera em `.captures/` a planta ilustrada, a chegada, a vista geral e cada ponto de vista em 1280 × 900 e 360 × 800 (fora de `test-results/`, que o Playwright limpa). Inspecionar escala, enquadramento, legibilidade, sobreposição, orientação, contato com o solo, acessos, descarte e orçamento de renderização. Um teste verde não aprova a aparência.
3. **Mapear** no relatório da etapa cada problema: identificador, evidência, impacto, prioridade (bloqueante, relevante ou refinamento), correção proposta e estado (aberto, corrigido ou depende de validação externa). Separar defeitos de melhorias opcionais e de tarefas futuras já planejadas.
4. **Melhorar** dentro do escopo autorizado. Corrigir os bloqueantes e relevantes que forem reproduzíveis no ambiente; adicionar regressão quando houver comportamento testável. Decisões novas de produto ou ampliação de escopo voltam a Ruan.
5. **Revalidar** os testes afetados e novas capturas após cada correção. Se surgir outro defeito, voltar ao mapeamento. Rodar `scripts/verify.sh --full` sobre a versão final.
6. **Apresentar** quando não restarem problemas bloqueantes ou relevantes conhecidos que possam ser corrigidos no escopo e ambiente disponíveis. Listar explicitamente qualquer dependência externa, refinamento remanescente e teste não realizado. Nunca declarar “zero erros” com base só nos testes ou repetir verificações sem mudança ou preocupação concreta.

Se o navegador ou a captura estiver indisponível, registrar a limitação e não declarar validação visual concluída. Aprovação subjetiva e medição no aparelho físico continuam pertencendo à validação de Ruan.

## 5. Testar o teste

- Introduza um defeito deliberado no código (inverta uma condição, remova uma linha, quebre a fixture) e confirme que algum teste falha. Desfaça o defeito.
- Se nenhum teste falhar, o teste é fraco: corrija-o.
- Exemplo real deste projeto: o runner `tests/harness/run.sh` executava os testes dentro de `if ( … )`, o que desliga `set -e`. Testes passavam com o script testado inexistente. O problema só apareceu porque testes de funcionalidades ainda não implementadas estavam “passando”. Hoje `tests/harness/test-runner.sh` protege contra isso.

## 6. Verificar

```sh
scripts/verify.sh            # harness + check, lint, test, build
scripts/verify.sh --full     # inclui e2e: obrigatório se tocou páginas, interface ou cena
```

- Leia a saída inteira. `pulado` não é `ok`: relate o motivo.
- No Claude Code, o hook Stop roda `scripts/verify.sh --files` nos arquivos editados e devolve a falha antes de encerrar a resposta. Ele não substitui a verificação completa.
- Nunca desative, pule ou afrouxe um teste ou regra para passar.

## 7. Autorrevisão do diff

Leia `git diff` como revisor, não como autor:

- [ ] Cada linha alterada é necessária para a tarefa.
- [ ] Nenhuma regra inviolável do `AGENTS.md` foi quebrada.
- [ ] Fronteiras de import respeitadas; nenhum dado duplicado fora de `src/data/` e `src/content/`.
- [ ] Sem `any`, `@ts-ignore`, `console.log`, código comentado, `TODO` fora do formato.
- [ ] Nenhum comentário narra o que o código faz; cabeçalhos só em arquivos essenciais (guia de padrão de código, “Comentários”).
- [ ] Casos de borda do passo 1 têm teste ou estão relatados como não cobertos.
- [ ] Mensagens visíveis em pt-BR; código em inglês.

Para mudanças grandes ou fim de etapa, use também o subagente `delivery-reviewer` (Claude Code) ou `docs/ai/procedures/verify-delivery.md`.

## 8. Relatar

- O que mudou e por quê, em poucas linhas.
- Testes criados, com a confirmação de que falharam antes e passam agora.
- Saída resumida de `scripts/verify.sh`, incluindo o que ficou `pulado` e o motivo.
- O que não foi verificado e os riscos que restam.
- Sem commit, push ou PR sem pedido explícito.

## 9. Encerrar após a validação de Ruan

Durante o ciclo, registrar processos persistentes com `scripts/processes.sh start --cycle ID -- COMANDO`. Depois da validação explícita de Ruan, executar `approve` e `close` para o mesmo ciclo, conforme `docs/ai/procedures/close-implementation.md`. No Claude Code, o hook Stop consome a marca de aprovação. Não fechar a prévia antes da avaliação; relatar qualquer processo que não tenha sido encerrado.
