#!/usr/bin/env bash
# Hook Stop: encerra somente ciclos já aprovados explicitamente por Ruan.
set -uo pipefail
command -v jq >/dev/null 2>&1 || exit 0
input=$(cat)
session=$(jq -r '.session_id // empty' <<< "$input" 2>/dev/null) || exit 0
[[ "$session" =~ ^[A-Za-z0-9_-]+$ ]] || exit 0
project="${CLAUDE_PROJECT_DIR:-$(pwd)}"
[ -f "$project/.claude/.state/processes/$session/approved" ] || exit 0
[ -x "$project/scripts/processes.sh" ] || exit 0
output=$("$project/scripts/processes.sh" close --root "$project" --cycle "$session" 2>&1) || {
  jq -n --arg m "Não foi possível encerrar todos os processos do ciclo: $output" '{systemMessage: $m}'
  exit 0
}
[ -z "$output" ] || jq -n --arg m "$output" '{systemMessage: $m}'
exit 0
