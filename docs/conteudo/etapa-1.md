# Etapa 1 — Consolidação editorial e roteiro

Fonte principal: currículo, texto do perfil GitHub e material enviados por Ruan nesta conversa. Base inicial aprovada por Ruan; estudos de caso completos continuam sujeitos à complementação e revisão de publicação. Identificação, apresentação e contatos confirmados ficam em `src/data/profile.ts`, consumidos pelo site, sem repetir os endereços neste documento.

## Situação das etapas

A Etapa 0 tem a base local pronta; prévia externa e CI remota continuam pendentes. Este envio inicia a parte editorial da Etapa 1. As capturas podem ser entregues depois, conforme solicitado por Ruan; elas pertencem à preparação de evidências e ao acabamento, e não impedem o trabalho editorial atual.

**Encerramento em 07/11/2026:** Ruan aprovou a composição do campo, a apresentação e as informações iniciais exibidas na revisão local. A Etapa 1 está concluída com essa base inicial, conforme `docs/decisoes/0005-etapa-1-base-editorial-aprovada.md`. A complementação de períodos, status, participação, decisões, aprendizados e evidências segue nas Etapas 3 e 5. A aprovação do personagem definitivo pertence à Etapa 4. Os marcadores de pendência continuam válidos até Ruan fornecer cada informação.

O currículo recebido contém os dados necessários para montar uma versão revisada, mas ainda há divergências de nomes, status e autoria. Não foi gerado um PDF definitivo com essas lacunas.

## Apresentação e currículo

- Manter a identificação curta e o posicionamento profissional aprovados no plano. Nome completo e apresentação pessoal foram incorporados à fonte de perfil.
- Objetivo editorial proposto: “Busco uma oportunidade como desenvolvedor de software júnior, com foco em backend, APIs e aplicações web.” Texto inicial aprovado por Ruan.
- Organizar currículo em apresentação, experiência, projetos, formação e certificações/cursos. Associar tecnologias aos trabalhos em que foram utilizadas, sem barras de nível.
- O telefone foi fornecido no currículo. [[PENDENTE: confirmar inclusão do telefone no PDF público]]. Os canais de contato do site seguem e-mail, LinkedIn e GitHub, como aprovado na decisão 12.8.
- [[PENDENTE: aprovação do texto final e geração do currículo em PDF]].

## Experiência e formação

A experiência atual na DPE/RR foi estruturada em `src/content/experiencia/dpe-rr.md`, com a citação de autoria do Sírius autorizada por Ruan e sem detalhes internos. A experiência na Compass UOL foi estruturada como rascunho em `src/content/experiencia/compass-uol.md`, usando as datas e responsabilidades informadas. Os dois arquivos permanecem `publishable: false` até revisão.

| Item recebido                                          | Informação disponível                                    | Pendência antes da versão final                                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Estágio na DPE/RR                                      | Novembro de 2025–atual; continuidade confirmada          | Continuidade confirmada por Ruan; revisar a redação profissional                                                |
| ADS no Instituto Federal de Roraima                    | Início em 2023; conclusão prevista para dezembro de 2026 | Em curso, conforme confirmação; [[PENDENTE: mês de início]]                                                     |
| AWS Certified Cloud Practitioner — Amazon Web Services | Certificado recebido; datas no registro da coleção       | Consulta externa e revisão final pendentes                                                                      |
| Oracle Java Foundations — Oracle University            | Learning Path concluída; dados confirmados por Ruan      | Data, carga horária e texto de apresentação na seção abaixo; não equivale a certificação profissional por exame |
| Trilha Digital Coders 24 — Back End — Ada Tech         | Formação complementar recebida                           | [[PENDENTE: período e conclusão]]                                                                               |

Os schemas exigem meses e status em alguns desses registros. Os campos desconhecidos permanecem neste documento editorial; não foram criadas datas ou situações fictícias para preencher as coleções.

## Estrutura dos estudos de caso

Os textos iniciais dos projetos abaixo foram aprovados; os casos completos continuam como rascunhos editoriais. Antes de migrar para as coleções: confirmar períodos, status, participação, evidências e revisão de publicação. A ordem de destaque permanece a do plano: Sírius como candidato sujeito à autorização; InspectGov; EcoWeb ou Cofrinho conforme autoria e evidências. Os dois projetos Spring são complementares.

### Inspect Gov RR

