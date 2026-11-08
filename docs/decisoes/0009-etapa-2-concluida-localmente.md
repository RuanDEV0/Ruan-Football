# 0009 — Etapa 2 concluída localmente

- **Status:** Aceita
- **Data:** 2026-11-08
- **Aprovação:** Ruan, nesta conversa

## Contexto

O protótipo da Etapa 2 está completo e verificado localmente. Ele tem:

- campo noturno com primitivas;
- chegada com a bola chutada ao gol e “Pular”;
- pontos de vista por hotspot, marcadores projetados e telas no cenário;
- perfis de qualidade e painel de medição em `?debug`.

O registro está em `docs/etapa-2-verificacao.md`, e as decisões nos ADRs 0004 e 0006 a 0008. Ruan avaliou a versão, pediu o quique mínimo de 5 s e aprovou o restante.

Faltam três itens que não dependem do trabalho técnico local:

- **Medição nos aparelhos:** o plano pede a primeira medição no Moto G30 e no Vaio FE16 para revisar os orçamentos da seção 3.11, e ela depende de Ruan abrir `?debug` nos aparelhos.
- **Prévia externa e CI remota:** o ADR 0003 tornou ambas pré-requisito da validação da Etapa 2, e elas exigem autorização explícita para Git e hospedagem (regra 6 do `AGENTS.md`).
- **Desempenho real:** o TBT do Lighthouse (I11) só pode ser avaliado nos aparelhos.

Ruan decidiu fechar a etapa localmente, como na Etapa 0.

## Decisão

A Etapa 2 é concluída com o protótipo verificado por `scripts/verify.sh --full` e aprovado por Ruan. Três itens passam a ser pré-requisito da validação da Etapa 3:

- primeira medição no Moto G30 e no Vaio FE16 com `?debug`, com revisão dos limites de qualidade e dos orçamentos;
- prévia externa por PR na hospedagem e primeira execução remota da CI, quando Ruan autorizar Git e hospedagem;
- avaliação do TBT (I11) e dos refinamentos abertos no relatório da etapa.

## Alternativas consideradas

| Opção                                          | Vantagens                                                | Desvantagens                                                                |
| ---------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| Manter a etapa aberta até medição e prévia     | Segue a entrega original do plano                        | Bloqueia o avanço por ações externas ao trabalho técnico                    |
| Concluir localmente e transferir as pendências | Reconhece o protótipo aprovado; mesmo caminho da Etapa 0 | Desempenho em aparelho real e ambiente da hospedagem seguem sem verificação |

## Consequências

- Os limites de queda de qualidade (45 e 30 FPS), os orçamentos da seção 3.11 e a duração da chegada continuam sendo hipóteses até a medição.
- A Etapa 3 pode começar, mas sua validação depende dos três itens acima.
- Os refinamentos abertos (I13, I14, K05 e K06) e a falha intermitente do harness (K04) seguem registrados em `docs/etapa-2-verificacao.md`.
- Os processos do ciclo `etapa2-imersao-total` são encerrados após esta aprovação.
