# Guia — Cena 3D (`src/experience/`)

Referências no plano: seções 3.3 a 3.6, 3.9 e 3.11.

## Arquitetura

- `src/experience/index.ts` exporta somente `boot(container, options): Promise<Experience>` e os tipos públicos. Nada mais é importado de fora.
- A API pública (`goTo`, `skipArrival`, `setQuality`, `pause`, `resume`, `dispose`, `on`) e os eventos (`progress`, `ready`, `arrival:done`, `hotspot:hover`, `hotspot:select`, `quality:downgrade`, `error`) seguem o plano, seção 3.4. Mudar o contrato exige ADR.
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
- A chegada é uma timeline GSAP curta, sempre com “Pular”. Com movimento reduzido, vira um corte.
- Gestos na cena não podem impedir a rolagem da página fora do canvas.

## Hotspots

- A interface cria um `<button>` por hotspot, com rótulo vindo de `hotspots.ts`. A cena projeta a posição 3D e atualiza `transform` a cada quadro, e oculta os botões que estão atrás da câmera ou fora da tela.
- O raycasting no canvas é complementar (mouse e toque). O acesso por teclado e leitor de tela vem dos botões.
- Use áreas de clique simplificadas (caixas invisíveis), não a malha detalhada.

## Depuração

- `?debug` carrega `lil-gui` e `stats` por `import()` dinâmico, a partir de `debug/`. Esse código nunca entra no bundle principal.
- Não deixe `console.log` no código final; use `debug/` ou remova.

## Testes

- Vitest: máquina de estados, escolha de perfil, cálculo de queda de qualidade, mapeamento hotspot → ponto de vista, projeção (matemática pura).
- Playwright: a página funciona com WebGL desativado; “Pular” encerra a chegada; com `prefers-reduced-motion`, não há animação longa.
- FPS, aquecimento e memória exigem aparelho real. Se não foi testado em aparelho real, diga isso no relatório.
