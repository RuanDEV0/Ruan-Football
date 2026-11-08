#!/usr/bin/env bash
# Orçamentos de bundle do plano 3.11, medidos em gzip sobre dist/ depois do build:
# JS inicial (scripts das páginas e seus imports estáticos) e código da cena (o restante, carregado
# por import dinâmico). Chamado por scripts/verify.sh; docs/ai/guides/quality.md.
#
# Uso: scripts/check-budgets.sh [--root DIR]
# Sai com 1 se um orçamento for ultrapassado e 2 sem dist/.
set -uo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
while [ $# -gt 0 ]; do
  case "$1" in
    --root) root="$(cd "$2" && pwd)" || exit 2; shift 2 ;;
    -h|--help) sed -n '2,7p' "$0"; exit 0 ;;
    *) echo "argumento desconhecido: $1" >&2; exit 2 ;;
  esac
done

INITIAL_BUDGET_BYTES=$((50 * 1024))
SCENE_BUDGET_BYTES=$((250 * 1024))
assets="$root/dist/_astro"
if [ ! -d "$assets" ]; then
  echo "dist/ ausente: rode pnpm build antes de medir os orçamentos." >&2
  exit 2
fi

declare -A initial=()
queue=()
while IFS= read -r src; do
  queue+=("${src##*/}")
done < <(grep -rhoE '(src|href)="/_astro/[^"]+\.js"' "$root/dist" --include='*.html' | sed -E 's/.*"\/_astro\/([^"]+)"/\1/' | sort -u)

# Imports estáticos minificados: import{a}from"./x.js", export{b}from"./y.js" ou import"./z.js".
# import("./w.js") é dinâmico e fica de fora pelo parêntese.
while [ "${#queue[@]}" -gt 0 ]; do
  file=${queue[0]}
  queue=("${queue[@]:1}")
  [ -n "${initial[$file]:-}" ] && continue
  [ -f "$assets/$file" ] || continue
  initial[$file]=1
  while IFS= read -r dep; do
    queue+=("$dep")
  done < <(grep -oE '(from|import) ?"\./[^"]+\.js"' "$assets/$file" | sed -E 's/.*"\.\/([^"]+)"/\1/')
done

gzip_size() { gzip -9 -c "$1" | wc -c; }
initial_bytes=0
scene_bytes=0
for path in "$assets"/*.js; do
  [ -e "$path" ] || continue
  size=$(gzip_size "$path")
  if [ -n "${initial[${path##*/}]:-}" ]; then
    initial_bytes=$((initial_bytes + size))
  else
    scene_bytes=$((scene_bytes + size))
  fi
done

failed=0
report() {
  local name=$1 bytes=$2 budget=$3
  if [ "$bytes" -le "$budget" ]; then
    printf '%s: %d bytes gzip (orçamento %d)\n' "$name" "$bytes" "$budget"
  else
    printf '%s: %d bytes gzip, acima do orçamento de %d\n' "$name" "$bytes" "$budget"
    failed=1
  fi
}
report "JS inicial" "$initial_bytes" "$INITIAL_BUDGET_BYTES"
report "código da cena" "$scene_bytes" "$SCENE_BUDGET_BYTES"
exit "$failed"
