# Procedimento — Revisar conteúdo profissional

Use antes de propor `publishable: true`, na Etapa 5 e na revisão final. Este procedimento **não edita**: ele produz uma lista de achados para Ruan decidir. No Claude Code, pode ser delegado ao subagente `content-reviewer`.

## Escopo

Arquivos em `src/content/`, `src/data/profile.ts` e textos visíveis em páginas e componentes.

## Checklist

**Fatos**
- [ ] Cada data, cargo, empresa, instituição, status, métrica e link tem fonte no material de Ruan.
- [ ] Nenhum `[[PENDENTE` em conteúdo marcado como publicável.
- [ ] As pendências do plano (seção 8) não foram “resolvidas” no texto sem confirmação.
- [ ] Certificações separadas de cursos.

**Autoria e confidencialidade**
- [ ] “Minha participação” distingue o trabalho de Ruan do trabalho da equipe.
- [ ] Nenhum dado, tela, documento ou nome interno de instituição sem autorização registrada.
- [ ] Sírius: escopo (módulo ou sistema completo), status e métricas conforme o plano, seção 7.

**Métricas**
- [ ] Toda métrica tem cenário, método e ambiente.
- [ ] Nenhuma métrica formulada como garantia geral.

**Links**
- [ ] Links apontam para o projeto certo (atenção ao EcoWeb e ao InspectGovRR).
- [ ] Repositórios citados são públicos ou o link foi removido.

**Tom e regras do projeto**
- [ ] pt-BR correto e sem autopromoção exagerada.
- [ ] Skills ligadas a projetos ou experiências.
- [ ] Nenhuma experiência atribuída a Ruan que ele não declarou (ex.: Three.js antes deste projeto).
- [ ] Flamengo discreto; nenhuma marca de terceiros nos textos públicos; nenhum lugar ou memória pessoal inventados.

## Formato do resultado

Uma tabela por arquivo: `trecho | problema | regra | sugestão`, com a severidade **bloqueia publicação** ou **melhoria**. Termine com a lista de perguntas para Ruan.
