# Etapa 0 — Verificação da base local

Data: 06/11/2026, revalidada em 07/11/2026. **Etapa concluída com a base local em 07/11/2026**, por decisão de Ruan registrada em `docs/decisoes/0003-etapa-0-concluida-localmente.md`. Prévia, CI remota e validação em aparelhos passam a ser pré-requisito da validação da Etapa 2.

## Entrega

- Astro estático com TypeScript estrito e `noUncheckedIndexedAccess`, Node 26.13.0 e pnpm 12.18.0.
- Oito páginas: início, projetos, experiência, formação, sobre, contato, currículo e 404. Menu permanente, link de salto, foco visível, navegação sem JavaScript e layout de 320 px.
- Schemas Zod das quatro coleções; exemplo fictício com `publishable: false`. Campos, URLs e períodos são validados; pendências em projetos públicos bloqueiam a seleção no build.
- Perfil e hotspots como fontes únicas, sem contatos ou fatos profissionais inventados.
- Cubo Three.js carregado apenas após ação do visitante, contrato `boot()`, estados e eventos tipados, resize, pausa de aba oculta, modo leve persistente, movimento reduzido, descarte e alternativa em falha de WebGL.
- Prettier, ESLint com fronteiras estáticas e dinâmicas, Vitest, Playwright, axe e Lighthouse. CI preparada com o mesmo comando local, sem publicação automática.
- Plano movido para `docs/`, referências corrigidas, ADRs 0001 a 0003, README, licença de conteúdo separada e configurações de cache, CSP e `noindex`.

O campo, pontos de vista e animação de chegada entram na Etapa 2; `goTo()` ainda é um contrato provisório sem deslocamento. Os comandos de processamento de modelos e vídeo entram com seus pipelines. Não existem modelos ou vídeos de produção nesta entrega.

## Verificações executadas

`scripts/verify.sh --full` terminou com código 0 e todas as etapas em `ok`: documentação, sintaxe shell, ShellCheck, harness, `check`, `lint`, `test`, `build`, `test:e2e` e `test:performance`. Nenhuma etapa foi pulada na execução final.

- Harness: 44 testes passaram. A fixture agora preserva `.shellcheckrc`, necessário para resolver os arquivos `source` também fora da raiz real.
- Unidade: 15 testes passaram, cobrindo publicação, datas, links, perfis, estados e fronteiras de import, incluindo `import()` dinâmico.
- Navegadores: 21 testes passaram. Chromium, Firefox, WebKit e iPhone emulado cobrem rotas, axe sem violações sérias/críticas, teclado, 320 px, conteúdo sem JavaScript, WebGL desativado e modo leve persistente. Ciclo de GPU e contexto perdido são verificados no Chromium com renderização por software; o teste também proíbe iniciar requestAnimationFrame com movimento reduzido e verifica o redimensionamento.
- Lighthouse: três execuções locais com Chromium e throttling simulado; sem upload dos relatórios.
- `pnpm peers check`: sem conflitos. `git diff --check`: sem erros de whitespace.

Os testes foram vistos falhando antes das respectivas correções: caminho do plano, verificações de pacote/desempenho, fixture do ShellCheck, módulos ainda ausentes, proteção de pendências e imports dinâmicos. O axe detectou um rótulo ARIA em elemento sem papel semântico, corrigido para região. Uma mutação deliberada na detecção de WebGL foi detectada pelo teste; a condição original foi restaurada e a suíte completa passou depois.

## Orçamentos medidos

| Métrica                           | Resultado           | Limite do plano |
| --------------------------------- | ------------------- | --------------- |
| LCP, três medições de laboratório | 760–771 ms          | 2.500 ms        |
| CLS                               | 0                   | 0,1             |
| JavaScript inicial gzip           | 1698 bytes          | 50 KB           |
| Cena + Three.js gzip              | 129250 bytes        | 250 KB          |
| Modelos e texturas externos       | Nenhum nesta etapa  | 3 MB            |
| Vídeo                             | Ausente nesta etapa | 8 MB em 1080p   |

