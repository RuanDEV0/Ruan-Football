#!/usr/bin/env bash
# Regras de assets que não dependem de build: origem registrada das referências, fotos e vídeo
# originais fora do Git e marcas de terceiros (docs/ai/guides/assets.md; regras 9 e 10 do AGENTS.md).
# Uso: scripts/check-assets.sh [--root DIR]. Chamado por scripts/verify.sh.
set -uo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
while [ $# -gt 0 ]; do
  case "$1" in
    --root) root="$(cd "$2" && pwd)" || exit 2; shift 2 ;;
    -h|--help) sed -n '2,4p' "$0"; exit 0 ;;
    *) echo "argumento desconhecido: $1" >&2; exit 2 ;;
  esac
done
cd "$root" || exit 2

errors=0
mark=0
fail() { echo "ERRO: $*"; errors=$((errors + 1)); }
ok() {
  if [ "$errors" -eq "$mark" ]; then echo "ok    $*"; fi
  mark=$errors
}

refs=assets-src/referencias
registry="$refs/ORIGEM.md"

reference_files() {
  find "$refs" -type f ! -name .gitkeep ! -path "$registry" 2>/dev/null | sort
}

if [ -d "$refs" ]; then
  listed=()
  if [ -f "$registry" ]; then
    # Formato da tabela de ORIGEM.md: | `arquivo` | ferramenta | data | fontes | licença |
    # Motivo: as crases são o delimitador literal da célula, não expansão de shell.
    # shellcheck disable=SC2016
    mapfile -t listed < <(grep -oE '^\| *`[^`]+`' "$registry" | sed -E 's/^\| *`//; s/`$//')
    for name in "${listed[@]}"; do
      [ -e "$refs/$name" ] || fail "ORIGEM.md cita arquivo inexistente: $name"
    done
  elif [ -n "$(reference_files)" ]; then
    fail "$registry ausente; registre a origem de cada referência"
  fi
  while IFS= read -r f; do
    name=${f#"$refs/"}
    found=0
    for item in "${listed[@]}"; do [ "$item" = "$name" ] && found=1 && break; done
    [ "$found" -eq 1 ] || fail "$f sem registro em ORIGEM.md"
  done < <(reference_files)
  ok "registro de origem das referências"

  while IFS= read -r f; do
    fail "foto ou vídeo em referências: $f (fotos pessoais e vídeo original ficam fora do Git)"
  done < <(find "$refs" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.heic' -o -iname '*.heif' \
    -o -iname '*.dng' -o -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4v' \) | sort)
  while IFS= read -r f; do
    fail "$f embute imagem raster (data:image); fotos ficam fora do Git"
  done < <(grep -rlIE 'data:image/(png|jpe?g|webp|gif|avif|heic)' "$refs" 2>/dev/null | sort)
  ok "referências sem fotos"
fi

while IFS= read -r f; do
  fail "vídeo fora de public/video/: ${f#./}"
done < <(find . \( -path ./node_modules -o -path ./dist -o -path ./.git -o -path ./.astro \
  -o -path ./public/video -o -path ./test-results -o -path ./playwright-report -o -path ./.lighthouseci \) -prune \
  -o -type f \( -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4v' -o -iname '*.mkv' -o -iname '*.avi' -o -iname '*.webm' \) \
  -print | sort)
ok "vídeos somente em public/video/"

brand_dirs=()
for d in src public assets-src; do [ -d "$d" ] && brand_dirs+=("$d"); done
if [ "${#brand_dirs[@]}" -gt 0 ]; then
  while IFS= read -r f; do
    fail "marca de terceiros em $f (regra 10 do AGENTS.md: o boneco não cita a marca de referência)"
  done < <(grep -rliI 'playmobil' "${brand_dirs[@]}" 2>/dev/null | sort)
fi
ok "textos sem marca de terceiros"

echo
if [ "$errors" -gt 0 ]; then
  echo "$errors erro(s) encontrado(s)."
  exit 1
fi
echo "Assets e referências consistentes."
