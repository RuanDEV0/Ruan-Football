# Instruções para o GitHub Copilot

As regras completas deste projeto estão em `AGENTS.md`, na raiz do repositório. **Leia `AGENTS.md` antes de sugerir ou editar código.** Guias por área: `docs/ai/guides/`. Roteiros: `docs/ai/procedures/`.

Resumo das regras que mais afetam sugestões de código:

- Portfólio estático em Astro + TypeScript `strict` + Three.js + GSAP. Não sugira React, Next.js, Tailwind nem backend sem ADR aprovado.
- Todo conteúdo profissional funciona sem 3D e sem JavaScript da cena.
- `src/experience/` não importa interface nem Astro; a interface não importa `three`. A comunicação acontece pela API de `boot()` e por eventos tipados.
- Perfil, contatos, hotspots e projetos vêm de `src/data/` e `src/content/`; não duplique esses dados.
- Não invente fatos profissionais (datas, cargos, métricas, links). Use `[[PENDENTE: …]]`.
- Código e commits em inglês; textos visíveis, conteúdo e documentação em pt-BR.
- Controles acessíveis: `<button>` e `<a>` nativos, foco visível, suporte a `prefers-reduced-motion`.

Em revisões de PR, verifique também a “Definição de pronto” do `AGENTS.md`.
