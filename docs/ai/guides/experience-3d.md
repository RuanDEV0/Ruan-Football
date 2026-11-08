# Guia — Cena 3D (`src/experience/`)

Referências no plano: seções 3.3 a 3.6, 3.9 e 3.11.

## Arquitetura

- `src/experience/index.ts` exporta somente `boot(container, options): Promise<Experience>` e os tipos públicos. Nada mais é importado de fora.
- A API pública (`goTo`, `showOverview`, `start`, `skipArrival`, `setQuality`, `pause`, `resume`, `dispose`, `on`) e as opções de `boot()` (`quality`, `reducedMotion`, `hotspotButtons`, `screens`, `onProgress`, `debug`; ADR 0006) e os eventos (`progress`, `ready`, `arrival:done`, `hotspot:hover`, `hotspot:select`, `quality:downgrade`, `error`) seguem o plano, seção 3.4. Mudar o contrato exige ADR.
- O módulo é TypeScript puro: **não importa** Astro, `src/ui/`, `src/components/` nem lê o DOM fora do `container` recebido. A única exceção são os botões dos hotspots, que a interface cria e a cena apenas posiciona (seção “Hotspots”).
- Os dados vêm de `src/data/hotspots.ts`. Não declare IDs, rótulos ou rotas dentro da cena.
- Pastas: `core/` (renderer, loop, resize, assets, quality), `state/` (máquina de estados, eventos), `camera/`, `world/`, `character/`, `interaction/`, `debug/`.

## Máquina de estados

- Estados: `entry`, `loading`, `arrival`, `exploring`, `focus`, `panel`, `paused`, `fallback`.
- Transições centralizadas em `state/`. Nenhum outro módulo muda o estado diretamente: eles disparam eventos.
- A lógica de transição não depende do Three.js, para ser testada com Vitest sem WebGL.

## Desempenho

- **Nada de alocação no loop de renderização:** reutilize `Vector3`, `Quaternion`, `Matrix4` e arrays criados fora do `tick`.
- Renderize apenas quando necessário: pause em `visibilitychange`, enquanto o vídeo está aberto e em `paused`.
- `pixelRatio` limitado pelo perfil (2, 1,5 e 1). Nunca use `window.devicePixelRatio` diretamente.
- Iluminação dos refletores vem **assada** do Blender. Luzes dinâmicas: no máximo uma direcional e uma ambiente/hemisférica. Sombra dinâmica apenas no perfil alto.
- Compartilhe geometrias e materiais; prefira `InstancedMesh` para elementos repetidos (alambrado, refletores, arquibancada).
- Queda de qualidade: média de FPS em janelas de cerca de 2 s; abaixo do limite, cai **um** nível e não sobe na mesma sessão.
- Antes de adicionar pós-processamento, meça. Sem medição aprovada, não há pós-processamento.
- Orçamentos (plano, 3.11): ≤ 100 draw calls, ≤ 150 mil triângulos, ≤ 250 KB gzip de código da cena, ≤ 3 MB de modelos e texturas no perfil médio.

## Recursos e ciclo de vida

- `dispose()` libera geometrias, materiais, texturas, render targets, `AnimationMixer`, timelines GSAP (`kill()`), observers e listeners. Teste montando e desmontando a cena várias vezes.
- Trate `webglcontextlost`: emita `error` e deixe a interface mostrar a apresentação alternativa com “Tentar novamente”.
- Modelos carregados por um único carregador em `core/assets.ts`, com `LoadingManager` alimentando o evento `progress`. Decodificadores ficam em `/decoders/`.
- Objetos interativos são encontrados pelo nome (`hs_*`), nunca por coordenadas ou índices.

## Câmera e movimento

- Navegação por pontos de vista guiados com órbita limitada (decisão 12.2). Não use `OrbitControls` livre.
- Cada hotspot tem um ponto de vista. `goTo(id)` anima até ele; com movimento reduzido, a transição é instantânea ou um esmaecimento curto.
- A chegada é curta, sempre com “Pular”, e os refletores acendem em sequência durante ela (ADR 0007). A câmera acompanha a bola chutada até o gol de “O pênalti” (ponto de vista `kick`) e sobe para a vista geral; a trajetória é a função pura de `world/kick.ts`, e a bola termina parada na rede (ADR 0008). Com movimento reduzido, vira um corte com os refletores já acesos e a bola na rede. Ela só começa com `start()`, chamado pela interface ao fim do carregamento; antes disso a cena fica no acesso e ignora `goTo`.
- O ticker do GSAP dorme quando nenhuma animação está ativa (`core/ticker.ts`): todo tween novo chama `sleepTickerWhenIdle` ao terminar ou ser interrompido. O e2e confere que a cena parada não pede quadros.
- `boot()` resolve depois do primeiro quadro e informa por `onProgress` as etapas reais: campo montado, materiais compilados (`compileAsync`) e primeiro quadro. Nada de atrasos artificiais.
- Toda movimentação desenha um quadro síncrono antes de resolver: a interface move o foco para botões que precisam estar posicionados.
- Gestos na cena não podem impedir a rolagem da página fora do canvas.

