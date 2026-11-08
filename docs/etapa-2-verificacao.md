# Etapa 2 — Campo provisório

Iniciada em 07/11/2026. Primeiro incremento: composição estática com primitivas, substituindo o cubo da fundação. A etapa permanece em andamento.

## Direção confirmada

Ruan escolheu seguir a composição do plano: campo society compacto e fictício, banco lateral, placar e gol. Informou Moto G30 e notebook Vaio FE16 como aparelhos disponíveis para avaliação. Configurações de memória, GPU e navegadores ainda não foram informadas; não se presume um perfil de desempenho a partir do nome do aparelho.

A Etapa 1 continua com revisão editorial e aprovação da identidade pendentes em `docs/conteudo/etapa-1.md` e `docs/conteudo/personagem.md`. Esses pontos não impedem este blockout; não foram marcados como concluídos.

## Implementado

- Campo com marcações, alambrado simplificado, placar, banco, gol, bola e cápsula provisória para o personagem em `src/experience/world/field.ts`.
- Objetos dos futuros hotspots identificados pelos nomes de `src/data/hotspots.ts`.
- Geometrias e materiais compartilhados; postes instanciados; uma luz hemisférica e uma direcional, sem sombras nem texturas externas.
- Câmera fixa com enquadramento ajustado à proporção do container, incluindo tela estreita.
- Renderização sob demanda e descarte idempotente dos recursos. Nenhuma dependência nova.

## Verificação

Os dois novos testes de unidade falharam primeiro por ausência dos elementos e de geometria. Após implementação, passaram. Uma mutação deliberada removendo a liberação de uma geometria fez o teste falhar; o código foi restaurado e os testes passaram novamente.

Os testes verificam a presença dos elementos, nomes compartilhados, descarte único de geometrias e materiais e limites estruturais de até 100 chamadas de desenho e 150 mil triângulos. Isso não substitui a medição de GPU em aparelhos reais.

Capturas locais em Chromium inspecionadas em viewports de 1280 × 900 e 360 × 800: campo inteiro visível nos dois enquadramentos. A primeira tentativa foi bloqueada pelo sandbox; a inspeção foi executada fora dele após autorização da ferramenta.

Build inicial: cena opcional com 133.297 bytes gzip somando os chunks de Three.js e da cena, abaixo de 250 KB; entrada da interface com 1.787 bytes gzip, abaixo de 50 KB. Sem modelos, texturas ou vídeos adicionados.

A primeira execução completa encontrou uma tipagem insegura no teste (corrigida com refinamento de tipo) e bloqueios do sandbox ao iniciar servidor/navegador. A reexecução de `scripts/verify.sh --full` fora do sandbox terminou com todas as etapas em `ok`: documentação, assets, sintaxe shell, ShellCheck, harness, versão do Node, tipos, lint, 17 testes unitários, build, Playwright e Lighthouse. Nenhuma etapa foi pulada. O Playwright inclui teclado, páginas sem JavaScript, ausência de WebGL, movimento reduzido, persistência do modo leve e montagem/descarte repetidos com perda de contexto. A renderização 3D automatizada usa Chromium com GPU emulada; não mede o desempenho dos aparelhos de Ruan.

## Próximos incrementos e validação

- [[PENDENTE: chegada GSAP com Pular, pontos de vista guiados e botões HTML projetados]].
- [[PENDENTE: adaptação automática de qualidade e medição de FPS nos aparelhos de referência]].
- [[PENDENTE: apresentação alternativa ilustrada do campo]]. O menu e as páginas HTML continuam acessíveis sem WebGL.
- Composição e enquadramento revisados aprovados por Ruan após a correção das fachadas. Executar `pnpm dev`, abrir a URL indicada e selecionar Entrar no campo; alternar para Usar modo leve e conferir o menu.
- [[PENDENTE: autorização explícita para Git e hospedagem antes da validação externa da Etapa 2]], conforme `docs/decisoes/0003-etapa-0-concluida-localmente.md` e regra 6 do AGENTS.md.

Não foram verificados Moto G30, Vaio FE16, Safari/iOS físico, aquecimento, consumo, memória de GPU, rede móvel real ou CI remota. Não houve commit, push ou deploy. A navegação na cena ainda não está implementada; este incremento entrega apenas a composição inicial.

## Revisão após avaliação de Ruan — 07/11/2026

Ruan confirmou a disposição da área de entrada. Escopo registrado em `docs/decisoes/0004-revisao-do-campo-e-ciclo-visual.md` e na Etapa 2 do plano. O campo passou de 28 para 40 metros de comprimento na escala provisória, com dois gols. Essa medida é uma escolha de protótipo, não uma dimensão real fornecida por Ruan.

Adicionados quiosque sem marcas (janela frontal, balcão, bebidas genéricas e porta lateral), depósito, banheiro, cadeiras, caminho de entrada, futebol de sabão e pula-pula. A abertura do alambrado foi alinhada ao caminho. As construções e equipamentos ficam fora do gramado e não invadem o trajeto. A grama usa verde mais escuro.

A área da cena passou de 20rem para altura responsiva entre 30rem e 44rem. O enquadramento deixou de ser calculado pela esfera de toda a base; usa composição mais próxima e mais baixa no computador, e composição frontal na tela estreita. A vista atual ainda é geral; a aproximação de cada objeto integra os pontos de vista guiados pendentes da Etapa 2.

### Mapa do ciclo visual

