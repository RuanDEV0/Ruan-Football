# 0007 — Imersão total no campo noturno

- **Status:** Aceita; alternativas de carregamento e duração da chegada substituídas pelo ADR 0008
- **Data:** 2026-11-08
- **Aprovação:** Ruan, nesta conversa

## Contexto

Ao avaliar a home imersiva do ADR 0006, Ruan pediu:

- alternativas de carregamento;
- entrada automática no campo depois do carregamento, com animação;
- todas as informações e interações dentro do campo, e não em HTML por cima da cena;
- um fundo mais sofisticado, no padrão do portfólio de referência;
- pontos de clique melhores que retângulos com texto.

O objetivo declarado é que o visitante entre numa imersão completa e se interesse pelo projeto.

O plano já previa o campo noturno (seção 3.3, “assar a iluminação dos refletores”) e proíbe pós-processamento antes de medição (guia da cena). Do portfólio de referência vêm apenas o padrão de experiência: cena sobre fundo escuro, objetos que reagem ao ponteiro e informação nas superfícies do cenário. Código, textos, shaders, modelos e identidade visual não são reproduzidos (regra 10 do `AGENTS.md`).

## Decisão

1. **Noite e diorama.** O campo fica sobre uma base espessa que flutua num fundo noturno. A cena tem:
   - névoa e estrelas;
   - halos nos refletores;
   - feixes de luz com cor por vértice e mistura aditiva;
   - uma mancha de luz sobre o gramado.

   Não há pós-processamento. As luzes dinâmicas continuam sendo uma direcional, que vem do refletor mais próximo do personagem, e uma hemisférica. Uma vinheta em CSS completa o enquadramento.

2. **Refletores acendem na chegada.** As quatro torres acendem em sequência durante os 3 s da chegada. Com movimento reduzido, já estão acesas.
3. **Informação no campo:**
   - placas de LED à beira do gramado mostram nome, título e cidade, vindos de `src/data/profile.ts`;
   - as telas dos quatro pontos exibem em repouso um cartão aceso com o rótulo de `src/data/hotspots.ts`, que substitui os dígitos “00:00” do placar.

   Os textos são pintados em canvas 2D com a fonte do sistema, sem arquivo novo. Continuam no HTML (título da página, resumos e páginas completas) para leitores de tela, para a busca e para a navegação sem 3D (regra 3).

4. **Entrada automática.** Ao terminar o carregamento, a home mostra o fechamento da animação por 0,9 s e entra em campo sozinha; com movimento reduzido, a entrada é imediata. O botão “Entrar em campo” sai. O foco não se move na entrada automática. Quem pediu “Entrar no campo” pelo teclado recebe o foco em “Pular chegada” ou, com movimento reduzido, no primeiro ponto.
5. **Interações no campo:**
   - os pontos viram marcadores com pictograma próprio e nome em letreiro, sem caixa de botão;
   - foco ou ponteiro sobre o marcador acende o cartão e o halo no chão do objeto, e o ponteiro sobre o objeto no canvas faz o mesmo;
   - “Voltar ao campo” fica dentro de cada tela, ao lado do link para a página completa, e substitui o botão “Visão geral” da barra inferior;
   - o cabeçalho com o menu fica fora de vista durante a cena e reaparece ao receber o foco do teclado.

   Continuam visíveis apenas “Usar modo leve” e “Pular chegada”.

6. **Alternativas de carregamento, até Ruan escolher.** Quatro alternativas, todas guiadas pelas mesmas etapas reais do ADR 0006:
   - “bola rumo ao gol”, a atual e padrão;
   - “refletores acendendo”;
   - “placar eletrônico”, com contagem regressiva até o apito inicial;
   - “linhas de giz”.

   A home aceita `?carregamento=<id>`. Em `pnpm dev`, `/carregamentos` mostra todas lado a lado, com etapas simuladas só para comparação. Depois da escolha, as outras saem do código.

7. **Telas posicionadas em 2D.** O `CSS3DRenderer` do ADR 0006 sai: no Chrome, nenhum elemento dentro do contexto 3D dele recebia cliques, nem o link “Ir para …”. Como cada tela só aparece com a câmera parada de frente para ela, a cena projeta o centro e a largura da tela e aplica `translate` e `scale` planos ao HTML. Para manter a câmera de frente, a órbita limitada passa a valer só na vista geral. O contrato da cena não muda.

## Alternativas consideradas

| Opção                                        | Vantagens                  | Desvantagens                                                           |
| -------------------------------------------- | -------------------------- | ---------------------------------------------------------------------- |
| Bloom com `EffectComposer`                   | Brilho mais fiel           | Pós-processamento sem medição, custo alto no Moto G30 (guia da cena)   |
| Luzes pontuais nos quatro refletores         | Iluminação real            | Excede o limite de luzes dinâmicas; a iluminação final será assada     |
| Texto 3D com fonte em JSON (`TextGeometry`)  | Volume real                | Arquivo de fonte e triângulos extras; nitidez pior que canvas          |
| Remover o HTML da home                       | Imersão “pura”             | Quebra a regra 3, o LCP e o acesso por leitor de tela                  |
| Manter o `CSS3DRenderer` com camada clicável | Inclinação real em órbita  | Cliques não chegam aos elementos no Chrome; exigiria contornos frágeis |
| “Entrar em campo” como gesto obrigatório     | Visitante decide o momento | Ruan pediu a entrada automática após a animação                        |

## Consequências

- A cena ganha `world/atmosphere.ts`, `world/signage.ts`, `world/sign-painter.ts` e `core/ticker.ts`, e perde o `CSS3DRenderer` e os dígitos do placar.
- O ticker do GSAP passa a dormir quando nenhuma animação está ativa. Antes, a página seguia pedindo cerca de 28 quadros por segundo depois da chegada, mesmo parada.
- O e2e passou a verificar:
  - que os links e botões das telas recebem o clique;
  - que a cena para de pedir quadros também após a chegada completa;
  - que o cabeçalho reaparece com o teclado;
  - o fechamento de cada alternativa de carregamento.
- As configurações do Playwright aceitam `PREVIEW_PORT`, para testes e capturas não disputarem a porta da prévia que aguarda validação.
- Atualizar o plano (seções 2, 3.3, 3.4 e 3.5 e Etapa 2), o guia da cena, o de interface e o de qualidade.
- Fica pendente a escolha do carregamento por Ruan e a medição no Moto G30 e no Vaio FE16 com `?debug`, agora com halos, feixes e placas.
