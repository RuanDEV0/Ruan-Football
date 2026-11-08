# 0006 — Home imersiva, telas no campo e extensões do contrato da cena

- **Status:** Aceita; carregamento substituído pelos ADRs 0007 e 0008
- **Data:** 2026-11-07
- **Aprovação:** Ruan, nesta conversa

## Contexto

Ruan aprovou a navegação da Etapa 2 e pediu uma experiência no padrão de interação de um portfólio 3D de referência que conhece: página inteira ocupada pela cena, tela de carregamento temática com porcentagem, botão para começar e informações exibidas dentro do cenário. O plano previa a cena como seção opcional da home e o conteúdo em painel lateral. Na entrega anterior, `showOverview`, `hotspotButtons` e `debug` foram acrescentados ao contrato e aguardavam este registro.

Apenas o padrão de experiência é adotado. Código, textos, shaders, sons, modelos e identidade visual do portfólio de referência não são reproduzidos (regra 10 do `AGENTS.md`); o tema é o campo society e o conteúdo de Ruan.

## Decisão

1. **Home em tela cheia.** `/` ocupa a viewport com a cena. Nome, título e cidade continuam em HTML sobre a tela de carregamento e são o elemento de LCP. Em aparelho capaz, sem economia de dados e sem modo leve, a cena começa a carregar ao abrir a página; com economia de dados, só depois de “Entrar no campo”. Sem JavaScript, sem WebGL, em falha ou no modo leve, a mesma área mostra a planta ilustrada com os pontos como links. O menu permanente fica num botão “Menu” nativo (`details`), alcançável por teclado em qualquer estado.
2. **Carregamento “bola rumo ao gol”.** Faixa de gramado como barra de progresso, com a bola indo da marca do pênalti até a rede. O progresso conta etapas reais (código da cena, montagem do campo, compilação dos materiais, primeiro quadro), sem atrasos artificiais. Ao concluir, “Entrar em campo” inicia a chegada.
3. **Telas no campo.** Ao focar um ponto, o conteúdo aparece numa tela do próprio cenário: telão do placar (projetos), quadro tático junto ao banco (experiência e formação), placa ao lado do personagem (apresentação e contatos) e telão atrás do gol (o pênalti). As telas são HTML real posicionado em 3D (`CSS3DRenderer` do Three.js), renderizado no build pelos mesmos componentes das páginas, com link para a página completa. Substitui o painel lateral previsto para a Etapa 3.
4. **Contrato.** `Experience` ganha `showOverview()` e `start()`. `BootOptions` ganha `hotspotButtons`, `screens`, `onProgress` e `debug`. A interface continua sem importar `three`; a cena só posiciona elementos que a interface cria.

## Alternativas consideradas

| Opção                                      | Vantagens                                             | Desvantagens                                                       |
| ------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------ |
| Manter a cena como seção da home           | LCP e leitura imediatos, menos JavaScript na abertura | Não atende ao pedido de experiência imersiva                       |
| Tela cheia apenas após “Entrar no campo”   | Preserva a home do plano                              | Ruan preferiu a home inteira imersiva                              |
| Texto pintado em textura (`CanvasTexture`) | Integra-se à profundidade da cena                     | Invisível para leitor de tela, texto borrado e duplicação de dados |
| Painel lateral                             | Mais simples                                          | Menos imersivo; Ruan escolheu telas no cenário                     |

## Consequências

- O código da cena passa a ser baixado na abertura da home em aparelhos capazes. O orçamento de JS inicial sem a cena (≤ 50 KB) continua medido por `scripts/check-budgets.sh`. O Chrome do Lighthouse tem WebGL e soma a cena ao script da página (175.628 bytes medidos), acima da asserção anterior de 51.200 bytes. Ruan aprovou somar os dois orçamentos do plano: a asserção do Lighthouse passa a 307.200 bytes (50 KB + 250 KB), e os 50 KB sem a cena seguem garantidos por `scripts/check-budgets.sh`.
- Telas em CSS3D ficam sempre sobre o canvas, sem oclusão: só aparecem no ponto de vista do próprio objeto, com a câmera de frente para elas.
- Os resumos de projetos, experiência, apresentação, contatos e pênalti passam a ser componentes compartilhados entre páginas e telas.
- As páginas HTML continuam completas e acessíveis sem 3D (regra 3). O estado `loading` passa a aguardar `start()` antes da chegada.
- Atualizar o plano (seções 2, 3.3, 3.4, 3.5 e Etapas 2 e 3), o guia da cena e o de interface.