| ID  | Evidência e impacto                                                                 | Prioridade  | Correção e estado                                                                                      |
| --- | ----------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| V01 | Ruan relatou campo pequeno e distante; cena tinha somente 320px de altura           | Relevante   | Área de cena ampliada e câmera revisada; corrigido tecnicamente, conforto depende da avaliação de Ruan |
| V02 | Campo curto e apenas um gol no primeiro protótipo                                   | Relevante   | Comprimento ampliado e segundo gol adicionado; teste de regressão verde                                |
| V03 | Primeira captura da revisão cortava o futebol de sabão                              | Relevante   | Alvo da câmera ajustado; nova captura mostra o objeto completo                                         |
| V04 | Cadeiras entre construções e campo ficavam ocultas                                  | Relevante   | Cadeiras reposicionadas à frente do quiosque; nova captura confirma visibilidade                       |
| V05 | Novos blocos aumentariam o número de chamadas de desenho                            | Relevante   | Blocos agrupados por material e conjunto em instâncias; teste de orçamento e descarte verde            |
| V06 | Caminho poderia ser ocupado por construções ou equipamentos                         | Relevante   | Teste de separação espacial protege o trajeto; passou                                                  |
| V07 | Lint detectou refinamento inseguro de Group no agrupamento                          | Relevante   | Type guard explícito; lint da área passou                                                              |
| V08 | Formas básicas ainda não detalham redes, interiores, ferramentas e materiais finais | Refinamento | Acabamento posterior; não representa defeito de funcionamento deste blockout                           |

Não restam defeitos bloqueantes ou relevantes reproduzidos sem correção neste incremento. A avaliação de proximidade e semelhança continua externa, assim como os testes físicos no Moto G30 e Vaio FE16. Não há garantia de ausência de erros.

### Evidências da revisão

- O teste novo de ampliação do campo falhou antes da mudança; o teste Playwright da área de visualização também falhou antes da alteração de altura.
- Quatro testes de campo passaram, incluindo presença, limites de geometria, descarte, disposição dos equipamentos e caminho livre. A mutação de comprimento de volta para 28 fez a regressão falhar; restaurado o código, todos passaram.
- Capturas Chromium de 1280 × 900 e 360 × 800 foram inspecionadas em três ciclos de enquadramento. São evidências locais temporárias, não assets do site.
- Nenhuma dependência nova. Blocos compartilham materiais/geometrias; cada InstancedMesh também é liberado no descarte.
- `scripts/verify.sh --full` passou integralmente após esta revisão, sem etapas puladas: documentação, assets, shell, ShellCheck, harness, versão do Node, check, lint, 19 testes unitários, build, Playwright e Lighthouse.
- Orçamento estrutural medido percorrendo a cena: 41 chamadas de desenho estimadas e 2.360 triângulos. Build final: 134.044 bytes gzip de cena/Three.js e 1.789 bytes gzip de entrada da interface. Sem modelos, texturas ou vídeos externos adicionados.
- A renderização e as capturas usam Chromium emulado; desempenho físico, Safari/iOS real e aprovação visual de Ruan permanecem não verificados.

## Correção de orientação dos boxes — 07/11/2026

Ruan aprovou a composição geral e esclareceu que os boxes ficam de frente para o campo. A janela, o balcão, a cobertura frontal e as bebidas do quiosque foram movidos para o lado do gramado; as portas do depósito e do banheiro também. A porta do quiosque permanece lateral. As cadeiras passaram para o espaço entre o quiosque e o alambrado, olhando para o campo, sem invadir o trajeto de entrada.

| ID  | Evidência e impacto                                                  | Prioridade | Correção e estado                                                                                                   |
| --- | -------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| V09 | Ruan identificou que as fachadas estavam voltadas para fora do campo | Relevante  | Fachadas corrigidas; teste de orientação em coordenadas globais e captura pelo lado do gramado confirmam a correção |

A câmera inicial continua aprovada e mostra agora as costas das construções. Isso é consequência da orientação correta, não ausência de portas ou janela. A alteração de cadeiras substitui o posicionamento descrito em V04. A inspeção pelo lado do gramado foi feita apenas para validação; não acrescentou um controle de câmera ao site.

O teste novo falhou antes da correção. Na revisão do teste, as matrizes globais passaram a ser atualizadas antes de medir as aberturas, evitando comparar coordenadas locais com globais. A mutação deliberada que voltou a janela para fora fez a regressão falhar; restaurada a correção, os cinco testes do campo passaram.

Capturas da câmera inicial em 1280 × 900 e 360 × 800 e da vista de inspeção pelo lado do campo foram conferidas. Fachadas, balcão, cadeiras e acessos estão coerentes com a orientação solicitada. Sem novas geometrias, materiais ou dependências; mantidos os limites de geometria verificados pelos testes.

`scripts/verify.sh --full` passou integralmente após a correção, incluindo Playwright e Lighthouse, sem etapas puladas. Build final: cena/Three.js com 134.045 bytes gzip e entrada da interface com 1.787 bytes gzip, dentro dos orçamentos. Testes em Moto G30 e Vaio FE16 físicos continuam pendentes. Não houve commit ou publicação.

## Aprovação do incremento visual — 07/11/2026

Ruan aprovou expressamente a implementação após a correção dos boxes voltados para o campo. A aprovação encerra o incremento de composição estática, incluindo câmera, disposição e formas provisórias. Ela resolve as pendências de aprovação visual registradas nas revisões anteriores; não substitui testes nos aparelhos reais nem aprova o personagem definitivo.

A Etapa 2 permanece em andamento: chegada curta com Pular, navegação por pontos de vista, botões HTML projetados, adaptação de qualidade e validação nos aparelhos ainda estão pendentes. A prévia externa e a CI remota continuam como pré-requisitos de validação previstos no ADR 0003, dependendo de autorização explícita para Git e hospedagem. O próximo incremento é a chegada com Pular e respeito a movimento reduzido.

Esta atualização registra a aprovação e não altera código. Verificação executada: consistência da documentação e diff sem erros de espaços. A última verificação completa da implementação continua sendo a execução verde descrita acima; não foi repetida para este registro editorial.

