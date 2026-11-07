#!/usr/bin/env bash
# Motivo: OUT, CODE e HARNESS_PATHS são lidos pelos arquivos de teste (SC2034).
# shellcheck disable=SC2034

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export REPO_ROOT

HARNESS_PATHS=(AGENTS.md CLAUDE.md GEMINI.md PLANO-IMPLEMENTACAO.md docs .claude .cursor .github scripts tests)

make_fixture() {
  local dst=$1 path
  mkdir -p "$dst"
  for path in "${HARNESS_PATHS[@]}"; do
    [ -e "$REPO_ROOT/$path" ] && cp -R "$REPO_ROOT/$path" "$dst/"
  done
  rm -rf "$dst/.claude/.state"
}

run() {
  CODE=0
  OUT=$("$@" 2>&1) || CODE=$?
}

run_stdin() {
  local input=$1
  shift
  CODE=0
  OUT=$(printf '%s' "$input" | "$@" 2>&1) || CODE=$?
}

fail() {
  echo "    $*" >&2
  return 1
}

assert_code() {
  [ "$CODE" -eq "$1" ] || fail "código esperado $1, obtido $CODE. Saída:" $'\n'"$OUT"
}

assert_contains() {
  [[ "$OUT" == *"$1"* ]] || fail "saída não contém: $1. Saída:" $'\n'"$OUT"
}

assert_not_contains() {
  [[ "$OUT" != *"$1"* ]] || fail "saída não deveria conter: $1. Saída:" $'\n'"$OUT"
}

assert_empty() {
  [ -z "$OUT" ] || fail "saída deveria ser vazia. Saída:" $'\n'"$OUT"
}

assert_file() {
  [ -f "$1" ] || fail "arquivo deveria existir: $1"
}

assert_no_file() {
  [ ! -e "$1" ] || fail "arquivo não deveria existir: $1"
}

# Mesmo formato de entrada que o Claude Code envia aos hooks.
hook_input() {
  jq -cn --arg s "$1" --arg f "${2:-}" --argjson a "${3:-false}" \
    '{session_id: $s, tool_input: {file_path: $f}, stop_hook_active: $a}'
}
