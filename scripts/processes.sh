#!/usr/bin/env bash
# Processos temporários do ciclo de implementação, isolados por sessão Linux.
# Uso: scripts/processes.sh start|list|approve|close --cycle ID [--root DIR] [-- COMANDO ARG...]
# approve só deve ser chamado depois da validação explícita de Ruan; close exige essa marca.
set -uo pipefail
# shellcheck source=lib/node.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/node.sh"

read_identity() {
  local line tail
  [ -r "/proc/$1/stat" ] || return 1
  IFS= read -r line < "/proc/$1/stat" || return 1
  tail=${line##*) }
  read -r -a identity <<< "$tail"
  [ "${identity[0]}" != Z ] || return 1
}

# Chamada por `< <(members ...)`, roda numa subshell do próprio grupo: ela não conta como membro.
members() {
  local file pid
  for file in /proc/[0-9]*/stat; do
    pid=${file#/proc/}; pid=${pid%/stat}
    [ "$pid" = "$BASHPID" ] && continue
    read_identity "$pid" || continue
    if [ "${identity[2]}" = "$1" ] && [ "${identity[3]}" = "$1" ]; then
      printf '%s\t%s\n' "$pid" "${identity[19]}"
    fi
  done
}

if [ "${1:-}" = __supervise ]; then
  shift
  registration=$1; shift
  for ((attempt=0; attempt<100; attempt++)); do
    [ -f "$registration/$$.pid" ] && break
    sleep 0.02
  done
  [ -f "$registration/$$.pid" ] || exit 1
  # O supervisor mantém a identidade da sessão enquanto houver filhos, mesmo se o comando retornar.
  trap 'exit 0' TERM INT
  "$@" &
  wait "$!" || true
  while :; do
    child=''
    while IFS=$'\t' read -r pid _; do
      [ "$pid" = "$$" ] && continue
      child=$pid; break
    done < <(members "$$")
    [ -n "$child" ] || break
    while read_identity "$child"; do sleep 0.1; done
  done
  exit 0
fi

if [ "${1:-}" = --help ] || [ "${1:-}" = -h ]; then sed -n '2,4p' "$0"; exit 0; fi
action=${1:-}; shift || true
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cycle=''
while [ $# -gt 0 ]; do
  case "$1" in
    --root) [ $# -ge 2 ] || exit 2; root=$(cd "$2" && pwd) || exit 2; shift 2 ;;
    --cycle) [ $# -ge 2 ] || exit 2; cycle=$2; shift 2 ;;
    --) shift; break ;;
    -h|--help) sed -n '2,4p' "$0"; exit 0 ;;
    *) echo "argumento desconhecido: $1" >&2; exit 2 ;;
  esac
done
[[ "$cycle" =~ ^[A-Za-z0-9_-]+$ ]] || { echo 'cycle deve conter apenas letras, números, _ ou -' >&2; exit 2; }
if [ ! -d /proc ] || ! command -v setsid >/dev/null 2>&1; then
  echo 'requer Linux, /proc e setsid' >&2; exit 1
fi
state="$root/.claude/.state/processes/$cycle"

case "$action" in
  start)
    [ $# -gt 0 ] || exit 2
    mkdir -p "$state" || exit 1
    # Novo trabalho invalida qualquer aprovação do ciclo anterior.
    rm -f "$state/approved"
    script="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
    cd "$root" || exit 2
    if [ -f .nvmrc ]; then
      want=$(tr -d '[:space:]v' < .nvmrc)
      if ! node_matches "$want" && ! { activate_nvm "$want" && node_matches "$want"; }; then
        have=$(node --version 2>/dev/null) || have="ausente"
        echo "aviso: $(node_mismatch_hint "$want" "$have")" >&2
      fi
    fi
    setsid bash "$script" __supervise "$state" "$@" </dev/null >>"$state/output.log" 2>&1 &
    pid=$!
    for ((attempt=0; attempt<100; attempt++)); do
      if read_identity "$pid" && [ "${identity[2]}" = "$pid" ] && [ "${identity[3]}" = "$pid" ]; then
        printf '%s\t%s\n' "$pid" "${identity[19]}" > "$state/$pid.pid"
        printf '%s\n' "$pid"
        exit 0
      fi
      sleep 0.02
    done
    echo 'não foi possível registrar o processo; consulte output.log' >&2
    exit 1
    ;;
  approve)
    [ -d "$state" ] || { echo 'nenhum processo registrado'; exit 0; }
    touch "$state/approved"
    ;;
  list)
    [ -d "$state" ] || exit 0
    for record in "$state"/*.pid; do
      [ -f "$record" ] || continue
      cat "$record"
    done
    ;;
  close)
    [ -d "$state" ] || exit 0
    shopt -s nullglob
    records=("$state"/*.pid)
    [ "${#records[@]}" -gt 0 ] || { rm -f "$state/approved"; exit 0; }
    [ -f "$state/approved" ] || { echo 'encerramento exige aprovação explícita de Ruan' >&2; exit 1; }
    failed=0
    for record in "${records[@]}"; do
      IFS=$'\t' read -r pid start < "$record" || { failed=1; continue; }
      [[ "$pid" =~ ^[0-9]+$ && "$start" =~ ^[0-9]+$ ]] && [ "$pid" -gt 1 ] || { echo 'registro inválido' >&2; failed=1; continue; }
      if ! read_identity "$pid"; then
        if [ -n "$(members "$pid")" ]; then
          echo "identidade do supervisor $pid indisponível; conferir manualmente" >&2; failed=1
        else rm -f "$record"; fi
        continue
      fi
      if [ "${identity[19]}" != "$start" ] || [ "${identity[2]}" != "$pid" ] || [ "${identity[3]}" != "$pid" ]; then
        echo "identidade de $pid divergente; nenhum sinal enviado" >&2; failed=1; continue
      fi
      mapfile -t owned < <(members "$pid")
      kill -TERM -- "-$pid" 2>/dev/null || true
      for ((attempt=0; attempt<20; attempt++)); do
        [ -z "$(members "$pid")" ] && break
        sleep 0.1
      done
      # Cada PID é conferido novamente antes de forçar o encerramento, evitando PID reaproveitado.
      for member in "${owned[@]}"; do
        IFS=$'\t' read -r child child_start <<< "$member"
        if read_identity "$child" && [ "${identity[19]}" = "$child_start" ]; then
          kill -KILL "$child" 2>/dev/null || true
        fi
      done
      sleep 0.05
      if [ -n "$(members "$pid")" ]; then
        echo "processos de $pid ainda ativos; conferir manualmente" >&2; failed=1
      else
        rm -f "$record"
        echo "ciclo $cycle: grupo $pid encerrado"
      fi
    done
    [ "$failed" -ne 0 ] || rm -f "$state/approved"
    exit "$failed"
    ;;
  *) echo 'ação esperada: start, list, approve ou close' >&2; exit 2 ;;
esac