## Navegação, detalhamento e harness — 07/11/2026

Ruan pediu para fechar as pontas soltas da Etapa 2, detalhar os componentes 3D dentro do escopo da etapa e tornar o harness mais assertivo, em ciclos de implementação, validação, mapeamento e melhoria até a versão de validação.

### Implementado

- **Chegada:** timeline GSAP de 3 s, da entrada até a vista geral aprovada, com “Pular chegada”. Com movimento reduzido, corte direto, sem tween. GSAP entrou como previsto no ADR 0001; o ticker fica dormindo até o primeiro tween, para a cena parada não pedir quadros.
- **Pontos de vista:** um por hotspot, em composição larga e estreita (`src/experience/camera/viewpoints.ts`); transição de 1,1 s ou instantânea com movimento reduzido. “Visão geral” e `Esc` voltam ao enquadramento aprovado, que tem teste de regressão.
- **Órbita limitada:** arraste horizontal de até ±0,35 rad em volta do alvo (decisão 12.2); a rolagem vertical da página continua livre no toque (`touch-action: pan-y`).
- **Botões projetados:** a interface cria um `<button>` por hotspot a partir de `src/data/hotspots.ts`; a cena projeta a posição, oculta pontos fora da tela e separa os rótulos sem sobrepor outros rótulos, objetos ou âncoras, com linha-guia até o objeto quando um rótulo é deslocado. Durante transições os botões ficam ocultos. O botão leva ao ponto de vista e oferece “Ir para …” com a rota da página.
- **Raycasting:** clique ou toque no objeto seleciona o mesmo hotspot, por áreas invisíveis simplificadas (`hit-area`); arrastar não seleciona.
- **Qualidade:** pixelRatio por perfil; sombra dinâmica apenas do personagem e apenas no perfil alto; média de FPS em janelas de 2 s durante animações, caindo um nível abaixo de 45 (alto) ou 30 (médio), sem subir na sessão. Limites são hipóteses até a medição nos aparelhos.
- **Medição em aparelho:** `?debug` carrega à parte um painel com FPS médio, perfil, pixelRatio, chamadas e triângulos, com renderização contínua.
- **Estados:** a máquina passou a lembrar o estado anterior à pausa (plano 3.5: “pausado ► estado anterior”); antes, sempre voltava a `exploring`.
- **Apresentação alternativa:** planta ilustrada em SVG com os mesmos quatro pontos como links, visível sem JavaScript, sem WebGL, em falha e no modo leve. Em tela estreita os links viram lista abaixo da planta.
- **Componentes 3D:** redes nos dois gols, tela do alambrado com abertura alinhada ao caminho, quatro refletores, marcas do pênalti e ponto central, bola na marca do pênalti diante do gol do hotspot “O pênalti”, mostrador “00:00” no placar, abrigo do banco, painel sem texto e banquetas no quiosque, placas lisas nas portas, rede de proteção no pula-pula. A montagem foi dividida em `kit.ts`, `landmarks.ts`, `field.ts` e `entrance.ts`.

A bola saiu do meio do campo para a marca do pênalti. É uma mudança pequena de composição, feita para ligar o objeto ao hotspot do gol; depende da avaliação de Ruan.

### Harness

- `scripts/verify.sh` ativa pelo nvm a versão do `.nvmrc` quando instalada. Antes, o hook Stop e qualquer shell sem `nvm use` falhavam em “versão do Node” mesmo com a versão certa disponível; sem a versão, a mensagem agora indica `nvm install`.
- `scripts/check-budgets.sh` mede em gzip, após cada build, o JS inicial e o código da cena, e falha acima de 50 KB e 250 KB. Antes, os números eram medidos à mão no relatório.
- `pnpm capture` gera as capturas do ciclo visual em `.captures/`, fora do Git e fora de `test-results/` (que o Playwright limpa a cada execução e apagou as primeiras capturas desta rodada).
- Os testes da cena rodam também em Chromium com celular emulado e toque (`chromium-mobile`).
- Procedimento 4.1, guias de qualidade e da cena, README e `AGENTS.md` atualizados.

### Mapa do ciclo visual e funcional

| ID  | Evidência e impacto                                                                                           | Prioridade  | Correção e estado                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| V10 | Captura da vista geral: rótulos do banco e do personagem, e do placar e do gol, sobrepostos nas duas larguras | Relevante   | Layout de rótulos com separação; teste e2e de não sobreposição em 1280 e 360 px; corrigido |
| V11 | Capturas apagadas pelo Playwright em `test-results/`                                                          | Relevante   | Saída em `.captures/`; corrigido                                                           |
| V12 | Pedidos de quadro com a cena parada: ticker do GSAP ativo desde o carregamento                                | Relevante   | Ticker dormindo até o primeiro tween; teste e2e do laço ocioso; corrigido                  |
| V13 | Clique no canvas sem efeito no teste                                                                          | Relevante   | Defeito do teste: ponto fora da viewport; teste rola a cena antes; corrigido               |
| V14 | Após a separação, “O pênalti” cobria o placar e a âncora dele; clique no objeto acertava o botão errado       | Relevante   | Âncoras viram obstáculos; teste unitário; corrigido                                        |
| V15 | Linhas-guia passando por trás de outros rótulos na tela estreita                                              | Relevante   | Candidatos combinados e avaliação de todas as ordens; teste de cruzamento; corrigido       |
| V16 | Rótulo do gol empurrado para baixo da própria âncora, cobrindo o gol                                          | Relevante   | Rótulos nunca abaixo da própria âncora; teste unitário; corrigido                          |
| V17 | Rótulos do personagem e do gol distantes do objeto nos pontos de vista                                        | Relevante   | Âncoras logo acima de cada objeto; nova captura conferida; corrigido                       |
| V18 | Foco não ia para o primeiro ponto após “Pular”: botão ainda oculto até o quadro seguinte                      | Relevante   | Quadro síncrono antes de `arrival:done`; teste e2e; corrigido                              |
| V19 | Painel de medição cobria o rótulo “Projetos” na tela estreita                                                 | Refinamento | Painel no canto inferior esquerdo; nova captura conferida; corrigido                       |
| V20 | Formas básicas ainda sem materiais e modelos finais                                                           | Refinamento | Acabamento das Etapas 4 e 5, fora deste escopo                                             |

