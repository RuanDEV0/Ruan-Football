# Evidências locais para os estudos de caso

Análise em 07/11/2026, a pedido de Ruan, dos projetos em `/home/ruan/repos`. Fontes: código, manifests e READMEs locais. Inspeção estática, por amostragem; as aplicações e suas suítes não foram executadas. Existência de uma rota ou dependência não comprova funcionamento em produção, autoria individual, implantação ou cobertura de testes. Datas de arquivos e commits não foram usadas como datas dos projetos.

Este documento complementa os textos editoriais de `docs/conteudo/etapa-1.md`; não muda a ordem de destaque do plano. Não houve cópia de código ou assets dos outros projetos, nem leitura de `.env`. Os repositórios de origem não foram alterados.

## Inspect Gov RR

**Raiz:** `/home/ruan/repos/InspectGovRR`.

**Confirmado no código/documentação:** Django, PostgreSQL, httpx, Gunicorn e WhiteNoise. HTML renderizado no servidor; a navegação consulta snapshots locais, enquanto um scheduler separado sincroniza a API Transparência RR. O identificador técnico `fiplan_api` é descrito como legado no README; o texto público deve identificar corretamente a fonte oficial, sem confundir o nome interno com o nome atual da API.

**Funcionalidades encontradas:** receita arrecadada, diárias, remunerações, contratos, unidades e glossário. O README distingue consultas disponíveis de temas “Em preparação”, além de explicar limites dos rankings e períodos dos dados.

**Evidências rastreáveis:**

- `README.md`, `requirements.txt`, `InspectGovRR/urls.py`: arquitetura declarada, dependências e rotas.
- `integrations/fiplan_api/client.py`: cliente HTTP com autenticação, timeout e renovação após resposta 401. O cliente amostrado é síncrono; não atribuir asyncio à implementação atual somente por constar no currículo anterior.
- `integrations/management/commands/run_sync_scheduler.py`: entrada de sincronização periódica.
- `integrations/sync/dailies.py` e `creditors.py`: transações na atualização; inserções em lote no segundo arquivo.
- `integrations/tests.py`, `portal/tests.py`, `contratos/tests.py`: fontes de testes presentes; não executadas nesta análise.

**Texto técnico proposto:** “A navegação lê dados já persistidos em PostgreSQL. A coleta ocorre em um processo separado, que autentica na fonte externa, valida os dados e atualiza os conjuntos locais.” É uma descrição da arquitetura observada; a justificativa pessoal e as alternativas consideradas ainda dependem de Ruan.

**Evidências a produzir:** diagrama `API externa → sincronização → PostgreSQL → Django/HTML`; captura da página inicial e de uma consulta com período/fonte visíveis. Usar dados autorizados e evitar expor identificadores pessoais nas capturas.

[[PENDENTE: período e status do projeto, decisões pessoais e aprendizados; testes executados e evidências de implantação, se forem citados]].

## EcoWeb

**Raízes:** `/home/ruan/repos/ecoweb/api`, `/home/ruan/repos/ecoweb/web/ecoweb-site` e `/home/ruan/repos/ecoweb/mobile/EcoWebMobile`.

**API:** Node.js, Express, Mongoose/MongoDB, JWT, bcryptjs, Pino e Swagger/OpenAPI. Rotas e controllers para autenticação, usuários, empresas, materiais, projetos, favoritos, pesquisa e feedback. `src/http/routes/materialRoutes.js` distingue leitura pública de operações autenticadas de cadastro, alteração e exclusão. `package.json` e `test/` contêm um comando de testes Node e fontes de testes para serviços, validações e HTTP; a presença desses arquivos não equivale a suíte aprovada.

**Web:** React, Next.js, TypeScript, Tailwind e Axios. `app/services/materialServices.ts` faz chamadas reais à API para cadastro, listagem, consulta, edição, exclusão e atualização de status de materiais. Há páginas de login, cadastro, dashboard e materiais.

**Mobile:** React Native, Expo, TypeScript e Expo Router. Há telas para autenticação, materiais, projetos, busca, perfil e favoritos.

**Limite importante:** `app/dashboard/reports/page.tsx` e `app/dashboard/inbox/[id]/page.tsx` do website usam dados de demonstração de `dashboardMocks`. No mobile, `app/chat/[id].tsx` usa `MOCK_CHAT_HISTORY`; o envio amostrado apenas registra uma mensagem no console e limpa o campo. Não apresentar chat integrado, relatórios de produção ou comunicação em tempo real como funcionalidades comprovadas. A autoria integral declarada por Ruan não implica que todos os módulos estejam concluídos ou integrados.

**Texto técnico proposto:** “Desenvolvi a API, o website e o aplicativo do EcoWeb. A plataforma organiza materiais reutilizáveis e projetos de reaproveitamento, com autenticação e operações de cadastro. Algumas telas ainda utilizam dados de demonstração.” A autoria é declaração de Ruan; a arquitetura e os limites acima foram observados no código.

**Capturas futuras:** priorizar o fluxo de materiais com integração real. Identificar expressamente telas de demonstração, caso sejam mostradas. Preparar diagrama `web/mobile → API Express → MongoDB`.

[[PENDENTE: período, status atual de implantação, aprendizados e justificativas das decisões; execução dos testes e das aplicações]].

## Cofrinho

**Raiz:** `/home/ruan/repos/backend`, identificada pelo README como Cofrinho API/BACKEND.

**Confirmado:** Node.js, Express, Sequelize/PostgreSQL, JWT, Zod, Axios, Nodemailer e Swagger. Organização em `application`, `domain`, `http`, `infra` e `shared`. Há rotas de autenticação, recuperação de senha, contas, instituições, grupos, participantes, despesas e notificações. README e módulos de integração descrevem Open Finance; não foram feitas chamadas bancárias ou consultas a serviços externos.

