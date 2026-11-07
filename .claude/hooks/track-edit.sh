#!/usr/bin/env bash
# Hook PostToolUse (.claude/settings.json): fornece a verify-on-stop.sh a lista de arquivos
# editados na sessão. O estado em .claude/.state/ fica fora do Git. Nunca bloqueia a edição.
set -u

command -v jq >/dev/null 2>&1 || exit 0
input=$(cat)

file=$(jq -r '.tool_input.file_path // empty' <<<"$input" 2>/dev/null) || exit 0
session=$(jq -r '.session_id // "default"' <<<"$input" 2>/dev/null | tr -cd 'A-Za-z0-9_-')
[ -n "$file" ] || exit 0
[ -n "$session" ] || session=default

project="${CLAUDE_PROJECT_DIR:-$(pwd)}"
case "$file" in
  "$project"/*) rel="${file#"$project"/}" ;;
  /*) exit 0 ;;
  *) rel="$file" ;;
esac

state="$project/.claude/.state"
mkdir -p "$state" 2>/dev/null || exit 0
printf '%s\n' "$rel" >> "$state/edits-$session.txt"
exit 0
