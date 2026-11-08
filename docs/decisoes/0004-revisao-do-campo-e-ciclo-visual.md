# 0004 — Revisão do campo e ciclo de validação visual

- **Status:** Aceita
- **Data:** 2026-11-07
- **Aprovação:** Ruan, nesta conversa, incluindo confirmação da disposição da entrada

## Contexto

Na avaliação do primeiro blockout, Ruan considerou o campo pequeno e distante. Pediu câmera próxima ao gramado, grama verde mais escura, maior distância entre os gols e elementos adicionais na entrada. Pediu também que o harness oriente ciclos de implementação e melhoria de objetos 3D antes da apresentação.

## Decisão

Ampliar o blockout da Etapa 2 com dois gols, entrada atrás de um deles, cadeiras, quiosque de bebidas com janela frontal e porta lateral, depósito de ferramentas/bolas e banheiro ao lado, futebol de sabão no trajeto e pula-pula pequeno mais próximo do campo. São representações provisórias, sem marcas; medidas e cores não especificadas são escolhas de composição, sujeitas à revisão.

Aplicar o ciclo de `docs/ai/procedures/implement-change.md` à validação visual: implementar, testar e inspecionar, registrar problemas com evidência e prioridade, corrigir e verificar novamente. A saída exige ausência de problemas bloqueantes conhecidos no escopo; limitações e dependências externas permanecem explicitamente registradas. Não significa garantia de ausência de erros.

## Alternativas consideradas

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| Manter a vista distante e composição anterior | Menor alteração | Não atende à avaliação de Ruan |
| Detalhar modelos finais agora | Maior fidelidade | Anteciparia o acabamento antes de validar o espaço |
| Revisar primitivas em ciclos | Permite avaliar espaço e legibilidade cedo | Ainda exige aprovação visual e testes reais |

## Consequências

Aumentar a área visível da cena, aproximar e baixar a câmera, compartilhar recursos para preservar os orçamentos e revisar capturas em computador e tela estreita. Não muda a stack, a API pública, os limites de desempenho ou as regras de autorização para Git e hospedagem.