**Evidências:** `package.json`, `README.md`, `src/http/routes/authRoutes.js`, `groupRoutes.js`, `accountRoutes.js`, `src/application/services/ExpenseService.js`. O último contém acesso a grupos, despesas e participantes através de serviços/repositórios.

**Texto técnico proposto:** “API para organizar despesas compartilhadas em grupos, com autenticação, recuperação de acesso, registros de despesas e integração com serviços de Open Finance.” A participação específica de Ruan continua separada da descrição do sistema.

**Limites:** o manifest amostrado não contém script de testes. Não foi confirmada uma suíte automatizada nesta raiz; não atribuir contagem ou cobertura. A existência de integrações no código não comprova operação bancária real ou homologação.

**Evidências futuras:** diagrama por camadas, exemplo de criação de grupo e divisão de despesa com dados sintéticos. Não é necessário construir frontend para o portfólio.

[[PENDENTE: participação individual, período, status, decisões pessoais e aprendizados]].

## Projetos Spring complementares

| Projeto                         | Raiz e evidências                                                                                          | O que o código permite descrever                                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Car Diagnosis Scheduling System | `/home/ruan/repos/api-server/system.springboot`; `pom.xml`, controllers e `service/SchedulingService.java` | Java 21, Spring Boot, Spring Security, JPA, PostgreSQL/H2, MapStruct e JWT; autenticação, veículos, serviços e agendamentos, incluindo atualização de status |
| Management Games System         | `/home/ruan/repos/games-list/dvgame-list`; `pom.xml`, `GameListController.java`, `GameListService.java`    | API com Spring/JPA, listas e jogos; reordenação por índices e atualização transacional das posições do trecho afetado                                        |

Os controllers ficam sob `src/main/java/` nos respectivos pacotes. Existem fontes de teste no caminho `src/test`, mas não foram executadas. H2 e PostgreSQL nos manifests não provam qual banco está ativo em uma implantação.

[[PENDENTE: períodos, status, autoria detalhada e origem de eventual material de curso; exemplos executados e aprendizados]]. Não inferir autoria pelo nome da pasta ou do pacote.

## Outros diretórios encontrados

| Diretório         | Observação documental/estática                                                                                                                                                         | Tratamento editorial                                                                                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ruan-fit`        | Aplicativo Android; Kotlin, Compose/Material 3, ViewModel/Flow, Room e Hilt no README e arquivos correspondentes. Fontes para fichas, séries, histórico, progresso, cronômetro e mídia | Candidato complementar; confirmar autoria, status, link público e se Ruan deseja incluí-lo                                                                                                               |
| `vpn-tunel`       | Aplicativo Android; README e fontes para VPN WireGuard por aplicativo, DataStore e armazenamento cifrado com Android Keystore                                                          | Candidato complementar; handshake real e segurança em execução não foram testados; confirmar autoria e seleção                                                                                           |
| `3D-Maps`         | `index.html` contém exemplo Google Maps/Street View com avisos de copyright/licença Google. `index.js` e `index.css` estão vazios                                                      | Tratar como estudo/exemplo até esclarecer as alterações autorais; não apresentar como sistema 3D próprio                                                                                                 |
| `Ramen-Shop`      | Manifest com Three.js, GSAP, Howler, pós-processamento e Webpack; fontes e assets de uma experiência 3D                                                                                | Confirmar origem, autoria e licenças antes de incluir; não reutilizar cenário ou assets no portfólio nem atribuir experiência prévia com Three.js automaticamente                                        |
| `dpe`             | Estrutura institucional com manifests em subprojetos                                                                                                                                   | Não transcrever detalhes de implementação ou assets sem delimitar a autorização                                                                                                                          |
| `pntp-defensoria` | Diretório institucional indicado no conjunto de fontes locais                                                                                                                          | Nenhum manifest reconhecido na busca realizada; não inferir ausência de código. Para conteúdo institucional no Git, manter a autorização limitada à citação de autoria/homologação do Sírius já recebida |
| `Ruan-Football`   | Este portfólio, com plano e verificação próprios                                                                                                                                       | Não confundir o desenvolvimento atual com experiência anterior declarada por Ruan                                                                                                                        |

## Pendências resolvidas e limites

Os caminhos locais dos cinco projetos já selecionados foram localizados. Há agora evidências para explicar arquitetura e preparar diagramas e capturas reais. Isso reduz as perguntas sobre tecnologias e funcionalidades; as lacunas de autoria não confirmada, contexto das decisões, datas e implantação não são resolvidas apenas pela leitura do código.

As capturas continuam para entrega posterior de Ruan. O levantamento não promove nenhum projeto a `publishable: true`, não altera a seleção de destaques, não acessa serviços bancários e não executa migrações, seeders ou aplicações de origem.

## Verificação da entrega

`scripts/verify.sh` passou: documentação, sintaxe shell, ShellCheck, harness, tipos, lint, testes de unidade e build do portfólio. E2E e Lighthouse apareceram como `pulado` por serem do modo `--full`; esta atualização alterou somente conteúdo/dados e documentação, sem páginas, interface ou cena. Não foram executadas as suítes dos projetos analisados nem verificados seus ambientes de produção.

As imagens de certificados foram interpretadas visualmente; a AWS não foi validada em serviço externo. O arquivo de vídeo manteve o SHA-256 registrado após a análise. Sem dependências novas, alteração de páginas ou inclusão de mídia no bundle. `git diff --check` passou.