Não restam defeitos bloqueantes ou relevantes reproduzidos sem correção. Isso não é garantia de ausência de erros: a sensação da chegada, a clareza das interações e o desempenho real dependem da avaliação de Ruan e dos aparelhos.

### Evidências

- Testes novos vistos falhando antes da implementação: máquina de estados, pontos de vista e órbita, projeção, qualidade e janela de FPS, redes e painéis do alambrado, detalhes do campo, áreas de clique, sombra, layout de rótulos (incluindo os casos V14 a V16), formatação do painel de medição, nove testes e2e de navegação e dois testes do harness para o nvm e um para os orçamentos.
- Teste do teste: 13 mutações deliberadas na cena; 11 derrubaram testes. As duas sobreviventes eram condições redundantes (foco a partir de foco e queda a partir do perfil baixo) e foram removidas. A ativação pelo nvm e os orçamentos também tiveram mutação ou falha prévia confirmada.
- 57 testes de unidade, 80 testes do harness e 54 testes Playwright (18 no Chromium, 9 em cada um dos demais projetos, incluindo `chromium-mobile`).
- Capturas de 1280 × 900 e 360 × 800 inspecionadas em seis rodadas: planta ilustrada, chegada, vista geral, cada ponto de vista e modo de medição.
- Orçamento estrutural da cena: 53 chamadas de desenho, 3.068 triângulos e 588 segmentos de linha; com a sombra do perfil alto, o renderer registrou 54 chamadas e 3.212 triângulos. Bundle: JS inicial com 2.618 bytes gzip e código da cena com 167.375 bytes gzip (antes, 134.045). Sem modelos, texturas ou vídeos.
- `scripts/verify.sh --full` passou integralmente, sem etapas puladas, partindo de um shell com Node 22 ativo.

### Pendências e validação

- [[PENDENTE: aprovação de Ruan para acrescentar ao contrato da cena `showOverview()` e as opções `hotspotButtons` e `debug` de `boot()`; após aprovar, registrar o ADR 0006]]. Sem `showOverview`, não haveria como voltar à vista geral a partir de um hotspot; sem `hotspotButtons`, a cena não teria os botões para posicionar; `debug` viabiliza a medição sem DevTools.
- [[PENDENTE: medição no Moto G30 e no Vaio FE16 com `?debug`, para revisar os limites de queda de qualidade e os orçamentos]].
- [[PENDENTE: autorização explícita para Git e hospedagem antes da validação externa da Etapa 2]], conforme ADR 0003.
- Validação de Ruan: duração da chegada, clareza dos botões e da volta à visão geral, conforto dos pontos de vista e da órbita, posição da bola e legibilidade da planta ilustrada.

Não foram verificados aparelhos físicos, Safari/iOS real, aquecimento, memória de GPU, rede móvel real e CI remota. A cena no Playwright usa renderização por software; seu FPS não representa os aparelhos. Não houve commit, push ou deploy.

## Home imersiva e telas no campo — 07/11/2026

Ruan gostou da navegação e pediu uma experiência no padrão de um portfólio 3D de referência que tem localmente: informações dentro do cenário e tela inicial de carregamento com tema de futebol. Escolheu home inteira em tela cheia, telas no cenário e o carregamento “bola rumo ao gol”, e aprovou o registro no ADR 0006. A referência foi estudada só pelo fluxo de interação; seu código, textos, shaders, sons e modelos não foram reproduzidos (regra 10). A prévia do ciclo anterior foi encerrada após a validação de Ruan.

### Implementado

- **Home em tela cheia:** identificação em HTML sobre a tela de carregamento, menu num `details` nativo e “Ver projetos” sempre disponível. Um script inline mínimo decide antes da pintura se a cena carrega sozinha. Sem JavaScript, sem WebGL, em falha ou no modo leve, a home mostra a apresentação e a planta ilustrada.
- **Carregamento “bola rumo ao gol”:** faixa de gramado com a bola indo da marca do pênalti até a rede, em quatro etapas reais (código da cena, campo montado, materiais compilados com `compileAsync`, primeiro quadro); “Bola na rede!” e “Entrar em campo” ao concluir. Sem atrasos artificiais e sem animação com movimento reduzido.
- **Telas no cenário:** telão do placar (projetos), quadro tático junto ao banco (experiência e formação), placa ao lado do personagem (apresentação e contatos) e telão sobre o alambrado atrás do gol (o pênalti). São HTML real, posicionado com o `CSS3DRenderer` do Three.js, sem dependência nova, com fundo físico em cada objeto. O conteúdo vem dos componentes extraídos das páginas (`src/components/summaries/`), então página e tela usam a mesma fonte.
- **Pontos de vista:** derivados de cada tela, pela proporção real da câmera, para ela caber inteira e legível; no celular a tela ocupa 90% da largura.
- **Contrato:** `start()`, `showOverview()` e as opções `screens`, `onProgress`, `hotspotButtons` e `debug`, registrados no ADR 0006. Plano, guias, README e `AGENTS.md` atualizados.

### Mapa do ciclo

