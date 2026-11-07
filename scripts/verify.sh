#!/usr/bin/env bash
# Ponto único de verificação do projeto: agentes, hook Stop e CI rodam o mesmo comando,
# para que "passou" signifique a mesma coisa em todos (docs/ai/guides/quality.md).
#
# Uso: scripts/verify.sh [--full] [--root DIR] [--files ARQUIVO...]
#   (padrão)  harness + aplicação: check, lint, test e build
#   --full    inclui também pnpm test:e2e
#   --files   modo rápido: verifica apenas o que os arquivos informados afetam
#             (usado pelo hook Stop do Claude Code)
#
# Cada etapa termina como ok, FALHOU ou pulado (com motivo). Sai com código 1 se algo falhar.
set -uo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
full=0
files_mode=0
files=()
while [ $# -gt 0 ]; do
  case "$1" in
    --full) full=1; shift ;;
    --root) root="$(cd "$2" && pwd)" || exit 2; shift 2 ;;
    --files) files_mode=1; shift; while [ $# -gt 0 ] && [[ "$1" != --* ]]; do files+=("$1"); shift; done ;;
    -h|--help) sed -n '2,10p' "$0"; exit 0 ;;
    *) echo "argumento desconhecido: $1" >&2; exit 2 ;;
  esac
done
cd "$root" || exit 2

SHELLCHECK="${SHELLCHECK:-shellcheck}"
failed=0
log=$(mktemp "${TMPDIR:-/tmp}/verify.XXXXXX")
trap 'rm -f "$log"' EXIT

pass() { printf 'ok      %s\n' "$1"; }
skip() { printf 'pulado  %s (%s)\n' "$1" "$2"; }
syntax() { local f; for f in "$@"; do bash -n "$f" || return 1; done; }
step() {
  local name=$1
  shift
  if "$@" >"$log" 2>&1; then
    pass "$name"
  else
    printf 'FALHOU  %s\n' "$name"
    tail -n 30 "$log" | sed 's/^/        /'
    failed=1
  fi
}

want_docs=1 want_shell=1 want_harness_tests=1 want_app=1
changed_sh=()
changed_app=()
if [ "$files_mode" -eq 1 ]; then
  want_docs=0 want_shell=0 want_harness_tests=0 want_app=0
  for f in "${files[@]}"; do
    [ -e "$f" ] || continue
    case "$f" in
      AGENTS.md|CLAUDE.md|GEMINI.md|PLANO-IMPLEMENTACAO.md|docs/ai/*|.claude/*|.cursor/*|.github/*) want_docs=1 ;;
    esac
    case "$f" in
      *.sh) want_shell=1; changed_sh+=("$f") ;;
    esac
    case "$f" in
      scripts/*|.claude/hooks/*|tests/harness/*) want_harness_tests=1; want_docs=1 ;;
      src/*|tests/unit/*|tests/e2e/*|*.config.*|astro.config.mjs) want_app=1; changed_app+=("$f") ;;
    esac
  done
fi

if [ "$want_docs" -eq 1 ]; then
  step "documentação para IA" scripts/check-ai-docs.sh --root "$root"
fi

if [ "$want_shell" -eq 1 ]; then
  if [ "$files_mode" -eq 1 ]; then
    sh_files=("${changed_sh[@]}")
  else
    mapfile -t sh_files < <(find scripts .claude/hooks tests/harness -name '*.sh' -type f 2>/dev/null | sort)
  fi
  if [ "${#sh_files[@]}" -gt 0 ]; then
    step "sintaxe shell" syntax "${sh_files[@]}"
    if command -v "$SHELLCHECK" >/dev/null 2>&1; then
      step "shellcheck" "$SHELLCHECK" -x "${sh_files[@]}"
    else
      skip "shellcheck" "não instalado; roda na CI"
    fi
  fi
fi

if [ "$want_harness_tests" -eq 1 ]; then
  if [ "${HARNESS_TESTS_RUNNING:-0}" = 1 ]; then
    skip "testes do harness" "já em execução"
  elif [ -x tests/harness/run.sh ]; then
    step "testes do harness" tests/harness/run.sh
  else
    skip "testes do harness" "tests/harness/run.sh ausente"
  fi
fi

has_script() { jq -e --arg s "$1" '.scripts[$s] // empty' package.json >/dev/null 2>&1; }
pnpm_step() {
  local script=$1
  if has_script "$script"; then step "pnpm $script" pnpm "$script"; else skip "pnpm $script" "script ausente no package.json"; fi
}

if [ "$want_app" -eq 1 ]; then
  if [ ! -f package.json ]; then
    skip "aplicação" "package.json ausente; disponível a partir da Etapa 0"
  elif ! command -v pnpm >/dev/null 2>&1; then
    printf 'FALHOU  aplicação\n        pnpm não encontrado no PATH\n'
    failed=1
  elif [ "$files_mode" -eq 1 ]; then
    lintable=()
    for f in "${changed_app[@]}"; do
      case "$f" in *.ts|*.mts|*.js|*.mjs|*.astro) lintable+=("$f") ;; esac
    done
    if [ "${#lintable[@]}" -gt 0 ] && [ -x node_modules/.bin/eslint ]; then
      step "eslint (arquivos alterados)" node_modules/.bin/eslint --max-warnings 0 "${lintable[@]}"
    fi
    if [ "${#lintable[@]}" -gt 0 ] && [ -x node_modules/.bin/vitest ]; then
      step "vitest (testes relacionados)" node_modules/.bin/vitest related --run --passWithNoTests "${lintable[@]}"
    fi
  else
    pnpm_step check
    pnpm_step lint
    pnpm_step test
    pnpm_step build
    if [ "$full" -eq 1 ]; then pnpm_step test:e2e; else skip "pnpm test:e2e" "use --full"; fi
  fi
fi

echo
if [ "$failed" -ne 0 ]; then
  echo "Verificação falhou."
  exit 1
fi
echo "Verificação concluída."