## Hotspots

- A interface cria um `<button>` por hotspot, com rótulo vindo de `hotspots.ts`. A cena projeta a posição 3D e atualiza `transform` a cada quadro, e oculta os botões que estão atrás da câmera ou fora da tela.
- O raycasting no canvas é complementar (mouse e toque). O acesso por teclado e leitor de tela vem dos botões.
- Use áreas de clique simplificadas (caixas invisíveis), não a malha detalhada: `hit-area` dentro de cada `hs_*`, criada por `kit.addHitArea`.
- Rótulos não se sobrepõem nem cobrem objetos ou âncoras alheias: `interaction/label-layout.ts` separa os botões e desenha a linha-guia até a âncora. Durante transições de câmera os botões ficam ocultos (`data-moving`) e o layout não roda.
- Pontos de vista, âncoras e posições dos marcos ficam em `camera/viewpoints.ts` e `world/layout.ts`; a vista geral aprovada por Ruan tem teste de regressão.

## Telas no cenário (ADRs 0006 e 0007)

- A interface renderiza cada tela no build com os mesmos componentes das páginas e a entrega em `screens`; a cena só define tamanho e `transform` 2D (`interaction/screen-layer.ts`), a partir do centro e da largura projetados, e os remove no `dispose`. Não use `CSS3DRenderer`: no Chrome, os elementos dentro do contexto 3D dele não recebem cliques (ADR 0007).
- Posição, rotação e tamanho de cada tela ficam em `screenPlacements` (`world/layout.ts`), com um fundo físico `screen-backing` no marco. O ponto de vista do hotspot é derivado da tela, pela proporção real da câmera, para ela caber inteira e legível; o teste de enquadramento cobre 1280 × 900, 16:9, 9:16 e 360 × 800.
- A tela HTML não tem oclusão: aparece só no ponto de vista do próprio objeto, com a câmera parada de frente. Por isso a órbita limitada vale só na vista geral.
- Em repouso, cada tela mostra um cartão aceso pintado em canvas (`world/signage.ts`), com o rótulo de `hotspots.ts`; o cartão e o halo no chão acendem quando o marcador recebe foco ou ponteiro, ou quando o ponteiro passa sobre o objeto.
- O texto das telas é medido em `cqi` (largura da tela). Ao mudar conteúdo ou tamanho, confira o teste e2e de conteúdo sem corte e as capturas.

## Noite e informação no campo (ADR 0007)

- `world/atmosphere.ts`: fundo, névoa, estrelas, halos dos refletores (`Points` com shader e teto de tamanho), feixes com cor por vértice e mistura aditiva, mancha de luz no gramado, a luz direcional e a hemisférica. Sem pós-processamento.
- `world/signage.ts`: placas de LED com nome, título e cidade de `profile.ts`, cartões das telas e halos dos pontos. O texto é pintado por `world/sign-painter.ts` com a fonte do sistema; fora do navegador (Vitest), as placas ficam só com a cor de fundo.
- Placas e cartões duplicam texto que já está no HTML; o canvas continua `aria-hidden`.

## Depuração

- `?debug` carrega `lil-gui` e `stats` por `import()` dinâmico, a partir de `debug/`. Esse código nunca entra no bundle principal.
- Não deixe `console.log` no código final; use `debug/` ou remova.

## Testes

- Vitest: máquina de estados, escolha de perfil, cálculo de queda de qualidade, mapeamento hotspot → ponto de vista, projeção (matemática pura).
- Playwright: a página funciona com WebGL desativado; “Pular” encerra a chegada; com `prefers-reduced-motion`, não há animação longa.
- FPS, aquecimento e memória exigem aparelho real. Se não foi testado em aparelho real, diga isso no relatório.

## Ciclo visual de entrega

Aplicar a seção 4.1 de `docs/ai/procedures/implement-change.md` para objetos, materiais, câmera e composição, com as capturas de `pnpm capture`. Manter o mapa de problemas e as evidências no relatório da etapa; testes automáticos não substituem inspeção de capturas nem aprovação de Ruan.