| ID  | Evidência e impacto                                                                                                                      | Prioridade  | Correção e estado                                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H01 | Cena nunca carregava: o Prettier transformou o script inline num bloco com uma string solta                                              | Bloqueante  | Script escrito como JS direto, na própria home; e2e de carregamento; corrigido                                                                          |
| H02 | Modo leve não persistia e telas sumiam ao reentrar: devolver as telas pelo irmão seguinte lançava erro quando o irmão também tinha saído | Relevante   | Marcador no lugar original; e2e de reentrada; mutação confirmou; corrigido                                                                              |
| H03 | Anúncios inacessíveis durante o jogo: a região viva estava dentro da apresentação oculta                                                 | Relevante   | Região viva fora dela e cópia visível sem anúncio; e2e; corrigido                                                                                       |
| H04 | Texto das telas com 51 px e conteúdo de 1.619 px numa tela de 480: `cqi` no próprio contêiner cai na viewport                            | Relevante   | Tipografia num invólucro interno; capturas; corrigido                                                                                                   |
| H05 | Clique na cena perdido logo após “Entrar em campo”: a apresentação esmaecendo interceptava o ponteiro por 600 ms                         | Relevante   | `pointer-events: none` desde o início; e2e de clique no canvas; corrigido                                                                               |
| H06 | Telas vazando pelas bordas em 360 × 800: distância calculada para a proporção de referência                                              | Relevante   | Proporção real da câmera, com cache; teste de enquadramento com 360 × 800; corrigido                                                                    |
| H07 | Links cortados no quadro tático, na placa e nos telões; texto de ~12,6 px no celular                                                     | Relevante   | Fonte de 4,4cqi e telas redimensionadas; e2e de conteúdo sem corte nas duas larguras; corrigido                                                         |
| H08 | Placa escondia o personagem                                                                                                              | Relevante   | Placa deslocada para a direita da cápsula; captura; corrigido                                                                                           |
| H09 | Foco não voltava ao botão de origem no celular: botão ainda marcado fora da tela                                                         | Relevante   | Quadro síncrono ao fim de cada movimento; e2e; corrigido                                                                                                |
| H10 | Fim do carregamento roubava o foco e tirava do primeiro Tab o link “Pular para o conteúdo” (instável no Firefox)                         | Relevante   | Sem foco automático; regressão falhou com o comportamento antigo e passa agora; corrigido                                                               |
| H11 | Teste do fundo físico aceitava painel atravessado (mutação sobreviveu)                                                                   | Relevante   | Teste exige espessura alinhada à normal da tela; corrigido                                                                                              |
| H12 | Contorno de foco no título da tela; controles quebrando linha a 360 px                                                                   | Refinamento | Título sem contorno (não interativo, fora da ordem de Tab); controles compactos no celular; corrigido                                                   |
| H13 | Lighthouse soma a cena carregada na abertura: 175.628 bytes de script contra a asserção de 51.200                                        | Relevante   | Ruan aprovou somar os orçamentos do plano: asserção de 307.200 bytes; JS inicial sem a cena segue em 3.190 bytes gzip por `check-budgets.sh`; corrigido |
| H14 | CLS de 0,16 no Lighthouse: barra, botão e status apareciam depois da primeira pintura e deslocavam a apresentação centralizada           | Relevante   | Espaço reservado desde a primeira pintura (botão desativado durante o carregamento) e bola animada por `translate`; CLS 0,02 e LCP 1,0 s; corrigido     |
| H15 | Sobreposição de carregamento encolhida a uma faixa: o Chrome aplica `align-self` a elementos absolutos                                   | Refinamento | `align-self: stretch` nos modos de tela cheia; captura; corrigido                                                                                       |

### Evidências

- Testes vistos falhando antes da correção: enquadramento das telas (incluindo 360 × 800), fundos físicos, etapas do carregamento, e2e de carregamento, telas, conteúdo sem corte e primeiro Tab.
- Teste do teste: 7 mutações nas peças novas; 6 morreram de primeira e a sobrevivente revelou o teste fraco H11, que foi reforçado.
- 60 testes de unidade e 62 testes Playwright; capturas de 1280 × 900 e 360 × 800 inspecionadas em quatro rodadas.
- Cena: 59 chamadas de desenho e 3.164 triângulos. Bundle: JS inicial com 3.190 bytes gzip e código da cena com 169.455 bytes gzip. Lighthouse: LCP 1,0 s, CLS 0,02 e 175.617 bytes de script, dentro da asserção aprovada de 307.200.
- `scripts/verify.sh --full` passou integralmente, sem etapas puladas.

Não foram verificados aparelhos físicos, Safari/iOS real nem leitores de tela reais (NVDA, VoiceOver); a acessibilidade foi conferida por axe, teclado e papéis ARIA no Playwright. Não houve commit, push ou deploy.

## Imersão total no campo noturno (ADR 0007)

Ruan pediu:

- alternativas de carregamento;
- entrada automática no campo após a animação;
- todas as informações e interações dentro do campo;
- um fundo mais sofisticado, no padrão do portfólio de referência;
- pontos de clique melhores que retângulos com texto.

O plano já previa o campo noturno. Da referência veio só o padrão de experiência (regra 10).

### Implementado

- **Campo noturno em diorama:**
  - base espessa flutuando sobre fundo escuro, com névoa e estrelas;
  - halos nos refletores, feixes aditivos e mancha de luz no gramado;
  - vinheta em CSS.

  Sem pós-processamento, com uma luz direcional e uma hemisférica.

- **Refletores acendendo:** as quatro torres acendem em sequência durante a chegada; com movimento reduzido, já estão acesas.
- **Informação no campo:**
  - placas de LED com nome, título e cidade, vindos de `profile.ts`;
  - cartões acesos nas quatro telas, com os rótulos de `hotspots.ts`, no lugar dos dígitos do placar;
  - halo no chão sob cada ponto.
