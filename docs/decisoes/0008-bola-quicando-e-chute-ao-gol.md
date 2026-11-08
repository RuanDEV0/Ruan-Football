# 0008 — Bola quicando e chute ao gol na chegada

- **Status:** Aceita
- **Data:** 2026-11-08
- **Aprovação:** Ruan, nesta conversa

## Contexto

O ADR 0007 deixou quatro alternativas de carregamento para Ruan escolher: bola rumo ao gol, refletores, placar e linhas de giz. Ao avaliar a versão noturna, Ruan pediu uma quinta opção: a bola quicando durante o carregamento. Ao entrar no campo, ela vai longe, entra no campo e termina no gol, com uma transição que conte essa história.

## Decisão

1. **Carregamento único: bola quicando.** A bola quica sobre uma faixa de gramado que funciona como barra de progresso. A faixa avança pelas mesmas quatro etapas reais do ADR 0006. No fechamento, a frase é “Bola em jogo!” e a bola é chutada para longe: sobe, encolhe e some durante a pausa de 0,9 s. As quatro alternativas do ADR 0007, o parâmetro `?carregamento=` e a página `/carregamentos` saem do código.
2. **Chegada com chute ao gol.** A bola reaparece na cena à frente da câmera da chegada. Ela atravessa o campo em arco, passa por cima do alambrado da entrada e entra no gol do ponto “O pênalti”, onde a rede estufa. A câmera acompanha a bola até o gol (ponto de vista `kick`, 1,8 s) e sobe para a vista geral aprovada (1,5 s). Os refletores continuam acendendo durante a chegada.
3. **A bola fica na rede.** Ao fim da chegada, com “Pular” ou com movimento reduzido, a bola chutada fica parada no fundo do gol. A bola na marca do pênalti continua no lugar.
4. **Movimento reduzido:** sem quique, sem chute e sem perseguição. A chegada continua sendo um corte direto para a vista geral.
5. **Quique mínimo de 5 s.** Ao avaliar a versão, Ruan pediu que a bola quique por 5 s antes do chute. A barra continua mostrando só o progresso real. Se o carregamento terminar antes, ela fica em 100% com “Aquecendo a bola…” até completar 5 s desde o início do carregamento. Com movimento reduzido não há quique e não há espera. Nesse ponto, a decisão substitui o “sem atrasos artificiais” do ADR 0006 para a apresentação; a cena continua informando apenas as etapas reais.

A trajetória é estilizada: uma função pura em `src/experience/world/kick.ts`, coberta por testes que exigem a bola à frente da câmera no início, acima do alambrado, entrando entre as traves e parada dentro da rede. Não há simulação física nem dependência nova.

## Alternativas consideradas

| Opção                                               | Vantagens                                   | Desvantagens                                                           |
| --------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| Manter uma das quatro alternativas do 0007          | Já implementadas e testadas                 | Não atendem ao pedido de Ruan                                          |
| Bola quicando sem continuidade na cena              | Mais simples                                | A entrada no campo não conta a história do chute                       |
| Chute com física (biblioteca de colisão)            | Movimento realista                          | Dependência estrutural e peso no bundle sem ganho para uma cena de 2 s |
| Bola quicando e chute estilizado ao gol (escolhida) | Liga o carregamento à cena; sem dependência | A duração da chegada passa de 3 s para 3,3 s, hipótese a validar       |

## Consequências

- O ADR 0007 continua valendo, exceto pelas alternativas de carregamento e pela duração da chegada, substituídas por este.
- A entrada no campo leva pelo menos 5 s mais a pausa de 0,9 s do fechamento. “Ver projetos”, o menu e o modo leve continuam disponíveis durante o quique.
- Os testes e2e e as capturas avançam o relógio da página (`tests/e2e/field-clock.ts`) para não esperar os 5 s em tempo real.
- A chegada tem duas partes: perseguição e subida. “Pular” e `goTo` interrompem qualquer uma delas e deixam a bola na rede.
- Mais uma malha na cena (a bola chutada), dentro do orçamento de chamadas de desenho.
- `pnpm capture` passa a fotografar a chegada com relógio controlado, em instantes fixos, porque o Chromium sem GPU desenha quadros devagar demais para mostrar a bola em voo.
- A duração da chegada e a legibilidade da bola no celular dependem da avaliação de Ruan e da medição nos aparelhos.
