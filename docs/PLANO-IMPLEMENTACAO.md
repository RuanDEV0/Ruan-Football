# Plano de implementação — Portfólio Ruan Oliveira

**Status:** plano aprovado pelo Ruan.

**Execução:** a aprovação foi registrada neste documento; a implementação ainda não foi iniciada.

**Revisão técnica (06/11/2026):** adicionadas a arquitetura, a stack, a estrutura do repositório, as configurações (seção 3), a Etapa 0 de fundação técnica, as brechas identificadas (seção 11), as decisões (seção 12) e os riscos técnicos (seção 13). **Revisão aprovada por Ruan em 06/11/2026.**

**Agentes de IA:** as regras de trabalho para agentes estão em `AGENTS.md`; o índice da documentação para IA está em `docs/ai/README.md`.

**Planejamento concluído em 06/11/2026.** Plano, revisão técnica, decisões e harness para agentes de IA estão fechados. A implementação começa pelas etapas 0 e 1, quando Ruan solicitar.

## 1. Direção aprovada

Construir um campo society de bairro explorável, com uma chegada cinematográfica curta, conteúdo profissional em HTML e um personagem próprio reutilizável.

A opção **Campo de origem** fornece o ambiente principal. A opção **Dia de jogo** contribui com uma chegada pelo acesso ao campo, sem exigir um estádio inteiro.

O futebol dá personalidade à visita. Os projetos e estudos de caso demonstram a capacidade profissional de Ruan, com foco em backend, APIs e aplicações web.

### Público e prioridades

- Público principal: recrutadores e outros desenvolvedores.
- Prioridade: experiência memorável, com conteúdo profissional explícito e acessível.
- Ambiente: campo society de bairro fictício, sem atribuir a Ruan uma memória ou um lugar específico.
- Flamengo: referência discreta em detalhes pessoais, reconhecível para quem conhece futebol.
- Dispositivo principal: computador, com experiência também adequada ao celular.
- Vídeo: gravação original de aproximadamente dez segundos, em paisagem, de um pênalti no ângulo.

## 2. Experiência do visitante

O visitante encontra o acesso ao campo, com a identificação profissional já visível:

> **Ruan Oliveira**  
> Desenvolvimento backend, APIs e aplicações web.  
> Boa Vista–RR.

Pode entrar na experiência ou abrir os projetos diretamente. Ao entrar, a câmera atravessa brevemente o acesso e revela o campo society. Depois dessa apresentação, a exploração acontece em um único ambiente compacto.

**Revisão aprovada em 07/11/2026 (ADR 0006):** a home ocupa a tela inteira com a cena. A identificação aparece sobre uma tela de carregamento temática, “bola rumo ao gol”, com progresso por etapas reais; ao concluir, “Entrar em campo” inicia a chegada. Ao focar um ponto, o conteúdo surge numa tela do próprio cenário, com link para a página completa. Sem JavaScript, sem WebGL ou no modo leve, a mesma área mostra a planta ilustrada com os pontos como links.

**Revisão aprovada em 08/11/2026 (ADR 0007):** o campo é noturno e flutua como diorama sobre fundo escuro, com refletores que acendem durante a chegada. Ao terminar o carregamento, a home entra em campo sozinha. Nome, título e cidade aparecem em placas de LED à beira do gramado; os pontos são marcadores com pictograma que acendem o objeto, e “Voltar ao campo” fica na própria tela. Quatro alternativas de carregamento aguardam a escolha de Ruan.

| Elemento | Conteúdo ou interação |
| --- | --- |
| Campo, alambrado e iluminação | Ambiente principal e identidade visual |
| Placar | Seleção dos projetos em destaque |
| Banco lateral | Experiência, formação e certificações |
| Personagem | Apresentação pessoal e pequenas animações |
| Bola e gol | Acesso ao vídeo do pênalti |
| Menu permanente | Projetos, Experiência, Formação, Sobre, Contato e Currículo |

Os pontos interativos terão nomes claros. O visitante poderá acessar o mesmo conteúdo pelo menu, sem precisar descobrir todos os objetos.

A referência ao Flamengo ficará em detalhes pessoais, como as cores de uma camisa ou acessório. O ambiente não precisa usar exclusivamente vermelho e preto nem reproduzir um estádio específico.

**Título de trabalho, sujeito a revisão editorial:** “Ruan — dentro e fora de campo”.

## 3. Arquitetura e base técnica

**Estado do repositório (verificado em 06/11/2026):** contém apenas `LICENSE` (MIT), `README.md` e este plano. Não há código, dependências nem configuração; a base técnica pode ser definida sem restrições herdadas.

A cena começará simples. Texturas, iluminação, animações e efeitos serão acrescentados depois de validar composição e navegação.

### 3.1 Princípios de arquitetura

1. **Conteúdo primeiro, 3D por cima.** Toda página profissional é HTML estático gerado no build. A cena 3D é uma camada opcional carregada sob demanda; sem ela, o site continua completo. Atende diretamente ao critério “projetos e currículo sem depender do 3D”.
2. **Fonte única de dados.** Projetos, experiência, formação, contatos e pontos interativos são definidos uma vez e consumidos pelo menu, pelas páginas e pela cena. O menu e o campo nunca divergem.
3. **Sem backend.** Site estático servido por CDN. Nenhuma funcionalidade da primeira versão exige servidor, banco de dados ou autenticação.
4. **Qualidade adaptável.** A cena se ajusta ao aparelho e às preferências do visitante (movimento reduzido, economia de dados, modo leve).
5. **Separação entre cena e interface.** O código 3D não conhece componentes de interface, e a interface não manipula objetos do Three.js. As duas camadas conversam por uma API pequena e eventos tipados.
6. **Dependências mínimas.** Cada biblioteca precisa justificar o peso e a manutenção que adiciona.

### 3.2 Stack recomendada

| Camada | Escolha | Motivo |
| --- | --- | --- |
| Build e páginas | **Astro**, saída estática | HTML puro por padrão; coleções de conteúdo em Markdown com schema; JavaScript apenas nas ilhas que precisam dele; sintaxe próxima de HTML, com curva baixa para quem vem do backend |
| Linguagem | **TypeScript** em modo `strict` | Tipagem do conteúdo, dos estados da cena e dos eventos |
| 3D | **Three.js** (`WebGLRenderer`) | Já previsto; maior ecossistema e documentação; suporte maduro a glTF. WebGPU não é necessário para um campo compacto |
| Animação | **GSAP** | Linhas do tempo da chegada e das transições de câmera; gratuito, incluindo plugins, desde 2025 (conferir a licença no momento da instalação) |
| Validação de conteúdo | **Zod**, via coleções do Astro | Link faltando, data inválida ou campo obrigatório ausente quebram o build, não a página publicada |
| Estilos | **CSS nativo** com variáveis (tokens) e estilos escopados do Astro | Site pequeno; nenhuma etapa extra de build |
| Destaque de código | **Shiki**, já incluso no Astro | Exemplos de requisição e resposta nos estudos de caso backend |
| Modelos 3D | **Blender → glTF/GLB → gltf-transform** | Formato padrão da web; compressão Meshopt e texturas KTX2 ou WebP |
| Vídeo | `<video>` nativo, **MP4 H.264**, legenda **WebVTT** | Compatibilidade universal; controles nativos acessíveis |
| Runtime e pacotes | **Node.js LTS ativa** (`.nvmrc`) e **pnpm** (fixado em `packageManager`, via Corepack) | Mesmo ambiente local e na CI; lockfile determinístico |
| Qualidade | **ESLint + Prettier**, **Vitest**, **Playwright + axe-core**, **Lighthouse CI** | Padrão de código, lógica, navegação, acessibilidade e orçamento de desempenho |
| CI/CD | **GitHub Actions** | O repositório já está no GitHub |
| Hospedagem | **Cloudflare Pages** | CDN global, prévia por pull request, cabeçalhos de cache configuráveis, analytics sem cookies, sem custo |

