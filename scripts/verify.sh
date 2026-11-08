#!/usr/bin/env bash
# Ponto único de verificação do projeto: agentes, hook Stop e CI rodam o mesmo comando,
# para que "passou" signifique a mesma coisa em todos (docs/ai/guides/quality.md).
#
# Uso: scripts/verify.sh [--full] [--root DIR] [--files ARQUIVO...]
#   (padrão)  harness + aplicação: check, lint, test, build e orçamentos de bundle
#   --full    inclui pnpm test:e2e e test:performance
#   --files   modo rápido: verifica apenas o que os arquivos informados afetam
#             (usado pelo hook Stop do Claude Code)
#
# Cada etapa termina como ok, FALHOU ou pulado (com motivo). Sai com código 1 se algo falhar.
set -uo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=lib/node.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/node.sh"
full=0
files_mode=0
app_config_changed=0
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
    return 1
  fi
}

want_docs=1 want_shell=1 want_harness_tests=1 want_app=1 want_assets=1
changed_sh=()
changed_app=()
if [ "$files_mode" -eq 1 ]; then
  want_docs=0 want_shell=0 want_harness_tests=0 want_app=0 want_assets=0
  for f in "${files[@]}"; do
    [ -e "$f" ] || continue
    case "$f" in
      AGENTS.md|CLAUDE.md|GEMINI.md|README.md|docs/*|.claude/*|.cursor/*|.github/*) want_docs=1 ;;
    esac
    case "$f" in
      assets-src/*|public/*|src/*) want_assets=1 ;;
    esac
    case "$f" in
      *.sh) want_shell=1; changed_sh+=("$f") ;;
    esac
    case "$f" in
      scripts/*|.claude/hooks/*|tests/harness/*) want_harness_tests=1; want_docs=1 ;;
      package.json|pnpm-lock.yaml|pnpm-workspace.yaml|tsconfig.json|.nvmrc) want_app=1; app_config_changed=1 ;;
      src/*|tests/unit/*|tests/e2e/*|*.config.*) want_app=1; changed_app+=("$f") ;;
    esac
  done
fi

if [ "$want_docs" -eq 1 ]; then
  step "documentação para IA" scripts/check-ai-docs.sh --root "$root"
fi

if [ "$want_assets" -eq 1 ]; then
  if [ -x scripts/check-assets.sh ]; then
    step "assets e referências" scripts/check-assets.sh --root "$root"
  else
    skip "assets e referências" "scripts/check-assets.sh ausente"
  fi
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

check_node() {
  local want have
  want=$(tr -d '[:space:]v' < .nvmrc)
  if node_matches "$want"; then
    echo "Node $(node --version)"
    return 0
  fi
  have=$(node --version 2>/dev/null) || have="ausente"
  if activate_nvm "$want" && node_matches "$want"; then
    echo "Node $(node --version), ativado pelo nvm (antes: $have)"
    return 0
  fi
  node_mismatch_hint "$want" "$have"
  return 1
}

has_script() { jq -e --arg s "$1" '.scripts[$s] // empty' package.json >/dev/null 2>&1; }
pnpm_step() {
  local script=$1
  if has_script "$script"; then step "pnpm $script" pnpm "$script"; else skip "pnpm $script" "script ausente no package.json"; fi
}

node_ok=1
if [ "$want_app" -eq 1 ] && [ -f package.json ]; then
  if [ -f .nvmrc ]; then
    step "versão do Node" check_node || node_ok=0
  else
    skip "versão do Node" ".nvmrc ausente"
  fi
fi

if [ "$want_app" -eq 1 ]; then
  if [ ! -f package.json ]; then
    skip "aplicação" "package.json ausente; disponível a partir da Etapa 0"
  elif [ "$node_ok" -eq 0 ]; then
    skip "aplicação" "Node incompatível com .nvmrc"
  elif ! command -v pnpm >/dev/null 2>&1; then
    printf 'FALHOU  aplicação\n        pnpm não encontrado no PATH\n'
    failed=1
  elif [ "$files_mode" -eq 1 ] && [ "$app_config_changed" -eq 0 ]; then
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
    build_ok=1
    pnpm_step build || build_ok=0
    if [ "$build_ok" -eq 1 ] && has_script build; then
      if [ ! -x scripts/check-budgets.sh ]; then
        skip "orçamentos de bundle" "scripts/check-budgets.sh ausente"
      elif [ ! -d dist/_astro ]; then
        skip "orçamentos de bundle" "build não gerou dist/_astro"
      else
        step "orçamentos de bundle" scripts/check-budgets.sh --root "$root"
      fi
    fi
    if [ "$full" -eq 1 ] && [ "$build_ok" -eq 0 ]; then
      # Lighthouse lê dist/ direto: sem build novo ele mediria a versão anterior e passaria.
      skip "pnpm test:e2e" "build falhou nesta execução"
      skip "pnpm test:performance" "build falhou nesta execução"
    elif [ "$full" -eq 1 ]; then
      pnpm_step test:e2e
      pnpm_step test:performance
    else
      skip "pnpm test:e2e" "use --full"
      skip "pnpm test:performance" "use --full"
    fi
  fi
fi

echo
if [ "$failed" -ne 0 ]; then
  echo "Verificação falhou."
  exit 1
fi
echo "Verificação concluída."
