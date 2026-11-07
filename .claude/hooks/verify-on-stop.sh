#!/usr/bin/env bash
# Hook Stop (.claude/settings.json): impede que o agente encerre a resposta com o código editado
# falhando em scripts/verify.sh (docs/ai/procedures/implement-change.md, passo 6).
# Bloqueia no máximo uma vez: com stop_hook_active=true, só avisa Ruan, ou o agente entraria em laço.
set -u

command -v jq >/dev/null 2>&1 || exit 0
input=$(cat)

session=$(jq -r '.session_id // "default"' <<<"$input" 2>/dev/null | tr -cd 'A-Za-z0-9_-')
[ -n "$session" ] || session=default
active=$(jq -r '.stop_hook_active // false' <<<"$input" 2>/dev/null)

project="${CLAUDE_PROJECT_DIR:-$(pwd)}"
edits="$project/.claude/.state/edits-$session.txt"
[ -s "$edits" ] || exit 0

mapfile -t files < <(sort -u "$edits")
verify="$project/scripts/verify.sh"
[ -x "$verify" ] || exit 0

if output=$("$verify" --root "$project" --files "${files[@]}" 2>&1); then
  rm -f "$edits"
  exit 0
fi

summary=$(printf '%s\n' "$output" | tail -n 40)

if [ "$active" = "true" ]; then
  rm -f "$edits"
  jq -n --arg m "A verificação dos arquivos editados continua falhando. Confira o relatório do agente."$'\n'"$summary" \
    '{systemMessage: $m}'
  exit 0
fi

reason="A verificação automática dos arquivos editados falhou (scripts/verify.sh --files)."$'\n'"$summary"$'\n\n'"Corrija a causa e rode a verificação de novo. Se a falha não foi causada por você ou não puder ser corrigida agora, relate-a a Ruan com a saída acima. Não desative testes nem verificações para passar."
jq -n --arg r "$reason" '{decision: "block", reason: $r}'
exit 0