**Versões:** usar a última versão estável de cada pacote no momento do scaffold (Etapa 0), fixadas pelo lockfile. Atualizações posteriores entram por pull request, com a CI validando.

### 3.3 Alternativas avaliadas

#### Framework da interface

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| **Astro + Three.js puro (recomendada)** | HTML estático por padrão; páginas geradas a partir do Markdown; 3D isolado e carregado só quando solicitado; SEO e sitemap prontos | Interface e cena se comunicam por eventos, não por estado de framework compartilhado; manter o canvas entre páginas exige cuidado (ver “Conteúdo a partir da cena”) |
| Vite + TypeScript sem framework | Mínimo de abstração; controle total; build muito simples | Roteamento, templates, uma página por projeto, metadados e sitemap feitos à mão; conteúdo escrito em HTML ou TS em vez de Markdown |
| Next.js + React Three Fiber | Ecossistema React amplo (drei, postprocessing); cena declarativa em componentes | Hidratação de React em todas as páginas; mais JavaScript no carregamento; duas abstrações para aprender ao mesmo tempo (React e Three.js) |
| SvelteKit + Threlte | Pouco JavaScript; cena declarativa | Ecossistema 3D menor; menos exemplos; mais um framework a aprender |

#### Biblioteca 3D

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| **Three.js (recomendada)** | Maior comunidade e quantidade de exemplos; glTF maduro; bundle controlável | API imperativa; a organização do código fica por conta do projeto (resolvida pela estrutura da seção 3.7) |
| Babylon.js | Motor completo (física, inspetor, GUI) | Bundle maior; recursos além do necessário |
| PlayCanvas | Editor visual | Fluxo centrado em editor proprietário na nuvem, menos baseado em código versionado |

#### Navegação na cena

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| **Pontos de vista guiados + órbita limitada (recomendada)** | Mesmo comportamento em mouse, toque e teclado; composição sempre controlada; fácil de tornar acessível; cada ponto de vista corresponde a um hotspot | Menos sensação de liberdade total |
| Órbita livre (`OrbitControls`) | Simples de implementar | O visitante se perde ou vê as bordas do cenário; gestos conflitam com a rolagem no celular |
| Personagem controlável em terceira pessoa | Mais próximo de um jogo | Exige locomoção, colisão e controle virtual no celular; contraria o ambiente compacto; atrasa o acesso ao conteúdo |

#### Conteúdo a partir da cena

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| **Telas no cenário com resumo + link para a página completa (aprovada no ADR 0006)** | Imersão no padrão pedido por Ruan; HTML real, nítido e acessível, das mesmas fontes das páginas | Sem oclusão: cada tela aparece só no ponto de vista do seu objeto, posicionada em 2D sobre o canvas (ADR 0007) |
| Painel lateral com resumo + link para a página completa (recomendação original) | A cena continua visível; a página completa tem URL própria, indexável e compartilhável, e funciona sem 3D | Resumo e página completa precisam ser coerentes (garantido pela fonte única de dados) |
| Navegação entre páginas com canvas persistido (View Transitions + `transition:persist`) | URLs reais em toda a navegação | Persistir o contexto WebGL entre páginas é mais frágil; risco de recarregar a cena |
| Todo o conteúdo em sobreposições de uma SPA | Transições contínuas | Conteúdo depende de JavaScript; links diretos e indexação mais fracos |

#### Pontos interativos (hotspots)

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| **Botões HTML sobrepostos à cena, posicionados pela projeção 3D, + raycasting nos objetos (recomendada)** | Teclado, foco e leitor de tela funcionam nativamente; rótulos sempre nítidos; mouse continua podendo clicar no objeto | Atualizar a posição dos botões a cada quadro (custo baixo) |
| Apenas raycasting no canvas | Visual totalmente integrado | Inacessível por teclado e leitor de tela sem uma camada paralela |

#### Estilos e ferramentas de código

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| **CSS nativo + tokens (recomendada)** | Nenhuma dependência; escopo por componente no Astro | Menos utilitários prontos |
| Tailwind CSS | Rapidez e consistência | Mais uma ferramenta; marcação carregada nos estudos de caso |
| **ESLint + Prettier (recomendada)** | Suporte maduro a arquivos `.astro` | Duas ferramentas e mais configuração |
| Biome | Uma única ferramenta, muito rápida | Suporte a `.astro` ainda parcial |

#### Hospedagem

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| **Cloudflare Pages (recomendada)** | CDN global; prévia por PR; arquivo `_headers` para cache e segurança; Web Analytics sem cookies; banda generosa | Limite de 25 MiB por arquivo (suficiente para o vídeo otimizado de dez segundos) |
| Netlify | Similar; formulários nativos, úteis se o contato ganhar formulário | Limites de banda e minutos de build no plano gratuito |
| Vercel | Integração simples; prévias | Limites do plano gratuito; vantagens voltadas a Next.js, que não será usado |
| GitHub Pages | Já integrado ao repositório | Sem prévia por PR nativa; sem cabeçalhos de cache personalizados para modelos e vídeo |

#### Vídeo

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| **Arquivo otimizado servido pelo próprio site (recomendada)** | Simples; dez segundos em 1080p H.264 ocupam poucos MB; sem terceiros | Sem streaming adaptativo (desnecessário para dez segundos) |
| YouTube ou Vimeo incorporado | Streaming adaptativo; sem custo de banda | Marca, recomendações e cookies de terceiros; quebra a estética |
| Serviço de streaming (Cloudflare Stream, Bunny, Mux) | HLS adaptativo e métricas | Custo e configuração acima do necessário |

#### Produção do personagem 3D

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| **Modelagem própria em Blender, low-poly, peças rígidas (recomendada)** | O estilo de boneco articulado dispensa deformação de pele: cada peça gira em sua articulação; rig simples; controle total da identidade | Exige tempo de modelagem e acabamento |
| Geração por IA (imagem ou texto → 3D) como base, com retopologia no Blender | Exploração rápida de formas | Malha irregular, inadequada para articulação sem retrabalho; termos de uso e direitos a verificar |
| Modelo base com animações de biblioteca (ex.: Mixamo) | Animações prontas | Esqueletos humanos padrão não combinam com proporções de boneco; visual genérico |

#### Idioma