Os valores não são medições em celular real. FPS, aquecimento, memória, draw calls e triângulos não foram medidos. O build emite aviso de chunk minificado acima de 500 KB para Three.js; o tamanho gzip permanece dentro do orçamento aprovado. As coleções de experiência, formação e certificações emitem avisos por ainda estarem vazias.

## Justificativa das dependências

| Grupo                                                                   | Problema resolvido                                           | Peso entregue ao visitante                                           | Alternativa sem a dependência                            |
| ----------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------- |
| Astro e sitemap                                                         | HTML estático, conteúdo e sitemap quando houver domínio real | Astro não adiciona runtime de UI nesta base; sitemap atua no build   | Gerador próprio com Vite, descartado no plano            |
| Three.js e seus tipos                                                   | Cena de teste em WebGL e contratos tipados                   | Incluído nos 129250 bytes gzip opcionais; tipos não entram no bundle | WebGL escrito manualmente                                |
| TypeScript, tipos de Node e Astro check                                 | Verificação de TS e arquivos Astro                           | Nenhum                                                               | Revisão manual e JavaScript; tsc isolado não cobre Astro |
| ESLint, typescript-eslint, plugins Astro/JSX a11y, globals e @eslint/js | Padrão, acessibilidade e fronteiras                          | Nenhum                                                               | Revisão manual sem garantia automática                   |
| Prettier e plugin Astro                                                 | Formatação consistente                                       | Nenhum                                                               | Formatação manual                                        |
| Vitest                                                                  | Lógica pura e contratos                                      | Nenhum                                                               | node:test e configuração própria de TypeScript           |
| Playwright e axe                                                        | Navegação, motores e acessibilidade                          | Nenhum                                                               | Verificações manuais em cada navegador                   |
| Lighthouse CI                                                           | LCP, CLS e transferência de scripts                          | Nenhum                                                               | Medições manuais no DevTools                             |

As versões compatíveis de TypeScript, ESLint e plugin Astro estão registradas no ADR 0002, com as exceções aprovadas por Ruan. Correções transitivas do conversor Astro e do Puppeteer estão limitadas ao tooling em `pnpm-workspace.yaml`. GSAP não foi instalado ainda; será usado com a chegada, evitando dependência sem uso na cena de teste. As bibliotecas de runtime e ferramentas previstas seguem a decisão de stack do ADR 0001.

## O que falta verificar

- Execução remota do GitHub Actions, integração Cloudflare Pages e URL de prévia por PR. Nenhum commit, push, PR ou deploy foi feito pelo agente.
- Aplicação real de `_headers`, CSP e cache na Cloudflare; a prévia do Astro não aplica esses cabeçalhos.
- Inspeção visual manual: tentativa pelo navegador integrado bloqueada porque o host de acesso ao navegador estava indisponível.
- Computador e celular físicos, Safari/iOS real, zoom de 200%, rede lenta real e tecnologia assistiva real.
- Instalação com clone limpo em outro computador. O build e os testes usaram Node 26.13.0 e pnpm 12.18.0 em `/tmp/ruan-football-toolchain`, sem alterar o Node global da máquina. O README explica como ativar a versão por `.nvmrc`.

## Pendências de Ruan

- [[PENDENTE: autorização explícita para commit/push e configuração da prévia na Cloudflare Pages]], exigida pela regra 6 do AGENTS.md. O item combinado de CI/hospedagem permanece desmarcado no plano.
- [[PENDENTE: domínio definitivo]], sem bloquear a prévia em subdomínio da hospedagem.
- E-mail, LinkedIn e GitHub foram recebidos e incorporados posteriormente em `src/data/profile.ts`, na consolidação da Etapa 1. [[PENDENTE: currículo final revisado em PDF]].
- [[PENDENTE: token público do Cloudflare Web Analytics]], para a integração posterior, sem chave privada.
- Rascunho `src/content/projetos/exemplo.md`: [[PENDENTE: participação, tecnologias, problema, autoria, solução, decisões, evidências autorizadas, aprendizados e links fornecidos por Ruan]]. É apenas uma estrutura fictícia e não é publicada.

