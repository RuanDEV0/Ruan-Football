# 0001 — Stack e direção da primeira versão

- **Status:** Aceita
- **Data:** 2026-11-06
- **Aprovação:** Ruan, plano aprovado em 06/11/2026, seção 12

## Contexto

O portfólio deve apresentar conteúdo profissional acessível em HTML estático e oferecer uma cena 3D opcional. As decisões abaixo foram aprovadas antes da implementação.

## Decisão

Adotar Astro estático, TypeScript estrito, Three.js puro e CSS nativo. A navegação do campo usará pontos de vista guiados com órbita limitada; as animações da chegada usarão GSAP quando implementadas. Hospedar na Cloudflare Pages, com prévias sem indexação até a aprovação da Etapa 8.

A primeira versão será em pt-BR; rotas e dados ficam separados para permitir inglês depois. O repositório será público, sem material institucional não autorizado. Usar domínio próprio `nome.dev` ou `nome.com.br` no lançamento, com nome ainda pendente, e subdomínio da hospedagem durante o desenvolvimento. Analytics: Cloudflare Web Analytics sem cookies; contato: e-mail, LinkedIn e GitHub. O personagem será próprio, modelado no Blender com peças rígidas.

## Alternativas consideradas

| Opção                           | Vantagens                     | Desvantagens                                      |
| ------------------------------- | ----------------------------- | ------------------------------------------------- |
| Vite e TypeScript sem framework | Base pequena                  | Mais trabalho para conteúdo estático e rotas      |
| Órbita livre                    | Exploração livre              | Menos orientação e mais dificuldade no celular    |
| Netlify                         | Hospedagem estática e prévias | Cloudflare foi a escolha aprovada                 |
| Bilíngue desde o lançamento     | Maior alcance imediato        | Amplia a revisão editorial inicial                |
| Repositório privado             | Reduz exposição inicial       | Não funciona como vitrine pública de código       |
| Personagem gerado por IA        | Base rápida                   | Exige retopologia e menor controle sobre as peças |

## Consequências

Conteúdo e cena precisam ser independentes. Domínio, contatos, token público de analytics e autorização de configuração da hospedagem ficam pendentes; nenhum endereço ou credencial será inventado. A configuração externa e a CI remota só poderão ser validadas após autorização explícita de Ruan para as ações correspondentes. O scaffold usa apenas Three.js como dependência da cena; GSAP entra com a chegada da Etapa 2, evitando código sem uso nesta etapa.