| Opção | Vantagens | Desvantagens |
| --- | --- | --- |
| **Somente PT-BR na primeira versão, com estrutura preparada para EN (recomendada)** | Uma única revisão editorial; lançamento mais cedo | Recrutadores estrangeiros dependem de tradução automática até a versão em inglês |
| PT-BR e EN desde o lançamento | Alcança vagas remotas e internacionais | Dobra a revisão editorial de todos os textos |

### 3.4 Visão geral da arquitetura

```text
┌───────────────────────────── Build (Astro) ─────────────────────────────┐
│  src/content/*.md ──(schemas Zod)──► páginas estáticas                   │
│                                      /, /projetos, /projetos/[slug], ... │
│  src/data/profile.ts, hotspots.ts ──► menu, páginas e cena               │
└──────────────────────────────────────────────────────────────────────────┘
                         │ HTML + CSS + JS mínimo, via CDN
                         ▼
┌────────────────────────────── Navegador ────────────────────────────────┐
│  Camada HTML (sempre presente)          Camada 3D (opcional, sob demanda)│
│  • entrada e identificação              • experience/boot()              │
│  • menu permanente                      • máquina de estados             │
│  • painel de conteúdo                   • renderer, câmera e mundo       │
│  • botões dos hotspots  ◄── API + eventos tipados ──►  raycasting        │
│  • preferências: movimento, áudio,      • perfil de qualidade            │
│    modo leve                            • carregamento dos modelos       │
└──────────────────────────────────────────────────────────────────────────┘
```

**Contrato entre interface e cena.** O módulo `src/experience` exporta apenas `boot()`; todo o restante é interno:

```ts
interface Experience {
  goTo(id: HotspotId): Promise<void>;      // move a câmera ao ponto de vista
  showOverview(): Promise<void>;            // volta à vista geral (ADR 0006)
  start(): void;                            // inicia a chegada, chamado pela interface ao fim do carregamento (ADR 0006 e 0007)
  skipArrival(): void;                      // botão "Pular"
  setQuality(profile: QualityProfile): void;
  pause(): void;                            // aba oculta, vídeo aberto
  resume(): void;
  dispose(): void;                          // libera GPU e listeners
  on<E extends keyof ExperienceEvents>(event: E, cb: (payload: ExperienceEvents[E]) => void): () => void;
}

// Eventos: 'progress', 'ready', 'arrival:done', 'hotspot:hover',
//          'hotspot:select', 'quality:downgrade', 'error'
// BootOptions (ADR 0006): quality, reducedMotion, hotspotButtons, screens, onProgress, debug
```

**Fonte única dos pontos interativos:**

```ts
// src/data/hotspots.ts
export const hotspots = [
  { id: 'scoreboard', label: 'Projetos',               route: '/projetos',      object: 'hs_placar' },
  { id: 'bench',      label: 'Experiência e formação', route: '/experiencia',   object: 'hs_banco' },
  { id: 'character',  label: 'Sobre o Ruan',           route: '/sobre',         object: 'hs_personagem' },
  { id: 'goal',       label: 'O pênalti',              route: '/sobre#penalti', object: 'hs_gol' },
] as const satisfies readonly Hotspot[];
```

**Fluxo de carregamento:**

1. O HTML entrega identificação, menu e o link “Ver projetos”; a home é imersiva (ADR 0006) e a identificação fica sobre a tela de carregamento. O LCP é um elemento HTML, nunca o canvas. Durante a cena, essas informações aparecem no próprio campo e o HTML continua disponível para leitores de tela e para o teclado (ADR 0007).
2. A detecção de capacidade (WebGL2, `navigator.connection.saveData`, `deviceMemory`, `prefers-reduced-motion`) escolhe o perfil de qualidade.
3. Em aparelhos capazes, sem economia de dados e sem modo leve, o código 3D começa a carregar ao abrir a home (ADR 0006); nos demais, só ao clicar em “Entrar no campo”.
4. O progresso exibido é real: etapas concluídas (código da cena, campo montado, materiais compilados, primeiro quadro) e, quando houver modelos, o `LoadingManager` do Three.js. Ao concluir, a interface mostra o fechamento da animação e chama `start()` (ADR 0007).
5. Falha, tempo esgotado ou ausência de WebGL levam à apresentação alternativa, sem bloquear o menu.

### 3.5 Estados da experiência

```text
entrada ──"Entrar"──► carregando ──ok + fechamento da animação──► chegada ──fim ou "Pular"──► explorando ◄──► foco(hotspot) ──► painel
   │                      │                                              ▲                              │
   │                      └──erro / sem WebGL──► alternativa             └──────────── fechar ──────────┘
   └──"Ver projetos"──► páginas HTML

Qualquer estado da cena ──aba oculta ou vídeo aberto──► pausado ──► estado anterior
```

- Com movimento reduzido, a chegada vira um corte com esmaecimento curto, e as transições de câmera ficam instantâneas.
- Na home imersiva (ADR 0006), “entrada” é a tela de carregamento e “foco” mostra a tela do objeto no cenário; o estado “painel” fica reservado. A órbita limitada vale só em “explorando”, para a tela focada ficar de frente para a câmera (ADR 0007).
- Implementação: máquina de estados própria e tipada, com poucas dezenas de linhas e testada com Vitest. **Alternativa:** XState, mais robusta e com visualizador, mas com mais peso e aprendizado do que o fluxo exige.

### 3.6 Perfis de qualidade e apresentação alternativa

| Perfil | Quando | Ajustes |
| --- | --- | --- |
| Alto | Computador com bom desempenho | `pixelRatio` até 2, antialias, sombra dinâmica do personagem |
| Médio | Padrão no celular | `pixelRatio` até 1,5, apenas iluminação assada, sem sombra dinâmica |
| Baixo | Aparelho fraco ou FPS baixo sustentado | `pixelRatio` 1, texturas reduzidas, menos luzes |
| Alternativo | Sem WebGL, erro de carregamento ou escolha do visitante (“Modo leve”) | Imagem renderizada do campo com os mesmos botões HTML dos hotspots sobre ela |

- Durante a exploração, a média de FPS é medida em janelas de cerca de dois segundos. Abaixo do limite, a qualidade cai **uma vez** por nível; ela não sobe automaticamente na mesma sessão, para evitar oscilação.
- O evento `webglcontextlost`, comum no Safari em aparelhos com pouca memória, leva à apresentação alternativa com opção de tentar novamente.
- A apresentação alternativa preserva o clima do campo e a navegação pelos mesmos pontos, sem custo de GPU.

### 3.7 Estrutura do repositório

