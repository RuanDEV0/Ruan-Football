# 0003 — Etapa 0 concluída com a base local

- **Status:** Aceita
- **Data:** 2026-11-07
- **Aprovação:** Ruan, nesta conversa

## Contexto

O plano, seção 4, pede como entrega da Etapa 0 uma URL de prévia, CI verde e validação da prévia em computador e celular. A base local está completa e verificada (`docs/etapa-0-verificacao.md`, revalidação de 07/11/2026). A prévia depende de commit, push e configuração da Cloudflare Pages, que exigem autorização explícita (regra 6 do `AGENTS.md`). Ruan decidiu não esperar por isso para encerrar a etapa.

## Decisão

A Etapa 0 é concluída com a base local verificada por `scripts/verify.sh --full`. A tarefa “Ampliar `.github/workflows/ci.yml` (…) e configurar o projeto na hospedagem, com prévia por PR e `noindex`” continua desmarcada no plano. Ela passa a ser pré-requisito da validação da Etapa 2, que exige protótipo usável em computador e celular, e será feita quando Ruan autorizar Git e hospedagem.

## Alternativas consideradas

| Opção                                           | Vantagens                                                                            | Desvantagens                                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Manter a etapa aberta até a prévia              | Segue a entrega original do plano                                                    | Bloqueia o encerramento por uma autorização externa ao trabalho técnico                              |
| Concluir com a base local e transferir a prévia | Reconhece o que está pronto; mantém a prévia antes de qualquer validação em aparelho | Execução remota da CI, cabeçalhos da Cloudflare e teste em celular real ficam sem verificação até lá |

## Consequências

- O workflow da CI já está escrito e roda o mesmo `scripts/verify.sh --full` validado localmente, mas a execução remota nunca aconteceu. A primeira execução pode revelar diferenças de ambiente.
- `_headers`, CSP e cache só serão confirmados na Cloudflare. A validação em computador e celular físicos fica para a prévia.
- As pendências de domínio, analytics e currículo em PDF continuam como estão em `docs/etapa-0-verificacao.md`; nenhuma bloqueia o trabalho editorial da Etapa 1.
