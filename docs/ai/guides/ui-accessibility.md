# Guia — Interface e acessibilidade

Áreas: `src/pages/`, `src/layouts/`, `src/components/`, `src/ui/`, `src/styles/`. Referências no plano: seções 2, 3.1, 3.3, 3.4 e 9.

## HTML primeiro

- Toda página é útil sem JavaScript: identificação, menu, projetos, experiência, formação, sobre, contato e currículo.
- O LCP da página inicial é texto HTML, nunca o canvas.
- HTML semântico: um `h1` por página, hierarquia de títulos sem saltos, `nav`, `main`, `footer`, listas para listas. `lang="pt-BR"`.
- Componentes Astro são renderizados no build. Use `<script>` de cliente somente para comportamento que precisa de JavaScript, como menu móvel, painel, preferências ou ponte com a cena.

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
