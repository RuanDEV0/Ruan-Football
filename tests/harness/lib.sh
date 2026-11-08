#!/usr/bin/env bash
# Motivo: OUT, CODE e HARNESS_PATHS são lidos pelos arquivos de teste (SC2034).
# shellcheck disable=SC2034

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export REPO_ROOT

HARNESS_PATHS=(.shellcheckrc AGENTS.md CLAUDE.md GEMINI.md README.md docs .claude .cursor .github scripts tests src public assets-src)

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

fake_node() {
  mkdir -p "$TMP/bin"
  printf '#!/usr/bin/env bash\necho %s\n' "$1" > "$TMP/bin/node"
  chmod +x "$TMP/bin/node"
}

# nvm de mentira: `nvm use VERSAO` coloca no PATH um node que responde a versão pedida, se instalada.
fake_nvm() {
  local installed=$1
  mkdir -p "$TMP/nvm/versions/$installed"
  printf '#!/usr/bin/env bash\necho v%s\n' "$installed" > "$TMP/nvm/versions/$installed/node"
  chmod +x "$TMP/nvm/versions/$installed/node"
  cat > "$TMP/nvm/nvm.sh" <<'SH'
nvm() {
  [ "$1" = use ] || return 2
  local dir="$NVM_DIR/versions/${2#v}"
  [ -x "$dir/node" ] || { echo "N/A: version \"$2\" is not yet installed." >&2; return 3; }
  PATH="$dir:$PATH"
}
SH
}