```text
Ruan-Football/
├── .github/workflows/ci.yml        # verificação de cada PR
├── assets-src/                     # fontes de produção, fora do bundle
│   ├── blender/                    # .blend versionados com Git LFS
│   ├── referencias/                # referências visuais aprovadas
│   └── scripts/                    # otimização de modelos e vídeo
├── docs/
│   ├── PLANO-IMPLEMENTACAO.md
│   └── decisoes/                   # ADRs: 0001-stack.md, ...
├── public/
│   ├── models/                     # .glb otimizados
│   ├── video/                      # MP4, pôster e legenda .vtt
│   ├── decoders/                   # decodificadores KTX2/Meshopt, se usados
│   ├── cv/                         # currículo em PDF
│   └── _headers                    # cache e segurança na hospedagem
├── src/
│   ├── content.config.ts           # schemas das coleções
│   ├── content/
│   │   ├── projetos/               # sirius.md, inspectgov.md, ...
│   │   ├── experiencia/            # dpe-rr.md, compass-uol.md
│   │   ├── formacao/
│   │   └── certificacoes/
│   ├── data/
│   │   ├── profile.ts              # nome, título, cidade e contatos
│   │   └── hotspots.ts             # hotspot ↔ rótulo ↔ rota ↔ objeto da cena
│   ├── layouts/                    # BaseLayout, CaseStudyLayout
│   ├── components/                 # Menu, Painel, Entrada, CardProjeto, Video, Diagrama
│   ├── pages/                      # index, projetos/[slug], experiencia, formacao, sobre, contato, 404
│   ├── ui/                         # scripts de cliente: menu, painel, preferências, ponte com a cena
│   ├── experience/                 # 3D em TypeScript puro, sem dependência do Astro
│   │   ├── index.ts                # boot(): única API pública
│   │   ├── core/                   # renderer, loop, resize, assets, quality
│   │   ├── state/                  # máquina de estados e eventos tipados
│   │   ├── camera/                 # rig, pontos de vista, timeline da chegada
│   │   ├── world/                  # campo, alambrado, luzes, placar, banco, gol, bola
│   │   ├── character/              # modelo e animações
│   │   ├── interaction/            # raycasting e projeção dos hotspots
│   │   └── debug/                  # lil-gui e stats, carregados só com ?debug
│   ├── styles/                     # tokens.css, global.css
│   └── lib/                        # utilitários compartilhados
├── tests/
│   ├── unit/
│   └── e2e/
├── astro.config.mjs
├── tsconfig.json
├── eslint.config.js
├── playwright.config.ts
├── package.json
├── .nvmrc  .editorconfig  .gitattributes  .gitignore  .env.example
├── LICENSE                         # MIT: somente o código
├── LICENSE-CONTENT.md              # textos, imagens, modelos, personagem e vídeo: todos os direitos reservados
└── README.md
```

**Schema de um projeto** (resumo; valida a estrutura de estudo de caso da seção 7):

```ts
project = {
  title, summary, order, featured: boolean,
  status: 'development' | 'staging' | 'production' | 'completed',
  role,                        // "Minha participação"
  period: { start, end? },
  stack: string[],
  links: { repository?, demo?, docs? },   // URLs validadas
  cover?: image,
  publishable: boolean,        // false impede a geração da página
}
// Corpo em Markdown: Problema, Minha participação, Solução, Decisões técnicas, Evidências, Aprendizados.
```

O campo `publishable` garante que um caso com autorização pendente, como o Sírius, possa ser escrito no repositório sem ir para o site.

### 3.8 Configurações

| Arquivo ou recurso | Configuração |
| --- | --- |
| `tsconfig.json` | Estende `astro/tsconfigs/strict`; `noUncheckedIndexedAccess`; alias `@/*` → `src/*` |
| `astro.config.mjs` | `output: 'static'`; `site` com o domínio final; integração de sitemap; chunk separado para `three` e `gsap` |
| `.env.example` | `PUBLIC_SITE_URL`, `PUBLIC_ANALYTICS_TOKEN`. Site estático não guarda segredos |
| `package.json` | `packageManager` fixando o pnpm; `engines.node` |
| `.nvmrc` | Versão LTS do Node usada localmente e na CI |
| `.editorconfig` | UTF-8, LF, indentação de 2 espaços |
| `.gitattributes` | Git LFS para `*.blend`, `*.psd` e texturas fonte; normalização de fim de linha |
| `.gitignore` | `node_modules/`, `dist/`, `.astro/`, `.env`, arquivos temporários do Blender e o vídeo original |
| `public/_headers` | Cache imutável para `/_astro/*`, `/models/*` e `/video/*`; Content-Security-Policy básica; `Referrer-Policy` |
| Modo depuração | `?debug` carrega lil-gui e stats por import dinâmico, fora do bundle de produção |
| Dependências | Dependabot mensal, agrupando atualizações de patch e minor |

**Scripts:**

| Script | Função |
| --- | --- |
| `pnpm dev` / `build` / `preview` | Desenvolvimento, build estático e prévia local do build |
| `pnpm check` | `astro check` + verificação de tipos |
| `pnpm lint` / `format` | ESLint e Prettier |
| `pnpm test` / `test:e2e` | Vitest e Playwright |
| `pnpm assets:models` | Otimiza os GLB exportados do Blender para `public/models/` |
| `pnpm assets:video` | Gera as versões de reprodução, o pôster e confere a legenda |

### 3.9 Pipeline de assets

**Modelos 3D**

1. Modelar em Blender (`assets-src/blender/`), com 1 unidade = 1 metro e exportação glTF com Y para cima.
2. **Assar** a iluminação dos refletores em lightmaps: o campo noturno fica bonito com custo baixo de GPU, o que é decisivo no celular.
3. Nomear objetos interativos com o prefixo `hs_` (`hs_placar`, `hs_banco`) para que o código localize as áreas de clique pelo nome, sem coordenadas fixas no código.
4. Exportar `.glb` e rodar `pnpm assets:models` (gltf-transform: `dedup`, `prune`, `weld`, compressão Meshopt, texturas KTX2 ou WebP, no máximo 2048 px).
5. Personagem e cenário em arquivos separados, para que o personagem seja reutilizado em renders, imagem de compartilhamento e vídeo.

**Vídeo**

1. O original fica **fora do Git**, com backup pessoal, e nunca é recomprimido.
2. `pnpm assets:video` (ffmpeg): MP4 H.264 em 1080p e 720p com `+faststart`, áudio AAC e pôster em AVIF e JPG do quadro do chute.
3. Legenda ou descrição em WebVTT (`pt-BR`), por exemplo: “[torcida comemora]”.
4. Reprodução com `preload="none"`, iniciada pelo visitante, em diálogo acessível; a cena pausa enquanto o vídeo está aberto.

**Imagens:** capturas dos projetos e renders do personagem processados por `astro:assets` (AVIF/WebP com dimensões fixas, evitando deslocamento de layout).

**Diagramas dos projetos backend:** SVG exportado de uma ferramenta de diagramas (Excalidraw ou draw.io) e versionado no repositório. **Alternativa:** Mermaid renderizado no build, mais fácil de editar como texto, mas exige um navegador headless durante o build.

### 3.10 Qualidade e testes

| Camada | Ferramenta | O que cobre |
| --- | --- | --- |
| Tipos | `astro check` e `tsc` | Código e conteúdo |
| Padrão de código | ESLint + Prettier | Estilo e erros comuns |
| Unidade | Vitest | Máquina de estados, escolha de perfil, coerência entre hotspots e rotas, utilitários |
| Navegação | Playwright (Chromium, WebKit e Firefox; viewport de celular) | Menu, rotas, teclado, movimento reduzido e funcionamento sem WebGL |
| Acessibilidade | `@axe-core/playwright` | Contraste, rótulos e ordem de foco |
| Desempenho | Lighthouse CI com orçamentos | LCP, CLS e peso de JavaScript |
| Manual | Aparelhos de referência | FPS, aquecimento, toque, áudio e vídeo |

