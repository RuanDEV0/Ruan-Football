# Vídeo do pênalti — inspeção do arquivo recebido

Inspeção em 07/11/2026. Fonte indicada por Ruan: `/home/ruan/Downloads/Design sem nome.mp4`. O arquivo foi lido, sem edição ou recompressão, e permanece fora do repositório. O nome do arquivo não comprova que seja o original da câmera; aqui ele é identificado como arquivo fornecido.

## Metadados medidos com ffprobe

| Campo                | Resultado                                                        |
| -------------------- | ---------------------------------------------------------------- |
| Duração do contêiner | 10,048 s                                                         |
| Resolução            | 1920 × 1080, paisagem                                            |
| Vídeo                | H.264, 30 fps                                                    |
| Áudio                | AAC, 48 kHz, estéreo                                             |
| Tamanho              | 6235366 bytes, aproximadamente 6,24 MB decimais                  |
| Orçamento do plano   | Dentro do teto de 8 MB para 1080p                                |
| Organização MP4      | `mdat` antes de `moov`; ainda não está organizado para faststart |

SHA-256 do arquivo fornecido: `5295dbd453dc860d386025d3c4ae9f577e8a5bc4ae025058a2d85518db5f4ecc`.

## Inspeção visual por amostragem

Foram extraídos quadros temporários em `/tmp/ruan-football-media-review/`, incluindo amostragem a cada dois segundos e quatro quadros por segundo do início. Esses derivados não foram adicionados ao repositório.

Os quadros mostram campo de futebol com iluminação artificial, cobertura metálica, alambrado e várias pessoas. O goleiro já aparece no chão nos primeiros quadros amostrados. O contato do pé com a bola e o percurso completo do chute não foram confirmados por essa amostragem; não afirmar que a versão recebida preserva todo o lance. Nenhuma pessoa foi identificada automaticamente como Ruan. Não foi feita escuta/transcrição do áudio.

Essas observações podem orientar a referência visual de iluminação e materiais, sem reproduzir um local real como se fosse uma memória específica de Ruan. A leitura de quadros não substitui revisão integral do movimento.

## Segunda inspeção e confirmações de Ruan — 07/11/2026

Quadros extraídos de 2 a 6 por segundo, com recortes ampliados do cobrador e do gol, em diretório temporário fora do repositório.

- **Correção da inspeção anterior:** o goleiro, de roupa escura, aparece em pé no gol até o chute e reage no momento do contato. A pessoa sentada no chão desde o início veste colete laranja e está fora do gol.
- **Ruan no vídeo:** confirmado por Ruan como o cobrador, careca e de colete verde-limão, visto de costas e de longe (cerca de 60 a 100 px de altura em 1080p).
- **Tempos estimados pelos quadros:** corrida de aproximadamente 3,0 a 4,0 s; contato com a bola de aproximadamente 4,0 a 4,4 s; reação das pessoas próximas à câmera a partir de cerca de 5 s. O quadro exato do contato não foi determinado.
- **Bola:** ocupa poucos pixels e se confunde com a rede e as luzes; a chegada ao gol não é visível com nitidez. Ruan informou que entrou no ângulo superior direito, visto de quem chuta.
- **Roupa do cobrador:** colete verde-limão sem número, camiseta preta de manga curta e short preto. Meião e chuteira não aparecem com nitidez. É a roupa padrão escolhida para o personagem (`docs/conteudo/personagem.md`).

### Análise para a versão de bonecos (Etapa 7)

Com o cobrador pequeno, de costas, câmera na mão, pouca luz e várias pessoas no quadro, uma transformação generativa da gravação tende a perder a bola e a mudar a aparência dos bonecos entre quadros. Captura de movimento por IA também sairia ruidosa nessa escala. A recriação com o modelo 3D, usando a gravação como guia (rastreamento da câmera no Blender e poses-chave de corrida, apoio, contato, finalização e comemoração), é a alternativa que preserva o contato e a trajetória. Isso é análise, não decisão: o plano, seção 6, prevê a escolha depois do teste de um trecho representativo.

## Encaminhamento para a Etapa 6

- Corrida e contato aparecem nesta versão (segunda inspeção); a chegada da bola ao gol não é visível com nitidez. [[PENDENTE: existe arquivo de câmera com melhor qualidade ou início anterior?]]
- Consentimento confirmado por Ruan em 07/11/2026: declarou ter autorização das outras pessoas que aparecem no vídeo, atendendo à confirmação prevista no plano, seção 8.
- [[PENDENTE: uma ou duas frases de Ruan sobre o momento e preferência de áudio]].
- Preparar depois uma cópia de reprodução com faststart; quando possível, remuxar sem recodificar o vídeo 1080p já dentro do orçamento. Nunca sobrescrever o arquivo fornecido.
- A versão 720p, pôster do quadro escolhido e legenda/descrição WebVTT entram no pipeline da Etapa 6. Escolher o quadro do pôster na janela de 4,0 a 4,4 s depois de conferir quadro a quadro, com aprovação de Ruan.
- Publicar somente após essas confirmações, com controles, `preload="none"`, sem reprodução automática e sem tornar o vídeo obrigatório para acessar o conteúdo profissional.

Não houve publicação, cópia para `public/video/`, alteração de áudio ou transformação estilizada.
