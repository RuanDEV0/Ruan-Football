# Guia — Conteúdo profissional (`src/content/`, `src/data/`)

Referências no plano: seções 2, 7 e 8 (pendências editoriais).

## Fontes permitidas

Um fato profissional só pode vir de:

1. Material enviado por Ruan nesta conversa ou já versionado no repositório.
2. Repositórios e links públicos de Ruan, quando ele indicar.

Nunca use memória do modelo, suposições ou “valores típicos”. Faltou um dado: `[[PENDENTE: descrição]]`. O build deve falhar ou avisar enquanto houver `[[PENDENTE` em conteúdo com `publishable: true`.

## Pendências conhecidas (plano, seção 8)

Não resolva por conta própria; apenas sinalize se o texto depender delas:

- Situação atual do estágio na DPE/RR e da graduação em ADS no IFRR.
- Autoria, escopo, status e materiais publicáveis do Sírius; contexto das métricas.
- Nome público do InspectGov.
- Link do EcoWeb (o currículo aponta para InspectGovRR) e a participação de Ruan nele.

## Coleções e dados

| Local                        | Conteúdo                                                   |
| ---------------------------- | ---------------------------------------------------------- |
| `src/content/projetos/`      | Um arquivo Markdown por projeto                            |
| `src/content/experiencia/`   | DPE/RR, Compass UOL e outras                               |
| `src/content/formacao/`      | Graduação e cursos                                         |
| `src/content/certificacoes/` | Somente certificações; cursos ficam em `formacao/`         |
| `src/data/profile.ts`        | Nome, título, cidade, contatos públicos, link do currículo |
| `src/data/hotspots.ts`       | Pontos interativos da cena e suas rotas                    |

Os schemas ficam em `src/content.config.ts`. Campos novos entram primeiro no schema.

## Estudo de caso

Frontmatter conforme o plano, seção 3.7 (`title`, `summary`, `order`, `featured`, `status`, `role`, `period`, `stack`, `links`, `cover`, `publishable`). Corpo com estas seções, nesta ordem:

1. Problema
2. Minha participação: o que Ruan fez, separado do que a equipe fez
3. Solução
4. Decisões técnicas: alternativas consideradas e motivo da escolha
5. Evidências: diagramas, requisição e resposta, capturas, testes, métricas com contexto
6. Aprendizados
7. Links

Projetos backend usam diagramas em SVG e exemplos de requisição e resposta. Não crie interface só para ter imagem.

## Métricas

- Sempre com o cenário: o que foi medido, como, quando e em que ambiente.
- Formule como resultado observado (“no cenário medido, o tempo caiu de X para Y”), nunca como garantia.
- Os números do Sírius vieram do material de Ruan e **não foram verificados**; não os apresente como auditados.

## Tom e escrita

- pt-BR claro, direto, primeira pessoa nos estudos de caso (“implementei”, “decidi”), terceira pessoa na identificação.
- Público principal: recrutadores e desenvolvedores. Termos técnicos corretos, sem jargão desnecessário e sem adjetivos de autopromoção (“incrível”, “revolucionário”).
- Skills sempre ligadas a um projeto ou experiência em que foram usadas. Nada de lista solta de tecnologias ou barras de nível.
- O futebol dá personalidade; o conteúdo profissional permanece sóbrio.
- Flamengo apenas como detalhe discreto. Não atribua a Ruan memórias ou lugares específicos.

## Publicação

- Caso sem autorização ou com pendências: `publishable: false`. Ele existe no repositório, mas não gera página nem aparece no menu.
- Material institucional (telas, documentos, nomes de pessoas, dados internos) só entra com autorização expressa de Ruan. Na dúvida, não inclua e pergunte.
- Antes de marcar `publishable: true`, siga `docs/ai/procedures/review-content.md`.

## Revisão editorial local

A rota `/revisao`, registrada somente em desenvolvimento na configuração do Astro, permite que Ruan leia os rascunhos do roteiro da Etapa 1. Os textos vêm do roteiro e do perfil existentes. Essa visualização não altera `publishable`, não registra aprovação e não existe no build estático; manter testes para essa exclusão ao modificar a revisão.