## Revalidação de 07/11/2026

Pedida por Ruan depois do trabalho de personagem e vídeo. Objetivo: confirmar a base local, fechar brechas do harness e decidir se a etapa pode ser concluída.

**Brechas encontradas e corrigidas no harness**, com testes escritos antes e vistos falhando (19 novos em vermelho), depois verdes:

- `scripts/verify.sh` não conferia a versão do Node. Com o Node 22 do PATH, `check`, `build` e `test:e2e` falhavam com uma mensagem do Astro que parecia defeito do projeto. Agora a etapa “versão do Node” compara com o `.nvmrc`, falha com a instrução `nvm use` e não roda os comandos `pnpm`.
- Com o build quebrado, `test:performance` passava, porque o Lighthouse lê `dist/` e media o build anterior. Agora `test:e2e` e `test:performance` ficam `pulado` quando o build falha.
- As regras de assets não tinham verificação. O novo `scripts/check-assets.sh` exige registro em `assets-src/referencias/ORIGEM.md` para cada referência, recusa fotos (`.jpg`, `.heic`) e imagens embutidas (`data:image`) nas referências, vídeo fora de `public/video/` e citação da marca de referência do boneco em `src/`, `public/` e `assets-src/`.
- `scripts/check-ai-docs.sh` só conferia referências em `docs/ai/` e nos adaptadores. Agora também confere README, relatórios de etapa, ADRs e o registro de origem. Os rascunhos de `docs/conteudo/` ficam de fora porque citam caminhos de outros repositórios e destinos futuros.
- O modo `--files` do hook Stop passou a rodar a checagem de assets ao tocar `assets-src/`, `public/` ou `src/`, e a checagem de documentação ao tocar qualquer arquivo de `docs/` ou o README.

Cada checagem nova recebeu uma mutação deliberada (condição invertida ou linha removida) e algum teste falhou em todos os casos; o código original foi restaurado.

**Resultado com Node 26.13.0 (`nvm use`):** `scripts/verify.sh --full` terminou com todas as etapas em `ok`: documentação, assets e referências, sintaxe shell, ShellCheck, harness (65 testes), versão do Node, `check`, `lint`, `test` (15 testes), `build`, `test:e2e` e `test:performance`. Com o Node 22 do PATH, a verificação falha na etapa “versão do Node” com a instrução de correção, como esperado.

**Orçamentos:** maior chunk gzip em `dist/_astro/` com 128650 bytes (cena opcional, limite 250 KB); os demais com 1755 e 1200 bytes. Nenhum modelo nem vídeo em `public/`.

**Material novo no repositório:** `assets-src/referencias/folha-boneco.html` (folha do personagem, sem fotos embutidas) e seu registro em `assets-src/referencias/ORIGEM.md`; decisões em `docs/conteudo/personagem.md`; segunda inspeção do vídeo em `docs/conteudo/video-penalti.md`, que corrige a leitura anterior sobre o goleiro.

**Não alterado:** `.claude/settings.json`. A liberação de `scripts/check-assets.sh` na lista de comandos permitidos foi bloqueada pelo controle de autoedição do Claude Code; o script funciona, mas pode pedir confirmação ao ser chamado diretamente.

**Encerramento:** a entrega original pedia URL de prévia, CI verde remota e validação em computador e celular, que dependem de commit, push e Cloudflare Pages (regra 6). Ruan decidiu concluir a etapa com a base local; a decisão e suas consequências estão no ADR 0003. A tarefa de CI e hospedagem continua desmarcada no plano até ser executada.

## Como validar

Siga o README para ativar Node/pnpm e instalar as dependências; execute `pnpm dev`. Navegue pelas oito páginas com teclado, experimente “Entrar no campo” e “Usar modo leve”, recarregue e confirme que a preferência persiste. Desative WebGL no navegador e confirme que o menu e os projetos continuam acessíveis. A confirmação em computador e celular físicos fica para a URL de prévia após autorização.
