# Guia — Assets (modelos, texturas, vídeo e imagens)

Áreas: `assets-src/`, `public/models/`, `public/video/`, `public/decoders/`, `public/cv/`. Referências no plano: seções 3.9, 3.11, 5 e 6.

## Onde cada arquivo fica

| Tipo | Fonte (não publicada) | Publicado |
| --- | --- | --- |
| Modelos | `assets-src/blender/*.blend` (Git LFS) | `public/models/*.glb` otimizados |
| Texturas fonte | `assets-src/blender/textures/` (Git LFS) | Embutidas no GLB, em KTX2 ou WebP |
| Referências visuais | `assets-src/referencias/` | — |
| Vídeo original | **Fora do Git** (backup pessoal de Ruan) | `public/video/` (MP4, pôster, `.vtt`) |
| Fotos pessoais de referência | **Fora do Git** | — |
| Capturas de projetos e renders | `src/assets/` | Processadas por `astro:assets` |
| Currículo | — | `public/cv/ruan-oliveira-cv.pdf` |

O Git LFS precisa estar instalado (`git lfs install`) antes do primeiro `.blend`. Não versione `.blend1` nem arquivos temporários.

## Modelos 3D

- Escala: 1 unidade = 1 metro. Exportação glTF com Y para cima.
- Interativos com prefixo `hs_` (`hs_placar`, `hs_banco`, `hs_personagem`, `hs_gol`). Áreas de clique podem ser caixas invisíveis com o mesmo prefixo.
- Personagem e cenário em arquivos separados.
- Personagem em peças rígidas articuladas: sem deformação de pele; um osso ou objeto pai por articulação.
- Animações apenas com função na primeira versão (parado, saudação, comemoração), todas no mesmo GLB do personagem.
- Iluminação dos refletores assada em lightmap.
- Sempre otimize com `pnpm assets:models` (gltf-transform: `dedup`, `prune`, `weld`, Meshopt, texturas KTX2 ou WebP, no máximo 2048 px). Não publique GLB direto do Blender.
- Confira o orçamento depois de otimizar: ≤ 3 MB de modelos e texturas no perfil médio e ≤ 150 mil triângulos na cena.

## Vídeo

- O original nunca é editado, recomprimido nem versionado.
- `pnpm assets:video` (ffmpeg) gera MP4 H.264 em 1080p e 720p com `+faststart`, áudio AAC, pôster AVIF e JPG do quadro do chute, e confere a existência da legenda `.vtt` em pt-BR.
- Meta: ≤ 8 MB em 1080p. Preserve duração, quadros e áudio original, salvo pedido de Ruan.
- Antes de publicar, confirme o consentimento das outras pessoas que aparecem no vídeo (plano, seção 8).

## Versão estilizada (Etapa 7, opcional)

- Fica separada do original e só é publicada depois de aprovada por Ruan.
- Não afirme que uma transformação generativa preserva todos os quadros. Compare quadro a quadro os trechos críticos: o contato com a bola e a chegada ao gol.

## Ferramentas generativas

- Imagens, texturas ou modelos gerados por IA só entram se a licença da ferramenta permitir uso público e se Ruan aprovar.
- Registre em `assets-src/referencias/ORIGEM.md` a ferramenta, a data e a licença de cada asset gerado ou de terceiros.
- Não use assets que imitem marcas, personagens ou cenários existentes.