**CI em cada pull request:** instalação → `check` → `lint` → `test` → `build` → `test:e2e` → Lighthouse. A hospedagem gera uma prévia por PR para a validação de Ruan.

**Publicação:** até a aprovação da Etapa 8, a branch `main` publica apenas em uma URL de prévia, sem domínio final e com `noindex`. O lançamento é uma ação explícita, conforme a seção 10.

### 3.11 Orçamentos de desempenho iniciais

Estes valores são hipóteses de partida. Serão medidos no protótipo da Etapa 2 e revisados antes do acabamento, como previsto na seção 9.

| Métrica | Alvo inicial |
| --- | --- |
| LCP da página inicial (4G) | ≤ 2,5 s, com elemento HTML |
| CLS | ≤ 0,1 |
| JavaScript inicial sem a cena (gzip) | ≤ 50 KB |
| Código da cena: Three.js, GSAP e código próprio (gzip) | ≤ 250 KB |
| Modelos e texturas da cena (perfil médio) | ≤ 3 MB |
| Draw calls | ≤ 100 |
| Triângulos | ≤ 150 mil |
| FPS | 60 no computador; ≥ 30 estáveis no celular de referência |
| Vídeo em 1080p | ≤ 8 MB |

**Aparelhos de referência propostos:** notebook com GPU integrada; Android intermediário com cerca de 4 GB de RAM; iPhone de três a quatro gerações anteriores. Ruan confirma a quais tem acesso.

**Navegadores suportados:** duas últimas versões de Chrome, Edge, Firefox e Safari; Safari no iOS 16 ou posterior.

### 3.12 Fluxo de trabalho

- Uma branch por tarefa ou etapa (ex.: `etapa-0/fundacao`), integrada à `main` por pull request com CI verde.
- Cada PR gera uma prévia, que serve como entrega para a validação da etapa.
- Mensagens de commit no padrão Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Decisões técnicas registradas como ADRs curtos em `docs/decisoes/`: contexto, decisão, alternativas e consequências.
- Material institucional ou não autorizado nunca entra no Git, nem temporariamente: o histórico de um repositório público não esquece.
- **Idioma do código:** identificadores, nomes de arquivos de código e mensagens de commit em inglês; textos para o visitante, conteúdo, rotas públicas e documentação em pt-BR.

### 3.13 Harness para agentes de IA