- **Marcadores e destaque:** os pontos são marcadores com pictograma próprio e nome em letreiro. Foco ou ponteiro no marcador, ou ponteiro sobre o objeto, acende o cartão e o halo daquele ponto.
- **Entrada automática:** a home mostra o fechamento do carregamento por 0,9 s e entra em campo, sem mover o foco. “Voltar ao campo” fica dentro de cada tela, e o cabeçalho fica fora de vista até receber o foco do teclado.
- **Quatro alternativas de carregamento:** “bola rumo ao gol” (padrão), “refletores acendendo”, “placar eletrônico” (contagem até o apito inicial) e “linhas de giz”. Todas usam as mesmas etapas reais. A home aceita `/?carregamento=<id>`, e `/carregamentos` (só em `pnpm dev`) mostra as quatro lado a lado, com etapas simuladas apenas para comparação.
- **Telas posicionadas em 2D** no lugar do `CSS3DRenderer` (I01).
- **Harness:** `PREVIEW_PORT` nas configurações do Playwright, para e2e e capturas não disputarem a porta da prévia em avaliação.

### Mapa do ciclo

| ID  | Evidência e impacto                                                                                                                                                                                                                    | Prioridade  | Correção e estado                                                                                                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I01 | Links e botões das telas não recebiam clique no Chrome, já na versão anterior: nada dentro do contexto 3D do `CSS3DRenderer` entrava no teste de acerto (`elementsFromPoint` só via o canvas). O e2e antigo só conferia a visibilidade | Bloqueante  | Telas posicionadas com `translate`/`scale` 2D a partir do centro e da largura projetados; órbita só na vista geral; e2e com `click({ trial: true })` e clique real em “Voltar ao campo”; teste de unidade da projeção; corrigido |
| I02 | Feixes de luz fortes demais, como triângulos sólidos                                                                                                                                                                                   | Refinamento | Opacidade e raio reduzidos; capturas; corrigido                                                                                                                                                                                  |
| I03 | Halo do refletor próximo cobria o céu atrás do telão                                                                                                                                                                                   | Relevante   | Teto de 96 px no tamanho do halo; capturas; corrigido                                                                                                                                                                            |
| I04 | Carregamento parado em todas as alternativas: o atributo `data-loader` no `<html>` colidia com o `[data-loader]` do componente, e a home real também ficava parada                                                                     | Bloqueante  | Atributo renomeado para `data-loading-variant`; capturas das quatro alternativas em 25%, 50% e 100%; e2e do fechamento de cada uma; corrigido                                                                                    |
| I05 | Torres da alternativa “refletores” pareciam apagadas                                                                                                                                                                                   | Refinamento | Consequência do I04; capturas confirmam as torres acendendo por etapa; corrigido                                                                                                                                                 |
| I06 | Texto de status repetia a etapa do carregamento                                                                                                                                                                                        | Refinamento | Cópia visível oculta durante o carregamento; a região viva continua anunciando; corrigido                                                                                                                                        |
| I07 | “Voltar ao campo” cortado no quadro tático e na placa                                                                                                                                                                                  | Relevante   | Telas mais altas (2,1 m e 3,1 m); teste de enquadramento e e2e de conteúdo sem corte nas duas larguras; corrigido                                                                                                                |
| I08 | Na vista do placar, o feixe do refletor vizinho envolvia a câmera e acinzentava o céu                                                                                                                                                  | Refinamento | Feixes mais estreitos; capturas; corrigido                                                                                                                                                                                       |
| I09 | Com movimento reduzido, a cena seguia pedindo quadros: o tween do acendimento acordava o ticker do GSAP                                                                                                                                | Relevante   | Tween criado só com movimento; e2e de cena parada; corrigido                                                                                                                                                                     |
| I10 | Depois da chegada completa, a página seguia pedindo cerca de 28 quadros por segundo parada (já acontecia antes, sem teste)                                                                                                             | Relevante   | `core/ticker.ts` põe o ticker para dormir quando nenhuma animação está ativa; e2e novo falhou antes e passa agora; corrigido                                                                                                     |
| I11 | Lighthouse: TBT de cerca de 15,9 s e desempenho 0,63, com ~400 ms por quadro da chegada renderizada por software (SwiftShader, CPU 4×)                                                                                                 | A medir     | Sem asserção de TBT no plano; o custo real depende da GPU do aparelho. Medir no Moto G30 e no Vaio FE16 com `?debug` antes de decidir; não corrigido                                                                             |
| I12 | Marcadores “Projetos” e “O pênalti” cobrem parte dos cartões do placar e do telão do gol na vista geral                                                                                                                                | Refinamento | O layout dos rótulos evita sobreposição entre marcadores, não com os cartões; avaliar com Ruan; aberto                                                                                                                           |

### Evidências

- Testes vistos falhando antes da implementação: sinalização (halos), atmosfera, etapas e alternativas do carregamento, e2e de cena parada após a chegada completa.
- Teste do teste: 9 mutações (destaque do cartão e do halo, escala e centro da tela, acendimento da luz, sequência das torres, texto da cidade, rótulo final e ouvinte de foco do marcador). Oito morreram. A sobrevivente, no rótulo final, é equivalente: com quatro etapas, as duas formas dão o mesmo texto.
- 74 testes de unidade, 74 testes Playwright e 80 do harness; capturas de 1280 × 900 e 360 × 800 inspecionadas em três rodadas.
- Cena: 78 chamadas de desenho e 3.634 triângulos. Bundle: JS inicial com 3.486 bytes gzip e código da cena com 172.385 bytes gzip. Lighthouse: LCP 1,1 s, CLS 0,018 e 178.725 bytes de script, dentro da asserção de 307.200.
- `PREVIEW_PORT=4332 scripts/verify.sh --full` passou integralmente, sem etapas puladas.

