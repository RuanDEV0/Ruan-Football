#!/usr/bin/env bash
# Runner dos testes do harness, sem dependências além de bash e jq, para rodar igual
# localmente e na CI. Uso: tests/harness/run.sh [filtro]
set -uo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
filter="${1:-}"

if ! command -v jq >/dev/null 2>&1; then
  echo "ERRO: jq é necessário para os testes do harness." >&2
  exit 2
fi

# A fixture inclui tests/: sem esta marca, scripts/verify.sh dentro dela rodaria a suíte em recursão.
export HARNESS_TESTS_RUNNING=1

workdir=$(mktemp -d "${TMPDIR:-/tmp}/harness-tests.XXXXXX")
trap 'rm -rf "$workdir"' EXIT

passed=0
failed=0
failures=()

for file in "$here"/test-*.sh; do
  mapfile -t tests < <(bash -c "source '$here/lib.sh'; source '$file'; declare -F" | awk '$3 ~ /^test_/ {print $3}')
  for t in "${tests[@]}"; do
    [ -n "$filter" ] && [[ "$t" != *"$filter"* ]] && continue
    tmp="$workdir/$t"
    mkdir -p "$tmp"
    # Não use `if ( ... )`: dentro de uma condição o bash ignora `set -e`,
    # e só a última asserção do teste contaria.
    (
      set -e
      export TMP="$tmp"
      # shellcheck source=lib.sh
      source "$here/lib.sh"
      # shellcheck disable=SC1090
      source "$file"
      cd "$tmp"
      "$t"
    ) >"$tmp.log" 2>&1
    status=$?
    if [ "$status" -eq 0 ]; then
      passed=$((passed + 1))
      echo "ok    $(basename "$file" .sh) › $t"
    else
      failed=$((failed + 1))
      failures+=("$(basename "$file" .sh) › $t")
      echo "FALHA $(basename "$file" .sh) › $t"
      sed 's/^/      /' "$tmp.log"
    fi
  done
done

echo
echo "$passed passaram, $failed falharam."
[ "$failed" -eq 0 ]