`AGENTS.md` é a fonte canônica das regras para qualquer agente. Os arquivos de cada ferramenta (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/`, `.claude/`) apenas apontam para ela e para os guias por área em `docs/ai/`. `scripts/verify.sh` é o ponto único de verificação para agentes, hooks e CI. `scripts/check-ai-docs.sh` mantém a documentação consistente, e `tests/harness/` testa scripts e hooks. Todo código gerado segue `docs/ai/procedures/implement-change.md`: teste primeiro, implementação mínima, melhoria, teste do teste, verificação e autorrevisão. A prática de comentários (comentário nunca descreve o que o código faz; só liga o código ao projeto) está em `docs/ai/guides/code-standards.md`.

## 4. Etapas de implementação e validação

Cada etapa entrega algo concreto para avaliação. Mudanças que afetem etapas posteriores serão resolvidas antes de aprofundar a produção.

As etapas 0 e 1 podem correr em paralelo: a Etapa 0 é técnica e a Etapa 1 é editorial e visual.

### Etapa 0 — Fundação técnica

**Trabalho:** preparar repositório, ferramentas, estrutura e publicação de prévia, sem conteúdo nem cena definitivos.

**Tarefas:**

- [x] Criar o harness para agentes de IA (`AGENTS.md`, adaptadores por ferramenta e `docs/ai/`).
- [x] Criar a verificação do harness: `scripts/verify.sh`, testes em `tests/harness/`, hooks do Claude Code, padrão de código e comentários (`docs/ai/guides/code-standards.md`), `.editorconfig`, `.shellcheckrc` e CI inicial.
- [x] Instalar `shellcheck` e `git-lfs` na máquina de desenvolvimento.
- [x] Registrar as escolhas da seção 12.
- [x] Mover este plano para `docs/` e criar `docs/decisoes/0001-stack.md`.
- [x] Scaffold Astro com TypeScript `strict`; pnpm, `.nvmrc`, `.editorconfig`, `.gitattributes` (Git LFS), `.gitignore` e `.env.example`.
- [x] Criar a estrutura de pastas da seção 3.7.
- [x] Definir os schemas das coleções (projeto, experiência, formação, certificação), com um item de exemplo marcado como `publishable: false`.
- [x] Criar `src/data/profile.ts` e `src/data/hotspots.ts` com os pontos da seção 2.
- [x] Criar layout base, tokens CSS, menu permanente, páginas vazias navegáveis e página 404.
- [x] Criar o módulo `experience/` com `boot()`, loop, redimensionamento, máquina de estados e eventos tipados, exibindo apenas um objeto de teste.
- [x] Implementar detecção de capacidade, movimento reduzido e apresentação alternativa sem WebGL.
- [x] Configurar Vitest, Playwright e axe, com ao menos um teste de cada, chamados por `scripts/verify.sh`.
- [ ] Ampliar `.github/workflows/ci.yml` (Node, pnpm, `scripts/verify.sh --full`, Lighthouse) e configurar o projeto na hospedagem, com prévia por PR e `noindex`.
- [x] Configurar Prettier e ESLint conforme `docs/ai/guides/code-standards.md`, incluindo as fronteiras de import.
- [x] Escrever o README: como rodar, scripts, convenções e como adicionar um projeto.
- [x] Separar a licença do código (MIT) da licença de conteúdo e assets.

**Entrega:** URL de prévia com páginas vazias navegáveis, menu funcional e canvas de teste; CI verde.

**Ruan providencia:** escolhas da seção 12, como idioma, hospedagem, domínio e visibilidade do repositório.

**Validação:** o projeto roda localmente com um comando após a instalação; a prévia abre no computador e no celular; com WebGL desativado, menu e páginas continuam acessíveis.

### Etapa 1 — Conteúdo e direção visual

**Trabalho:** consolidar apresentação, projetos, referências do campo e aparência inicial do personagem.

**Entrega:** roteiro da visita, composição do ambiente, referências visuais e estrutura dos textos.

**Ruan providencia:** currículo atualizado ou correções, confirmação de autoria e status dos projetos e preferências do personagem.

**Validação:** confirmar se a identidade parece pessoal e se o conteúdo representa corretamente a trajetória profissional.

- [x] Base inicial e composição do campo aprovadas por Ruan; Etapa 1 concluída com complementação dos projetos nas Etapas 3 e 5, conforme ADR 0005.

### Etapa 2 — Campo navegável simples

**Trabalho:** construir campo com formas básicas, chegada curta, câmera e pontos interativos provisórios.

**Entrega:** protótipo utilizável em computador e celular, sem depender do acabamento visual completo.

**Ruan providencia:** avaliação da sensação de entrada, enquadramento e exploração.

**Tarefas técnicas:** blockout com primitivas (campo, alambrado, placar, banco, gol e uma cápsula no lugar do personagem); timeline GSAP da chegada com botão “Pular”; pontos de vista por hotspot; botões HTML projetados sobre a cena; perfis de qualidade; primeira medição nos aparelhos de referência para revisar os orçamentos da seção 3.11.

**Revisão aprovada em 07/11/2026:** aproximar a câmera do gramado, escurecer o verde e aumentar a distância entre dois gols. Acrescentar, atrás de um gol, entrada com cadeiras, quiosque de bebidas (janela frontal e porta lateral), depósito de ferramentas/bolas e banheiro ao lado; futebol de sabão no trajeto e pula-pula pequeno mais próximo do campo. Construir e revisar esses objetos em ciclos de implementação, validação, mapeamento de problemas e melhoria, conforme ADR 0004 e procedimento do harness, antes de apresentar a versão para avaliação.

**Revisão aprovada em 07/11/2026 (ADR 0006):** home em tela cheia com carregamento “bola rumo ao gol” e “Entrar em campo”; telas no cenário (telão do placar, quadro tático, placa do personagem e telão do gol) com o resumo de cada página; extensões do contrato registradas no ADR.

**Revisão aprovada em 08/11/2026 (ADR 0007):** campo noturno em diorama, refletores acendendo na chegada, entrada automática, placas de LED com a identificação, cartões acesos nas telas, marcadores com pictograma e destaque no objeto, “Voltar ao campo” dentro das telas e quatro alternativas de carregamento para escolha de Ruan.

**Revisão aprovada em 08/11/2026 (ADR 0008):** carregamento único com a bola quicando, chutada para longe no fechamento; na chegada, a câmera acompanha a bola que entra no gol de “O pênalti” e sobe para a vista geral. As quatro alternativas do ADR 0007 saem. A bola quica por pelo menos 5 s antes do chute.

- [x] Protótipo aprovado por Ruan; Etapa 2 concluída localmente em 08/11/2026. Medição nos aparelhos de referência, prévia externa e CI remota passam a ser pré-requisito da validação da Etapa 3, conforme ADR 0009.

**Validação:** testar duração da chegada, clareza das interações e adequação da câmera. Encurtar a entrada, restringir a câmera ou reposicionar elementos conforme os resultados.

### Etapa 3 — Primeiro estudo de caso

**Trabalho:** conectar um projeto ao campo e ao menu; definir o padrão dos conteúdos HTML.

**Entrega:** um caso completo, com problema, participação, decisões e evidências.

**Ruan providencia:** material do projeto escolhido; preferencialmente Sírius, se disponível para apresentação.

**Tarefas técnicas:** `CaseStudyLayout`; componente de diagrama em SVG; blocos de requisição e resposta com Shiki; conteúdo do caso no telão do placar (ADR 0006), com link para a página completa.

**Validação:** conferir leitura, profundidade técnica e transição entre cena e conteúdo antes de replicar o formato.

### Etapa 4 — Personagem e conjunto visual reutilizável

**Trabalho:** definir personagem, proporções, materiais, roupas e objetos compartilhados.

**Entrega:** personagem em diferentes ângulos e primeira aplicação no campo.

**Ruan providencia:** descrição da aparência; fotos de referência são opcionais e ajudam caso deseje semelhança mais próxima.

**Tarefas técnicas:** modelagem em peças rígidas; rig simples por articulação; animações curtas (parado, saudação e comemoração) em um único GLB tocado por `AnimationMixer`; renders de poses para carregamento e imagem de compartilhamento.

**Validação:** aprovar a identidade visual que servirá de referência para o site, poses, animações e experimento com o vídeo.

### Etapa 5 — Acabamento e conteúdo completo

**Trabalho:** refinar cenário e adicionar demais projetos, trajetória, formação, skills e contato.

**Entrega:** portfólio completo para revisão visual e editorial.

**Ruan providencia:** telas disponíveis, links corretos, currículo final e informações pendentes.

**Validação:** conferir consistência, autoria, dados profissionais e equilíbrio entre exploração e conteúdo.

### Etapa 6 — Vídeo original

**Trabalho:** integrar o pênalti ao gol e preparar apresentação e controles.

**Entrega:** experiência completa com o vídeo real.

**Ruan providencia:** arquivo original do vídeo e contexto que deseja acompanhar a gravação.

**Tarefas técnicas:** `pnpm assets:video`; pôster; legenda WebVTT; diálogo acessível com `preload="none"`; pausa da cena durante a reprodução.

**Validação:** conferir reprodução, qualidade, áudio, enquadramento e funcionamento em computador e celular.

### Etapa 7 — Experimento com bonecos

**Trabalho:** produzir um trecho de teste usando a identidade aprovada; avaliar fidelidade e esforço antes de produzir os dez segundos.

**Entrega:** comparação entre original e versão estilizada.

**Ruan providencia:** avaliação da semelhança, movimento e preservação do lance.

**Validação:** decidir se a transformação preserva a beleza do pênalti e combina com o portfólio.

Esta etapa é **opcional e independente do lançamento inicial**. Se a transformação não atingir o resultado esperado, o portfólio permanece completo com a gravação original.

### Etapa 8 — Verificação e entrega

**Trabalho:** ajustar desempenho, responsividade, teclado, movimento, carregamento e funcionamento.

**Entrega:** versão pronta para aprovação de publicação.

**Ruan providencia:** revisão final do conteúdo e teste nos aparelhos disponíveis.

**Tarefas técnicas:** Lighthouse e axe em todas as páginas; matriz de navegadores e aparelhos; Content-Security-Policy; metadados Open Graph com render do personagem; sitemap; dados estruturados `Person` (JSON-LD); analytics sem cookies; domínio final; remoção do `noindex`.

**Validação:** verificar os critérios de conclusão deste documento e realizar a revisão final antes da publicação.

## 5. Personagem: uma identidade para várias aplicações

Criar uma referência central do personagem para que site e vídeo compartilhem a mesma identidade.

| Recurso | Uso |
| --- | --- |
| Referências de frente, lado e costas | Manter aparência consistente |
| Proporções, cores e roupas definidas | Evitar variações entre imagens, animações e modelo |
| Modelo 3D principal | Personagem dentro do campo |
| Estrutura de articulação, se necessária | Reutilizar movimentos e poses |
| Poses e imagens renderizadas | Retrato, carregamento, apresentação dos projetos e compartilhamento |
| Animações curtas aprovadas | Personagem parado, saudação e reação ao lance |
| Referências para o vídeo | Orientar a versão estilizada do pênalti |

A estética proposta é de boneco articulado inspirado no visual Playmobil, com identidade própria de Ruan. A semelhança desejada e as características essenciais serão definidas na etapa de personagem.

Ruan poderá descrever cabelo, tom de pele, barba, óculos, roupa e acessórios. Fotos são opcionais, mas ajudam caso queira maior semelhança.

**Um vídeo gerado não produz automaticamente um modelo 3D reutilizável.** O modelo e as referências precisam ser construídos como recursos próprios.

- Se a versão do vídeo for feita com animação 3D usando esse modelo, o reaproveitamento será mais direto.
- Se for usada transformação generativa, as referências ajudam, mas será necessário verificar alterações de aparência entre os quadros.

Preparar o personagem para reutilização, produzindo inicialmente apenas as poses e animações que tiverem função na primeira versão.

## 6. Vídeo original e versão estilizada

### Original como referência principal

Preservar o arquivo original como referência. A integração poderá usar uma cópia otimizada para reprodução, sem substituir o material original.

Apresentação proposta:

> **Esse foi no ângulo.**  
> Um momento meu dentro de campo.  
> **Assistir ao original** · **Ver versão de bonecos**

A segunda opção só aparece quando existir uma versão aprovada. Os vídeos serão reproduzidos individualmente, por escolha do visitante.

O vídeo apresenta um momento pessoal. Não será usado, isoladamente, como prova de competências profissionais.

### Objetivos da versão estilizada

- Preservar o lance completo e sua duração.
- Manter enquadramento e ritmo próximos da gravação.
- Representar Ruan com a identidade do personagem do site.
- Preservar especialmente o contato com a bola e sua trajetória até o gol.
- Manter o áudio original, conforme a preferência de Ruan e o material disponível.

### Alternativas de produção

| Alternativa | Vantagem | Limitação |
| --- | --- | --- |
| Transformação visual da gravação | Usa o vídeo como base direta | Pode alterar personagem, bola e movimentos entre quadros |
| Recriação animada com o modelo 3D | Maior controle e reaproveitamento do personagem e cenário | Exige reconstruir câmera, movimentos e trajetória; produção mais trabalhosa |

A escolha será feita após examinar o vídeo e avaliar um trecho representativo, preferencialmente o chute e a chegada da bola ao gol.

**Não assumir que uma transformação generativa preserva fielmente todos os frames.** Manter duração e quantidade de quadros é diferente de preservar cada detalhe visual. A fidelidade absoluta ao registro pertence ao original.

## 7. Organização do conteúdo profissional

### Projetos em destaque

1. **Sírius:** candidato a caso principal pela profundidade técnica relatada.
2. **InspectGov:** processamento e apresentação de dados públicos.
3. **EcoWeb ou Cofrinho:** escolha conforme a participação de Ruan e as evidências disponíveis.

Os demais trabalhos entram em uma lista complementar, com possibilidade de abrir detalhes:

- Car Diagnosis Scheduling System — agendamento de reparos com Spring e PostgreSQL.
- Management Games System — API de gerenciamento de jogos com Spring e PostgreSQL.
- Outros projetos da seleção que não estiverem entre os três destaques.

### Estrutura de cada estudo de caso

1. Problema.
2. Minha participação.
3. Solução.
4. Decisões técnicas.
5. Evidências.
6. Aprendizados.
7. Links disponíveis.

Projetos exclusivamente backend receberão diagramas, exemplos de requisição e resposta e explicações dos fluxos. Não será necessário criar um frontend apenas para conseguir uma imagem.

### Sírius: consolidação necessária

Antes de publicar os textos, confirmar:

- O escopo implementado por Ruan e as contribuições de outras pessoas.
- A diferença entre módulo e sistema completo.
- O status real: desenvolvimento, homologação ou produção.
- Quais informações e materiais podem aparecer publicamente.
- O contexto das métricas de tempo, avaliação de IA e testes.

Os números fornecidos serão apresentados como resultados dos cenários medidos, sem transformá-los em garantias gerais. Eles vieram do material enviado por Ruan e ainda não foram verificados neste trabalho no repositório do Sírius.

### Experiência, formação e skills

- **DPE/RR:** desenvolvimento institucional e módulo Sírius, com responsabilidades e datas confirmadas.
- **Compass UOL:** APIs, Open Finance, serviços AWS, bancos de dados e colaboração em equipe, conforme os dados fornecidos.
- **Formação:** ADS no IFRR, com situação atual a confirmar.
- **Certificações e cursos:** nomes e datas confirmados, distinguindo certificações de cursos.
- **Skills:** conectadas aos projetos e aos contextos em que foram efetivamente utilizadas.

O portfólio mostrará o aprendizado e a execução visual envolvidos em sua construção, sem sugerir uma experiência anterior com Three.js que Ruan não declarou.

## 8. Materiais que Ruan precisa providenciar

Os materiais podem ser enviados conforme a etapa correspondente. Não é necessário reunir tudo antes do início.

| Momento | Material |
| --- | --- |
| Etapa 0 | Escolhas da seção 12: idioma, hospedagem, domínio, visibilidade do repositório e analytics |
| Etapa 1 | Confirmação da situação atual da graduação e do estágio na DPE/RR |
| Etapa 1 | Correções do currículo, nome definitivo do InspectGov e participação no EcoWeb |
| Etapa 3 | Descrição e evidências do primeiro projeto; definição do que pode ser apresentado sobre o Sírius |
| Etapa 4 | Descrição da aparência do personagem e, opcionalmente, fotos |
| Etapa 5 | Capturas dos projetos com interface, links corretos e currículo atualizado |
| Etapa 6 | Vídeo original do pênalti, preferencialmente o arquivo com melhor qualidade disponível |
| Etapa 6 | Uma ou duas frases sobre o momento e preferência quanto ao áudio |
| Etapa 6 | Confirmação de que as demais pessoas que aparecem no vídeo concordam com a publicação |
| Antes da entrega | Confirmação dos contatos públicos e avaliação em computador e celular |

Ruan não precisa providenciar modelos 3D nem imagens de frontend para os projetos backend. A produção dos recursos visuais será tratada dentro do trabalho, com escolhas compatíveis com as ferramentas disponíveis.

### Pendências editoriais conhecidas

- Confirmar se o estágio na DPE/RR continua atualmente.
- Confirmar a situação atual da graduação.
- Consolidar autoria, escopo e status do Sírius.
- Definir quais textos e telas institucionais podem ser apresentados.
- Consolidar o nome público do InspectGov.
- Corrigir o link do EcoWeb no currículo fornecido, que aponta para InspectGovRR.
- Delimitar a participação de Ruan nas aplicações do EcoWeb.

## 9. Critérios de conclusão

- [ ] A atuação profissional é compreensível já na entrada.
- [ ] O visitante consegue explorar o campo e acessar o conteúdo diretamente pelo menu.
- [ ] Projetos e currículo podem ser consultados sem depender do carregamento do 3D.
- [ ] A navegação funciona por teclado e por toque.
- [ ] Há opção de reduzir movimento e controlar o áudio.
- [ ] O pênalti tem controles e não exige reprodução obrigatória.
- [ ] Os textos são legíveis no celular.
- [ ] Projetos backend possuem evidências compreensíveis.
- [ ] Efeitos podem ser reduzidos ou substituídos por uma apresentação visual alternativa quando o aparelho não sustentar a cena.
- [ ] O vídeo possui legenda ou descrição.
- [ ] Compartilhar o link gera pré-visualização com título, descrição e imagem.
- [ ] Os orçamentos de desempenho revisados (seção 3.11) são atendidos nos aparelhos de referência.
- [ ] Nenhum material institucional sem autorização está no repositório ou no site.
- [ ] Conteúdo, autoria, métricas, links e informações profissionais foram revisados.
- [ ] A versão final foi apresentada a Ruan antes da publicação.

Os critérios de desempenho serão definidos com base no protótipo e nos aparelhos de referência, antes do acabamento mais pesado.

## 10. Escopo da primeira versão e evolução

**Primeira versão:** campo compacto, chegada curta, personagem, conteúdo profissional completo e vídeo original.

**Evolução opcional:** versão de bonecos após um teste aprovado. O mesmo personagem poderá ser utilizado em imagens, animações e outros detalhes do site.

**Limites:** não reproduzir cenário, componentes visuais ou materiais de ramen; não inventar fatos profissionais; não condicionar acesso a projetos a assistir ao vídeo ou completar uma interação.

O plano foi aprovado. A implementação começa pelas etapas 0 e 1, quando solicitada, depois da aprovação da revisão técnica. A publicação terá uma revisão final própria.

## 11. Brechas identificadas e tratamento proposto

| # | Brecha no plano anterior | Risco | Tratamento |
| --- | --- | --- | --- |
| 1 | Stack, arquitetura, estrutura e configurações não definidas | Decisões improvisadas durante a construção da cena | Seção 3 |
| 2 | Nenhuma etapa de fundação técnica | A Etapa 2 misturaria configuração do projeto com protótipo | Etapa 0 |
| 3 | Integração entre cena, menu e páginas não especificada | Conteúdo preso ao canvas; menu e campo divergindo | Fonte única `hotspots.ts`, painel e rotas próprias (3.3 e 3.4) |
| 4 | Acessibilidade dos objetos 3D não especificada, embora os critérios exijam teclado | Hotspots inacessíveis por teclado e leitor de tela | Botões HTML projetados sobre a cena (3.3) |
| 5 | Estratégia de carregamento e de falha indefinida | Tela vazia em aparelho fraco ou conexão lenta | Fluxo de carregamento (3.4) e perfis de qualidade (3.6) |
| 6 | Orçamentos de desempenho adiados sem ponto de partida | Acabamento pesado antes de qualquer medição | Hipóteses iniciais revisadas na Etapa 2 (3.11) |
| 7 | Idioma do site não definido | Retrabalho de rotas e conteúdo ao adicionar inglês | Decisão 12.4; estrutura preparada desde a Etapa 0 |
| 8 | Hospedagem, domínio e analytics não definidos | Atraso no lançamento; coleta de dados sem base na LGPD | Cloudflare Pages e analytics sem cookies, dispensando banner de consentimento |
| 9 | A licença MIT do repositório cobriria tudo | Vídeo, personagem, fotos e textos pessoais licenciados como MIT, permitindo reuso livre | MIT apenas para o código; `LICENSE-CONTENT.md` com todos os direitos reservados |
| 10 | Repositório possivelmente público, com material institucional do Sírius e da DPE/RR | Exposição de informação não autorizada; o histórico do Git preserva o que for removido | Campo `publishable`; nada institucional no Git sem autorização (3.12) |
| 11 | Direito de imagem de outras pessoas no vídeo | Publicação sem consentimento | Confirmar consentimento; se não houver, recortar ou desfocar (seção 8) |
| 12 | Vídeo sem legenda ou descrição | Conteúdo inacessível a pessoas surdas ou sem áudio | Legenda WebVTT (3.9) |
| 13 | Os critérios citam controle de áudio, mas não há definição de som ambiente | Escopo extra sem decisão | Primeira versão sem som ambiente; apenas o áudio do vídeo, iniciado pelo visitante |
| 14 | SEO e pré-visualização ao compartilhar não previstos | Link sem imagem nem descrição no LinkedIn | Open Graph com render do personagem, sitemap e JSON-LD (Etapa 8) |
| 15 | Forma de contato indefinida; formulário exigiria serviço externo | Contradição com “sem backend” | E-mail, LinkedIn e GitHub na primeira versão; formulário como evolução opcional |
| 16 | Currículo em PDF e site podem divergir | Datas e cargos inconsistentes entre os dois | Dados no conteúdo do site; PDF atualizado a partir deles; geração automática como evolução |
| 17 | Navegadores e aparelhos de referência não definidos | Testes sem critério objetivo | Seção 3.11 |
| 18 | Ferramentas e fluxo de produção dos assets não definidos | O personagem vira gargalo do cronograma | Pipeline (3.9) e alternativas de produção (3.3) |
| 19 | Referências a marcas de terceiros (Playmobil e Flamengo) | Uso indevido de marca | Inspiração apenas em proporções e estilo; sem nome, logotipo ou formato idêntico ao produto; Flamengo apenas por cores, sem escudo |
| 20 | Manutenção depois do lançamento não prevista | Portfólio desatualizado | Novo projeto = novo arquivo Markdown, documentado no README |
| 21 | Ausência de estimativa de esforço | Dificuldade para planejar as etapas | Estimar o porte das etapas 3 a 8 após medir o esforço real das etapas 0 e 2 |

## 12. Decisões

Confirmadas por Ruan em 06/11/2026. Serão registradas em `docs/decisoes/0001-stack.md` na Etapa 0. O nome do domínio ainda será escolhido.

| # | Tema | Decisão | Alternativa descartada |
| --- | --- | --- | --- |
| 12.1 | Framework | Astro + Three.js puro | Vite + TypeScript sem framework |
| 12.2 | Navegação na cena | Pontos de vista guiados + órbita limitada | Órbita livre |
| 12.3 | Hospedagem | Cloudflare Pages | Netlify |
| 12.4 | Idioma | PT-BR na primeira versão, estrutura pronta para EN | Bilíngue desde o lançamento |
| 12.5 | Domínio | Domínio próprio no formato `nome.dev` ou `nome.com.br`; subdomínio da hospedagem até o lançamento | Apenas o subdomínio gratuito |
| 12.6 | Visibilidade do repositório | Público, também como vitrine de código, sem material institucional | Privado até o lançamento |
| 12.7 | Analytics | Cloudflare Web Analytics, sem cookies | Nenhum, Plausible ou Umami |
| 12.8 | Contato | E-mail, LinkedIn e GitHub | Formulário via serviço externo |
| 12.9 | Produção do personagem | Modelagem própria em Blender, com peças rígidas | Base gerada por IA com retopologia |

## 13. Riscos técnicos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Primeira experiência com Three.js | Atrasos e código difícil de manter | Arquitetura pequena (3.4); blockout antes do acabamento; nenhum pós-processamento antes de medir |
| Desempenho no celular | Cena travando ou aquecendo o aparelho | Iluminação assada; perfis de qualidade; orçamentos; testes em aparelho real desde a Etapa 2 |
| Particularidades do Safari no iOS | Perda de contexto WebGL e limites de memória | Tratamento de `webglcontextlost`; texturas limitadas; WebKit na CI |
| Tempo de produção do personagem | Atraso do lançamento | Cápsula provisória até a Etapa 4; peças rígidas; apenas as animações com função na primeira versão |
| Crescimento de escopo em efeitos visuais | A experiência sufoca o conteúdo | Critérios de validação por etapa; lista de evolução separada (seção 10) |
| Pendências editoriais do Sírius | Caso principal indisponível no lançamento | Campo `publishable`; InspectGov como caso principal alternativo |