Não foram verificados aparelhos físicos, Safari/iOS real nem leitores de tela reais. O TBT do I11 precisa de medição em aparelho. Não houve commit, push ou deploy.

## Marcadores fora dos cartões e correções do harness — 08/11/2026

Ruan decidiu que os marcadores não podem cobrir os cartões das telas (I12) e autorizou corrigir o gerenciador de processos e encerrar as prévias desatualizadas.

### Implementado

- **Marcadores:** `interaction/label-layout.ts` aceita obstáculos além das âncoras. `interaction/hotspot-layer.ts` passa a caixa projetada de cada cartão, calculada por `projectScreenBounds` em `interaction/screen-layer.ts`. Nenhum marcador cobre um cartão, nem o próprio.
- **Supervisor de processos:** o supervisor de `scripts/processes.sh` não terminava quando o comando terminava. A busca de filhos roda numa subshell do mesmo grupo, e o supervisor contava essa subshell como filho. Um supervisor desses ficou 51 minutos ativo depois de uma falha do `astro preview`.
- **Node do `.nvmrc`:** `processes.sh start` ativa a versão do `.nvmrc` pelo nvm e avisa quando ela não está instalada. A checagem saiu de `verify.sh` para `scripts/lib/node.sh`, usado pelos dois scripts. Os auxiliares `fake_node` e `fake_nvm` foram para `tests/harness/lib.sh`.
- **Processos:** encerrados com aprovação de Ruan o supervisor órfão, as prévias 4324 e 4325 e o registro antigo do ciclo `etapa2-home-imersiva`. A prévia 4326 segue aberta para avaliação. O relatório anterior dizia que a porta 4321 era a prévia antiga, mas era um `pnpm dev` aberto no terminal de Ruan, que não foi tocado.

### Mapa do ciclo

| ID  | Evidência e impacto                                                                                                | Prioridade  | Correção e estado                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| I12 | Marcadores cobriam os cartões do placar e do telão do gol                                                          | Relevante   | Cartões como obstáculos do layout; teste com a vista geral em 1280 × 900 e 360 × 800; capturas conferidas; corrigido |
| I13 | Linhas-guia de “O pênalti” e “Projetos” passam sobre o próprio cartão: a âncora fica abaixo dele e o rótulo, acima | Refinamento | O texto do cartão continua legível; avaliar com Ruan; aberto                                                         |
| I14 | No celular, os marcadores ficam mais distantes dos objetos, porque sobem acima dos cartões                         | Refinamento | Avaliar com Ruan; aberto                                                                                             |
| P01 | Supervisor ativo para sempre depois do fim do comando                                                              | Relevante   | Subshell da busca excluída; teste novo; corrigido                                                                    |
| P02 | `processes.sh start` usava o Node do shell, recusado pelo Astro                                                    | Relevante   | Ativação pelo nvm e aviso de versão ausente; dois testes novos; corrigido                                            |

### Evidências

- Testes vistos falhando antes da correção, pelo motivo esperado: obstáculo no layout dos rótulos, marcadores sobre cartões nas duas larguras, supervisor que não termina, Node do `.nvmrc` no `start` e aviso de versão ausente.
- Teste do teste: remover os obstáculos dos bloqueios derrubou três testes. Passar uma lista vazia de cartões derrubou dois. Remover a exclusão da subshell derrubou o teste do supervisor.
- 77 testes de unidade, 83 do harness e todos os testes Playwright passando. Capturas de 1280 × 900 e 360 × 800 da vista geral e do destaque conferidas.
- Bundle: JS inicial com 3.487 bytes gzip e código da cena com 172.547 bytes gzip. Lighthouse: LCP de 1,0 a 1,1 s, CLS 0,018 e TBT de cerca de 15,4 a 15,8 s, o mesmo quadro do I11.
- `PREVIEW_PORT=4334 scripts/verify.sh --full` passou integralmente, sem etapas puladas.

Não foram verificados aparelhos físicos, Safari/iOS real nem leitores de tela reais. Não houve commit, push ou deploy.

## Bola quicando e chute ao gol (ADR 0008) — 08/11/2026

Ruan pediu que a bola quicasse no carregamento e, ao entrar no campo, fosse longe e terminasse no gol, com uma transição que contasse essa história. Ele também perguntou se a etapa pode ser fechada; a resposta está em “Fechamento da etapa”, abaixo.

### Implementado

- **Carregamento único:** a bola quica sobre a faixa de gramado, que funciona como barra de progresso das quatro etapas reais. No fim, aparece “Bola em jogo!” e a bola é chutada para longe durante a pausa de 0,9 s. Saíram as quatro alternativas do ADR 0007, o parâmetro `?carregamento=`, a página `/carregamentos` e o componente da galeria.
- **Chegada com chute:** a bola chutada aparece à frente da câmera, passa por cima do alambrado da entrada e entra no gol de “O pênalti”, e a rede estufa. A câmera a acompanha até o gol (ponto de vista `kick`, 1,8 s) e sobe para a vista geral aprovada (1,5 s). A trajetória é a função pura `kickBallAt` (`world/kick.ts`). Com “Pular”, `goTo` ou movimento reduzido, a bola fica parada no fundo da rede.
- **Medidas compartilhadas:** dimensões do gol, altura do alambrado e raio da bola passaram para `world/layout.ts`.
- **Capturas:** `pnpm capture` fotografa a chegada com relógio controlado em 0,2 s, 0,7 s, 1,3 s, 1,8 s, 2,3 s e 3 s.
- **Harness:** o resumo de `tests/harness/run.sh` nomeia os testes que falharam. Antes, o `verify.sh` mostrava só as últimas 30 linhas e o nome se perdia.

