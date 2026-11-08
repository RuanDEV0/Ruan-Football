# Guia — Interface e acessibilidade

Áreas: `src/pages/`, `src/layouts/`, `src/components/`, `src/ui/`, `src/styles/`. Referências no plano: seções 2, 3.1, 3.3, 3.4 e 9.

## HTML primeiro

- Toda página é útil sem JavaScript: identificação, menu, projetos, experiência, formação, sobre, contato e currículo.
- O LCP da página inicial é texto HTML, nunca o canvas.
- HTML semântico: um `h1` por página, hierarquia de títulos sem saltos, `nav`, `main`, `footer`, listas para listas. `lang="pt-BR"`.
- Componentes Astro são renderizados no build. Use `<script>` de cliente somente para comportamento que precisa de JavaScript, como menu móvel, painel, preferências ou ponte com a cena.

## Home imersiva (ADRs 0006 e 0007)

- A home ocupa a tela com a cena. Nome, título e cidade ficam em HTML sobre a tela de carregamento e são o LCP. Um script inline mínimo decide antes da pintura se a cena carrega sozinha (`data-scene-auto`), para não haver salto de layout.
- Sem JavaScript, sem WebGL, em falha ou no modo leve, a mesma área mostra a planta ilustrada com os pontos como links. Botões que dependem de JavaScript começam com `hidden`.
- O menu permanente fica num `details` nativo (“Menu”), que funciona sem JavaScript e por teclado.
- A região viva (`role="status"`) fica fora da apresentação, que some durante o jogo; a cópia visível do texto não é região viva, para não anunciar duas vezes.
- O fim do carregamento não move o foco: anuncia na região viva. O primeiro Tab continua sendo “Pular para o conteúdo”.
- Ao focar um ponto, o foco vai para o título da tela no cenário; `Esc` ou “Voltar ao campo”, dentro da própria tela, voltam e devolvem o foco ao marcador que abriu. “Usar modo leve” fica sempre disponível nos controles da cena.
- Ao terminar o carregamento, a home entra em campo sozinha depois do fechamento da animação, sem mover o foco. Só quem acionou “Entrar no campo” recebe o foco em “Pular chegada” ou, com movimento reduzido, no primeiro marcador.
- Durante a cena, a informação fica no campo e o HTML continua no documento: o título da página e os resumos são lidos por leitor de tela, e o cabeçalho com o menu fica fora de vista até receber o foco do teclado.
- Os marcadores dos pontos são `<button>` com pictograma decorativo (`aria-hidden`) e o rótulo de `hotspots.ts` como nome acessível. Área de toque de 44 px no pictograma; o foco visível contorna o pictograma.
- O carregamento é a bola quicando de `src/components/Loader.astro` (ADR 0008): a faixa de gramado é a barra de progresso acessível e avança pelas etapas reais. A bola quica por pelo menos 5 s, com “Aquecendo a bola…” se o carregamento terminar antes, e só então é chutada para longe. Os testes avançam o relógio da página com `tests/e2e/field-clock.ts`. Com `prefers-reduced-motion`, a bola fica parada, não há chute nem espera.

## Menu e painel

- O menu permanente tem Projetos, Experiência, Formação, Sobre, Contato e Currículo, e é alcançável por teclado em qualquer estado da cena.
- Painel lateral aberto por um hotspot: foco vai para o título do painel; `Esc` fecha; o foco volta ao botão que abriu; o conteúdo atrás não recebe foco enquanto o painel estiver aberto como modal.
- O painel mostra um resumo e o link para a página completa. Os dados vêm das coleções, nunca de texto duplicado.
- Mudanças de estado relevantes, como “cena carregada” ou “carregamento falhou”, são anunciadas em uma região `aria-live="polite"`.

## Teclado, toque e foco

- Todo controle é um `<button>` ou `<a>` nativo. Não use `div` clicável.
- Foco sempre visível (`:focus-visible`), com contraste adequado sobre a cena.
- Áreas de toque com pelo menos 44 × 44 px.
- Inclua um link “Pular para o conteúdo” no início da página.

## Movimento, áudio e vídeo

- `prefers-reduced-motion: reduce` desliga a chegada animada e transições longas, tanto no CSS quanto na cena. O visitante também pode alternar no menu.
- Nada toca som sem ação do visitante. A primeira versão não tem som ambiente.
- Vídeo: `controls`, `preload="none"`, pôster, legenda WebVTT (`<track kind="captions" srclang="pt-BR">`), aberto em diálogo acessível e nunca obrigatório.
- Modo leve (apresentação alternativa) disponível no menu e lembrado em `localStorage`, com `try/catch`.

## Estilos

- Tokens em `src/styles/tokens.css` (cores, tipografia, espaçamentos, raios, sombras, durações). Componentes usam tokens, não valores soltos.
- Contraste mínimo WCAG AA: 4,5:1 para texto normal e 3:1 para texto grande e ícones. Texto sobre a cena precisa de fundo ou sombra que garanta isso em qualquer enquadramento.
- Layout a partir do celular (mobile-first), sem rolagem horizontal, com legibilidade em 320 px de largura.
- Fontes hospedadas no próprio site, com `font-display: swap` e licença que permita uso na web.

## Metadados

- Cada página define `title`, `description` e URL canônica. Open Graph e JSON-LD (`Person`) entram na Etapa 8.
- Imagens por `astro:assets`, com `alt` descritivo e dimensões explícitas; imagens decorativas com `alt=""`.

## Verificação

- `pnpm test:e2e` inclui axe em cada rota, navegação só por teclado e o cenário com WebGL desativado.
- Teste o painel e o menu também com zoom de 200%.