1. **Problema:** tornar mais compreensíveis as informações sobre repasses de recursos públicos.
2. **Minha participação:** “Desenvolvi uma aplicação que extrai dados públicos da API FIPLAN RR, processa e interliga informações e apresenta os repasses de forma acessível ao cidadão.” Declaração fornecida por Ruan, ainda sujeita à revisão do estudo de caso.
3. **Solução:** aplicação web com Python, Django e PostgreSQL, HTML, CSS e Git. A inspeção local encontrou um cliente httpx síncrono; a menção a asyncio do currículo anterior não foi confirmada para essa implementação.
4. **Decisões técnicas:** [[PENDENTE: justificar as escolhas de coleta, processamento e persistência, com alternativas realmente consideradas]].
5. **Evidências:** [[PENDENTE: captura da interface a ser providenciada depois por Ruan; fluxo de coleta e exemplo real autorizado de entrada/saída]].
6. **Aprendizados:** [[PENDENTE: aprendizados relatados por Ruan]].
7. **Links:** [repositório fornecido](https://github.com/RuanDEV0/InspectGovRR).

Nome público confirmado por Ruan: Inspect Gov RR. [[PENDENTE: período e status atual]].

### EcoWeb — Plataforma de Conexão Sustentável

1. **Problema:** conectar empresas com resíduos recicláveis a pessoas interessadas em reaproveitá-los.
2. **Minha participação:** “Desenvolvi sozinho o projeto completo, incluindo API, website e aplicativo.” Autoria integral confirmada por Ruan em resposta ao item 4 da pergunta sobre o EcoWeb.
3. **Solução:** três aplicações informadas: API com Node.js e MongoDB, website com React e Next.js, aplicativo com React Native. O currículo acrescenta Express, TypeScript, Expo e JWT; a autoria integral foi confirmada; os exemplos específicos para o estudo de caso ainda serão selecionados.
4. **Decisões técnicas:** [[PENDENTE: decisões tomadas por Ruan e alternativas consideradas]].
5. **Evidências:** [[PENDENTE: capturas web e mobile, fornecidas depois por Ruan; exemplos de fluxo da API e diagrama coerente com a implementação]].
6. **Aprendizados:** [[PENDENTE: aprendizados relatados por Ruan]].
7. **Links corretos recebidos:** [API](https://github.com/Project-EcoWeb/api), [website](https://github.com/Project-EcoWeb/web), [mobile](https://github.com/Project-EcoWeb/mobile), [demo informada](https://ecoweb-cop30.vercel.app/).

O link do InspectGov presente na seção EcoWeb do currículo foi identificado como incorreto; usar os links acima na revisão. [[PENDENTE: período e status atual]].

### Cofrinho

1. **Problema:** gerenciar despesas compartilhadas entre grupos e integrar operações bancárias por Open Finance.
2. **Minha participação:** projeto final do estágio na Compass UOL. [[PENDENTE: funcionalidades e decisões implementadas por Ruan e contribuições da equipe]].
3. **Solução:** API REST com Node.js, PostgreSQL e integração Open Finance, conforme o material recebido.
4. **Decisões técnicas:** [[PENDENTE: escolhas e alternativas que Ruan possa explicar a partir de sua participação]].
5. **Evidências:** [[PENDENTE: diagrama da API, exemplos autorizados de requisição/resposta e testes relevantes]]. Não é necessário criar frontend ou providenciar captura de interface para apresentar uma API.
6. **Aprendizados:** [[PENDENTE: aprendizados relatados por Ruan]].
7. **Links:** [backend fornecido](https://github.com/Cofrinho/backend).

[[PENDENTE: período específico do projeto e status atual; as datas do estágio não serão automaticamente atribuídas ao projeto]].

### Projetos complementares

| Projeto                                                                                        | Resumo recebido                                 | Tecnologias associadas no material | Evidências a preparar                                                          |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| [Car Diagnosis Scheduling System](https://github.com/RuanDEV0/car-diagnosis-scheduling-system) | Agendamento de reparos/diagnósticos de veículos | Spring e PostgreSQL                | [[PENDENTE: participação, período, status, exemplo de agendamento e decisões]] |
| [Management Games System](https://github.com/RuanDEV0/games-list)                              | API de gerenciamento de jogos                   | Spring e PostgreSQL                | [[PENDENTE: participação, período, status, exemplo de fluxo e decisões]]       |

### Sírius — autoria e homologação confirmadas

Texto factual preparado com a confirmação de Ruan: “Desenvolvi integralmente o Sírius, atualmente em homologação.” Ruan autorizou usar a citação de sua autoria no portfólio. Não apresentar como produção.

Essa confirmação permite consolidar a atribuição profissional. [[PENDENTE: delimitar quais informações técnicas, telas, métricas e outros materiais institucionais têm autorização para divulgação]]. O estudo de caso completo continua em revisão; a permissão para citar autoria não foi ampliada para todo o conteúdo interno do anexo. Métricas fornecidas não foram auditadas neste trabalho e não foram transcritas. O caso ainda não foi promovido a publicável nem inserido nas coleções.

## Capturas — entrega posterior combinada

| Material              | O que providenciar depois                                                                 | Destino quando recebido           |
| --------------------- | ----------------------------------------------------------------------------------------- | --------------------------------- |
| InspectGov            | Tela principal e um fluxo que mostre o resultado da consulta/processamento                | `src/assets/projetos/inspectgov/` |
| EcoWeb web            | Tela principal e um fluxo representativo da plataforma                                    | `src/assets/projetos/ecoweb/`     |
| EcoWeb mobile         | Telas de um fluxo que Ruan tenha implementado                                             | `src/assets/projetos/ecoweb/`     |
| Sírius, se autorizado | Somente telas e dados expressamente liberados; preferir demonstração com dados sintéticos | Definir após autorização          |

Ruan irá rodar as aplicações e tirar as capturas depois. Não existe prazo combinado. Enviar capturas sem tokens, dados pessoais ou conteúdo interno; versões otimizadas entram no site com dimensões e texto alternativo. Até lá, a apresentação poderá usar texto e diagramas baseados em fatos confirmados. Não gerar telas fictícias como se fossem as interfaces reais.

## Roteiro e composição do ambiente

Roteiro baseado nas seções 1, 2 e 5 do plano aprovado:

1. Entrada: identificação profissional e acesso direto aos projetos em HTML.
2. Acesso ao campo: chegada curta e pulável, sem som automático.
3. Placar: seleção dos estudos de caso, com participação e evidências como centro da leitura.
4. Banco: experiência, formação e certificações revisadas.
5. Personagem: apresentação pessoal, com linguagem próxima da recebida no perfil GitHub.
6. Bola e gol: vídeo do pênalti em etapa posterior.
7. Contato e currículo: sempre disponíveis no menu, inclusive no modo leve.

Composição aprovada: campo society compacto e fictício, alambrado, banco lateral, placar, dois gols e área de entrada com quiosque, depósito, banheiro, cadeiras, futebol de sabão e pula-pula. A distribuição espacial foi avaliada no blockout da Etapa 2; os objetos e materiais definitivos continuam para etapas posteriores. Detalhes pessoais podem usar vermelho e preto, sem escudo ou nome de clube.

Personagem: descrição e fotos recebidas em 07/11/2026; decisões em `docs/conteudo/personagem.md` e folha de referência em `assets-src/referencias/folha-boneco.html`. Ruan aprovou a composição do campo e a orientação dos boxes após avaliar o protótipo da Etapa 2. Esse protótipo funciona como referência visual do ambiente para a Etapa 1; as capturas dos projetos não o substituem.

## Revisão e validação

| Arquivo/trecho                  | Achado                                                                            | Severidade                                 | Próximo passo                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| Perfil, apresentação e contatos | Extraídos do material recebido; links normalizados para HTTPS                     | Revisado para esta base                    | Validar a apresentação nas páginas Sobre e Contato                            |
| Rascunhos de projetos           | Datas, status, decisões, aprendizados e participação ainda incompletos            | Bloqueia publicação                        | Responder às pendências por projeto                                           |
| Formação e certificações        | Faltam meses e classificações específicas                                         | Bloqueia versão final do currículo         | Confirmar os campos indicados                                                 |
| Conteúdo institucional          | Autoria integral e homologação confirmadas; falta delimitar materiais autorizados | Bloqueia registro de detalhes e publicação | Usar a citação de autoria preparada e confirmar o escopo dos demais materiais |
| Capturas de frontend            | Ruan providenciará posteriormente                                                 | Pendência planejada                        | Receber e otimizar na etapa de evidências/acabamento                          |

Consulta pública dos links: a ferramenta retornou páginas para EcoWeb web, Cofrinho e Car Diagnosis. Não foi possível confirmar pela ferramenta os demais repositórios nem a demo; isso não prova que estejam indisponíveis. Os textos acima usam como fonte as declarações de Ruan, sem inferir autoria a partir de commits ou do nome de usuário. A versão final deverá revalidar todos os links.

## Verificação desta atualização

`scripts/verify.sh --full` passou após a atualização: documentação, ShellCheck, 44 testes do harness, tipos, lint, 15 testes de unidade, build, 25 testes de navegador e Lighthouse. Nenhuma etapa foi pulada na execução final. O teste novo falhou antes da implementação por ausência dos links de contato; agora verifica contatos e apresentação sem JavaScript nos quatro perfis de navegador. Prettier e `git diff --check` também passaram.

Orçamentos: JavaScript inicial de 1698 bytes gzip e cena opcional de 129250 bytes gzip; LCP entre 761 e 766 ms nas três medições locais, CLS 0. Sem novos modelos, texturas ou vídeos e sem dependências adicionais. Avisos de coleções vazias de formação/certificações permanecem enquanto faltarem campos necessários.

Não foram verificados aparelhos reais, zoom de 200%, tecnologia assistiva real, rede lenta real, CI remota, hospedagem e cabeçalhos Cloudflare. A inspeção visual manual pelo navegador integrado continua sem confirmação. A prévia externa da Etapa 0 ainda depende da autorização de Git/hospedagem já solicitada.

Para revisar localmente: execute `pnpm dev`, confira `/sobre` e `/contato`, depois leia os rascunhos de experiência e as seções de projetos acima. As páginas de estudos de caso completos e o PDF revisado continuam para as respectivas entregas do plano.

## Materiais recebidos em 07/11/2026

- Levantamento de código e evidências em `docs/conteudo/evidencias-locais.md`. Ele distingue implementação observada, módulos de demonstração e lacunas que dependem de confirmação pessoal. A referência anterior a asyncio no Inspect Gov RR deve ser revisada: o cliente local amostrado utiliza httpx síncrono.
- Certificado AWS estruturado em `src/content/certificacoes/aws-cloud-practitioner.md`, com as datas impressas da imagem recebida. A pendência de datas desse certificado está resolvida; consulta externa de autenticidade não realizada.
- A imagem do badge **Oracle Learning Explorer** foi complementada por Ruan com o registro da trilha **Oracle Java Foundations**, categoria **Learning Path**, carga de **07h27m**, situação **Completed** e conclusão em **28/02/2026**. Classificar como formação complementar; não como certificação profissional obtida por exame.
- Certificado da Ada Tech: Ruan informou que irá procurar e fornecer depois.
- Arquivo do pênalti localizado e analisado em `docs/conteudo/video-penalti.md`; duração, codecs e tamanho já medidos, com original fornecido preservado fora do Git. Ruan confirmou ter autorização das outras pessoas para a publicação do vídeo. Na segunda inspeção, Ruan foi identificado como o cobrador e corrida e contato aparecem na gravação; áudio e a nitidez da chegada da bola continuam pendentes.
- As capturas dos projetos com frontend continuam como entrega posterior. Priorizar os fluxos integrados; no EcoWeb, identificar como demonstração as telas que usam mocks.

## Confirmações adicionais de Ruan — 07/11/2026

### Oracle Java Foundations

Registro fornecido: `28-Feb-2026 · Oracle Java Foundations · Learning Path · 07h:27m · Completed`. A data corresponde à conclusão informada, sem inferir data de início. A trilha pertence à formação complementar; o registro não declara aprovação em exame de certificação profissional.

**Texto preparado para currículo e portfólio:** “Oracle Java Foundations — Oracle University · Trilha de aprendizagem concluída em 28/02/2026 · Carga horária: 7h27.”

Essa informação resolve a identificação, a classificação, a conclusão e a carga horária que faltavam. O mês de início não foi informado, por isso não foi criado um intervalo fictício para preencher o schema de formação. O texto já pode compor a revisão editorial do currículo sem apresentar um período de início. [[PENDENTE: URL individual da trilha/credencial, se disponível]]; esse link é complementar, não condição para registrar a declaração de conclusão.

### Consentimento no vídeo

Ruan declarou ter autorização das outras pessoas que aparecem no vídeo. A pendência de consentimento foi resolvida com essa declaração, registrada também em `docs/conteudo/video-penalti.md`. Permanecem a preferência de áudio, a descrição pessoal do momento e a existência de um arquivo de câmera de melhor qualidade.

### Destaques editoriais consolidados

- Separar a certificação AWS da trilha de aprendizagem Oracle; ambas valorizam a formação sem equivaler modalidades diferentes.
- Manter o foco profissional em backend e APIs, usando os projetos para demonstrar coleta de dados, persistência, integrações e organização do código conforme as evidências locais já registradas.
- Apresentar o Sírius como desenvolvimento integral em homologação, nos limites da autorização de citação já recebida.
- Usar o vídeo como elemento pessoal opcional; o consentimento recebido permite avançar na preparação prevista para a Etapa 6. A publicação técnica segue a autorização de Git/hospedagem do projeto.

## Revisão disponível na prévia local

A pedido de Ruan, a página `/revisao` reúne a apresentação de `src/data/profile.ts` e os rascunhos e perguntas deste roteiro, sem criar outra fonte de fatos profissionais. O link “Revisar conteúdo da Etapa 1” aparece na página inicial ao executar `pnpm dev`. Respostas e correções devem ser enviadas na conversa; a página não grava respostas nem concede aprovação automaticamente.

A rota é registrada apenas no servidor de desenvolvimento e não existe no build estático. Os registros `publishable: false` continuam sem páginas públicas. As perguntas de períodos, status e participação aparecem abertas; detalhes dos futuros estudos de caso ficam em seções expansíveis. A composição do campo já aprovada não volta a ser solicitada.

Verificação: o teste de navegação falhou antes da implementação por ausência do link e passou após a implementação. Há teste separado de exclusão da rota e do link no site estático, além de axe e verificação de largura em 320px. `scripts/verify.sh --full` passou integralmente, incluindo os testes da revisão nos quatro perfis de navegador e Lighthouse, sem etapas puladas. Capturas em 1280px e 320px foram conferidas. O build não contém a rota nem os textos exclusivos da revisão; o JavaScript inicial continua com 1.787 bytes gzip e a cena opcional com 134.045 bytes gzip. Não houve novas dependências. Aparelhos físicos continuam pendentes. A aprovação editorial inicial foi recebida posteriormente e está registrada no encerramento desta etapa.


## Padrão editorial para completar os projetos

Começar cada projeto com uma frase que explique o problema e outra que resuma a contribuição de Ruan. A leitura rápida deve permitir entender para quem o projeto serve, o que ele fez e onde conferir a implementação. Escolher um fluxo representativo para aprofundar, com decisões explicadas e evidências próximas ao texto. Tecnologias aparecem ligadas ao papel que tiveram na solução.

Manter a ordem da seção 7 do plano em todos os casos:

1. **Problema:** quem precisava resolver o quê, em uma ou duas frases concretas.
2. **Minha participação:** responsabilidades e funcionalidades implementadas por Ruan, separadas das contribuições da equipe. Incluir período e status confirmados na identificação do caso.
3. **Solução:** explicar um fluxo de ponta a ponta e o papel das tecnologias realmente utilizadas; manter um resumo curto antes do detalhe técnico.
4. **Decisões técnicas:** apresentar uma ou duas escolhas relevantes, a restrição que motivou cada uma e as alternativas realmente consideradas. Comparações posteriores devem ser identificadas como análise atual.
5. **Evidências:** demonstrar o fluxo com telas reais, diagrama, exemplo de requisição/resposta ou testes. Relatar resultados observados; números somente com fonte, cenário e método de medição. Se não houver métrica, usar uma evidência qualitativa verificável.
6. **Aprendizados:** explicar uma dificuldade enfrentada, o que mudou na compreensão de Ruan e o que ele melhoraria hoje, conforme seu relato.
7. **Links disponíveis:** oferecer repositório, demonstração e evidências autorizadas, identificando demonstrações com mocks e limitações conhecidas.

Para a apresentação curta, usar o mesmo recorte em cada projeto: nome, problema, contribuição principal, tecnologias centrais e acesso ao caso completo. Preencher esses itens somente quando houver dados suficientes; não criar promessas de impacto ou resultados para tornar o texto mais atraente.

Antes de promover um caso a publicável, resolver suas pendências e seguir `docs/ai/procedures/review-content.md`. A aprovação inicial não equivale à liberação de materiais institucionais adicionais.

## Verificação do encerramento

Após registrar a aprovação e mostrar o padrão na revisão local, `scripts/verify.sh --full` passou integralmente, sem etapas puladas: documentação, assets, sintaxe shell, ShellCheck, harness, versão do Node, tipos, lint, testes unitários, build, testes de navegador e Lighthouse. O teste atualizado falhou antes de mostrar a aprovação e o padrão e passou após a implementação. A revisão foi conferida visualmente em capturas de tela larga e estreita.

Orçamentos do build: entrada com 1.787 bytes gzip e cena/Three.js com 134.045 bytes gzip; nenhuma dependência ou asset novo. A rota de revisão continua ausente do build estático. Aparelhos físicos, CI remota e hospedagem continuam sem verificação. As lacunas profissionais e autorizações específicas ainda listadas neste roteiro permanecem para complementação e revisão dos respectivos casos.
