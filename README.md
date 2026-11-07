# Portfólio Ruan Oliveira

Portfólio estático com conteúdo em HTML acessível e uma experiência 3D opcional. A Etapa 0 entrega páginas provisórias e um cubo de teste; os textos e o campo definitivos entram nas etapas seguintes.

O plano aprovado está em [docs/PLANO-IMPLEMENTACAO.md](docs/PLANO-IMPLEMENTACAO.md). Regras de contribuição e de agentes: [AGENTS.md](AGENTS.md).

## Rodar localmente

Requisitos: Node **26.13.0** (`.nvmrc`), pnpm **12.18.0**, bash, jq, shellcheck e git-lfs. Com nvm instalado:

```sh
nvm install
nvm use
command -v corepack >/dev/null || npm install --global corepack
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

O Node 26 pode vir sem Corepack; a terceira linha o instala na versão do Node ativada pelo `nvm` quando necessário. Acesse a URL local exibida no terminal. Não é necessário criar `.env` nem fornecer chaves para desenvolver este site.

No Ubuntu, as ferramentas do harness e as bibliotecas dos navegadores podem ser instaladas com:

```sh
sudo apt-get install jq shellcheck git-lfs
pnpm exec playwright install --with-deps
```

As regras de LFS em `.gitattributes` cobrem arquivos de produção; antes de adicionar qualquer `.blend` ou `.psd`, configure os hooks com `git lfs install`. Vídeo original e fotos pessoais originais ficam fora do repositório.

## Comandos

| Comando                    | Uso                                            |
| -------------------------- | ---------------------------------------------- |
| `pnpm dev`                 | Desenvolvimento                                |
| `pnpm check`               | Astro e TypeScript estrito                     |
| `pnpm lint`                | ESLint, acessibilidade e fronteiras de import  |
| `pnpm format`              | Prettier                                       |
| `pnpm test`                | Testes de unidade                              |
| `pnpm build`               | HTML estático em `dist/`                       |
| `pnpm preview`             | Prévia do build                                |
| `pnpm test:e2e`            | Chromium, Firefox, WebKit e celular emulado    |
| `pnpm test:performance`    | Lighthouse local, sem upload                   |
| `scripts/verify.sh`        | Harness, tipos, lint, unidade e build          |
| `scripts/verify.sh --full` | Inclui navegador e Lighthouse                  |
| `scripts/check-assets.sh`  | Origem das referências e originais fora do Git |

O Playwright inicia uma prévia isolada na porta 4321; encerre qualquer prévia nessa porta antes da execução. O teste do ciclo de GPU roda no Chromium com renderização por software; todos os motores verificam navegação, axe, modo leve e falha de WebGL. Redimensionamento e movimento reduzido são exercitados nos testes; aparelhos reais continuam necessários.

Os comandos de otimização de modelos e vídeo serão acrescentados junto dos pipelines das respectivas etapas; esta base ainda não contém esses materiais. GSAP entra com a animação de chegada, na Etapa 2.

## Estrutura e convenções

- `src/data/`: fonte única de perfil, navegação e hotspots.
- `src/content/`: coleções de projetos, experiência, formação e certificações.
- `src/pages/`, `src/components/`, `src/layouts/`, `src/styles/`: HTML e tokens CSS.
- `src/ui/`: comportamento do navegador; chama somente a API pública da cena.
- `src/experience/`: Three.js, sem dependência da interface ou do Astro.
- `tests/`: unidade, navegação e harness.
- `assets-src/`: produção; `public/`: apenas assets de distribuição otimizados.

Código e nomes de arquivos em inglês; texto público, rotas e documentação em pt-BR. TypeScript estrito, sem `any`; estilos usam `src/styles/tokens.css`. As versões compatíveis de TypeScript e ESLint foram aprovadas por Ruan e registradas no [ADR 0002](docs/decisoes/0002-compatibilidade-ferramentas.md).

## Adicionar um projeto

1. Leia [o procedimento de conteúdo](docs/ai/procedures/add-project.md).
2. Crie um Markdown em `src/content/projetos/`, seguindo o schema em `src/lib/content-schemas.ts` e o rascunho `exemplo.md`.
3. Use `publishable: false` enquanto houver pendências. O exemplo é fictício e não representa a trajetória de Ruan.
4. Nunca inclua material institucional sem autorização expressa, mesmo em rascunhos.
5. Siga [a revisão editorial](docs/ai/procedures/review-content.md) antes de publicar e rode a verificação completa. Páginas individuais e composição definitiva dos estudos de caso entram na Etapa 3.

A validação bloqueia campos públicos com pendências; a seleção pública também bloqueia pendências no corpo do Markdown. Links aceitam somente HTTP/HTTPS, e períodos usam `AAAA-MM`, com fim igual ou posterior ao início.

## Prévia e hospedagem

A configuração está preparada para **Cloudflare Pages**, conforme o [ADR 0001](docs/decisoes/0001-stack.md). Ainda não houve configuração externa, push ou deploy nesta etapa.

Quando autorizado, configurar build `pnpm build`, saída `dist`, Node 26.13.0 e prévias por PR. A variável pública opcional `PUBLIC_SITE_URL` só deve receber uma URL real confirmada; sem ela, não há canonical ou sitemap com domínio inventado. `PUBLIC_ANALYTICS_TOKEN` fica reservado à integração futura do Cloudflare Web Analytics; nenhum script de analytics é carregado nesta base.

A prévia inclui `noindex, nofollow` em metadados e cabeçalhos, além de `robots.txt` restritivo. `_headers` define CSP, Referrer-Policy e cache imutável para assets; modelos e vídeos futuros devem usar nomes versionados ao serem substituídos. Os cabeçalhos dependem do servidor Cloudflare e não são aplicados pelo servidor de prévia do Astro. A publicação final depende da aprovação da Etapa 8.

## Licenças

Código: [MIT](LICENSE). Textos, imagens, modelos, personagem e vídeo: [todos os direitos reservados](LICENSE-CONTENT.md). Dependências mantêm suas próprias licenças.