### Mapa do ciclo

| ID  | Evidência e impacto                                                                                                             | Prioridade  | Correção e estado                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| K01 | Captura de 0,7 s: a câmera de perseguição passava rente à placa e à cápsula do personagem, nas duas larguras                    | Relevante   | Ponto de vista `kick` do outro lado do campo; teste de folga mínima de 3 m; novas capturas; corrigido |
| K02 | E2e de “Pular” instável no celular emulado: a chegada terminava antes do clique, porque cada quadro sem GPU leva centenas de ms | Relevante   | Relógio controlado durante a chegada e acionamento por teclado; 12 de 12 execuções; corrigido         |
| K03 | E2e do painel de medição no celular emulado: quadros rentes ao gramado passam de 250 ms e zeram a janela de FPS                 | Relevante   | Espera de 20 s, com o motivo no teste; 8 de 8 execuções; em aparelho, depende da medição com `?debug` |
| K04 | Falha intermitente de um teste do harness numa verificação completa, sem o nome no log                                          | Relevante   | Não reproduziu em nove execuções; o resumo agora nomeia o teste; aberto até reaparecer                |
| K05 | Sombra da bola no carregamento quase invisível sobre o fundo escuro                                                             | Refinamento | Avaliar com Ruan; aberto                                                                              |
| K06 | Bola pequena no primeiro quadro da chegada (a cerca de 14 m da câmera, por volta de 30 px)                                      | Refinamento | Avaliar com Ruan; aberto                                                                              |

### Evidências

- Testes vistos falhando antes da implementação: frase final do carregamento, bola à frente da câmera, alambrado, entrada entre as traves, parada na rede, enquadramento do gol, bola na rede ao montar o campo, folga da câmera e resumo do runner.
- Teste do teste: arco baixo, bola atravessando a rede, início fora da câmera e alvo deslocado do ponto de vista derrubaram testes. Uma mutação na posição da câmera, sem mudar o alvo, sobreviveu por ser equivalente. “Pular” sem efeito derrubou o e2e.
- 81 testes de unidade, 84 do harness e 68 do Playwright. Capturas do carregamento (com e sem animação) e da chegada nas duas larguras conferidas.
- Bundle: JS inicial com 3.239 bytes gzip e código da cena com 173.051 bytes gzip. Lighthouse: LCP de 1,0 s, CLS 0,018 e TBT de cerca de 17 s, mais que os 15,5 s de antes porque a chegada desenha quadros rentes ao gramado sem GPU (I11).
- `PREVIEW_PORT=4334 scripts/verify.sh --full` passou integralmente, sem etapas puladas. `scripts/verify.sh` passou de novo depois da mudança no runner.

### Fechamento da etapa

O plano exige, para a Etapa 2, a primeira medição nos aparelhos de referência. O ADR 0003 exige a prévia externa e a CI remota antes da validação. Nenhuma das duas pode ser feita aqui: a medição depende de Ruan com `?debug`, e a prévia depende de autorização para Git e hospedagem. Fechar a etapa só localmente, transferindo essas pendências como foi feito na Etapa 0, é uma decisão de Ruan e, se aprovada, vira ADR.

Não foram verificados aparelhos físicos, Safari/iOS real nem leitores de tela reais. Não houve commit, push ou deploy.

## Quique mínimo e fechamento da etapa (ADR 0009) — 08/11/2026

Ruan pediu que a bola quique por 5 s no carregamento, aprovou o restante da versão e decidiu fechar a Etapa 2 localmente, como na Etapa 0.

### Implementado

- **Quique mínimo:** a bola quica por pelo menos 5 s antes do chute, contados do início do carregamento. A barra mostra só o progresso real; se o carregamento terminar antes, fica em 100% com “Aquecendo a bola…”. Com movimento reduzido não há espera.
- **Testes com relógio parado:** os testes e2e e as capturas abrem a home com o relógio da página parado (`tests/e2e/field-clock.ts`) e o avançam em passos. Na rodada anterior, `clock.install()` sozinho deixava o tempo correr normalmente, então os testes chamados de “relógio parado” não estavam parados; agora o relógio é pausado antes da navegação.
- **Fechamento:** ADR 0009, checklist da Etapa 2 no plano e estado no `AGENTS.md` atualizados.

### Evidências

- O teste de unidade do aquecimento e o e2e dos 5 s falharam antes da implementação. Zerar o quique mínimo derrubou o e2e, que confere “Aquecendo a bola…” aos 4,5 s e o chute logo depois dos 5 s.
- 82 testes de unidade, 84 do harness e 66 do Playwright.
- Bundle: JS inicial com 3.352 bytes gzip e código da cena com 173.051 bytes gzip.
- Lighthouse: LCP 1,1 s, CLS 0 e TBT de 4,1 a 6,1 s. A queda do TBT não é ganho de desempenho: com o quique de 5 s, a chegada começa depois da janela medida. O custo da chegada sem GPU continua no I11, para a medição nos aparelhos.
- `PREVIEW_PORT=4334 scripts/verify.sh --full` passou integralmente, sem etapas puladas.

### Encerramento

Ruan aprovou a versão nesta conversa, com o pedido dos 5 s, e autorizou o fechamento. Os processos do ciclo `etapa2-imersao-total` foram encerrados pelo gerenciador. Ficam para antes da validação da Etapa 3, conforme ADR 0009:

- medição no Moto G30 e no Vaio FE16 com `?debug`;
- prévia externa e CI remota;
- avaliação do TBT (I11) e dos refinamentos I13, I14, K05 e K06;
- falha intermitente do harness (K04), se reaparecer.

Não foram verificados aparelhos físicos, Safari/iOS real nem leitores de tela reais. Não houve commit, push ou deploy.
