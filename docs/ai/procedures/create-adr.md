# Procedimento — Registrar uma decisão técnica (ADR)

Use quando uma decisão mudar a stack, a arquitetura, o contrato entre interface e cena, um orçamento, a estrutura de pastas ou adicionar uma dependência estrutural. Decisões de produto continuam no plano.

1. **Confirmar que a decisão foi aprovada por Ruan.** ADR registra decisão tomada, não proposta. Para propor, apresente as alternativas na conversa.
2. **Numerar:** próximo número livre em `docs/decisoes/`, com quatro dígitos (`0002-...`).
3. **Nome do arquivo:** `NNNN-titulo-curto.md`, em `kebab-case`, em pt-BR e sem acentos.
4. **Escrever** com o modelo abaixo, em pt-BR, em no máximo uma página.
5. **Se a decisão substituir outra**, mude o status da anterior para `Substituída por NNNN` e cite-a no novo ADR.
6. **Se afetar regras dos agentes**, atualize `AGENTS.md` ou o guia da área e rode `./scripts/check-ai-docs.sh`.

## Modelo

```markdown
# NNNN — Título da decisão

- **Status:** Aceita | Substituída por NNNN
- **Data:** AAAA-MM-DD
- **Aprovação:** Ruan

## Contexto
Qual problema ou força levou à decisão.

## Decisão
O que foi decidido, em uma ou duas frases afirmativas.

## Alternativas consideradas
| Opção | Vantagens | Desvantagens |
| --- | --- | --- |

## Consequências
O que fica mais fácil, o que fica mais difícil e o que precisa ser feito agora.
```

O primeiro ADR (`0001-stack.md`) registra as decisões da seção 12 do plano e é criado na Etapa 0.
