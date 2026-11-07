#!/usr/bin/env bash
# Mantém AGENTS.md, docs/ai/ e os adaptadores de cada ferramenta consistentes (docs/ai/README.md).
# Uso: scripts/check-ai-docs.sh [--root DIR]. Chamado por scripts/verify.sh e pela CI.
set -uo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
while [ $# -gt 0 ]; do
  case "$1" in
    --root) root="$(cd "$2" && pwd)" || exit 2; shift 2 ;;
    -h|--help) sed -n '2,3p' "$0"; exit 0 ;;
    *) echo "argumento desconhecido: $1" >&2; exit 2 ;;
  esac
done
cd "$root" || exit 2

errors=0
mark=0
fail() { echo "ERRO: $*"; errors=$((errors + 1)); }
ok() {
  if [ "$errors" -eq "$mark" ]; then echo "ok    $*"; fi
  mark=$errors
}
contains() { grep -qF -- "$2" "$1"; }
has_field() {
  awk -v f="$2" 'NR == 1 && $0 != "---" { exit 1 }
                 NR > 1 && $0 == "---" { exit found ? 0 : 1 }
                 NR > 1 && index($0, f ":") == 1 { found = 1 }
                 END { if (NR < 2) exit 1 }' "$1"
}
require_fields() {
  local file=$1 field
  shift
  for field in "$@"; do has_field "$file" "$field" || fail "$file sem '$field' no frontmatter"; done
}

for f in AGENTS.md CLAUDE.md GEMINI.md PLANO-IMPLEMENTACAO.md docs/ai/README.md \
         .github/copilot-instructions.md .claude/settings.json; do
  [ -f "$f" ] || fail "arquivo obrigatório ausente: $f"
done
for f in .claude/hooks/*.sh scripts/*.sh; do
  [ -e "$f" ] || continue
  [ -x "$f" ] || fail "$f não é executável"
done
ok "arquivos obrigatórios"

[ -f CLAUDE.md ] && { grep -qx '@AGENTS.md' CLAUDE.md || fail "CLAUDE.md não importa @AGENTS.md"; }
[ -f GEMINI.md ] && { grep -qx '@./AGENTS.md' GEMINI.md || fail "GEMINI.md não importa @./AGENTS.md"; }
[ -f .github/copilot-instructions.md ] && { contains .github/copilot-instructions.md AGENTS.md || fail "copilot-instructions.md não referencia AGENTS.md"; }
ok "adaptadores apontam para AGENTS.md"

# O Codex trunca AGENTS.md longos; o limite mantém folga.
if [ -f AGENTS.md ]; then
  size=$(wc -c < AGENTS.md)
  [ "$size" -le 16384 ] || fail "AGENTS.md tem $size bytes (limite: 16384)"
  ok "AGENTS.md com $size bytes"
fi

for guide in docs/ai/guides/*.md; do
  [ -e "$guide" ] || continue
  slug=$(basename "$guide" .md)
  for adapter in ".claude/rules/$slug.md" ".cursor/rules/$slug.mdc" ".github/instructions/$slug.instructions.md"; do
    [ -f "$adapter" ] || fail "falta $adapter (adaptador de $guide)"
  done
  contains AGENTS.md "$guide"          || fail "$guide não aparece no mapa do AGENTS.md"
  contains docs/ai/README.md "$slug.md" || fail "$guide não aparece em docs/ai/README.md"
done
ok "guias com adaptadores"

for proc in docs/ai/procedures/*.md; do
  [ -e "$proc" ] || continue
  contains AGENTS.md "$proc" || fail "$proc não aparece na tabela de procedimentos do AGENTS.md"
done
ok "procedimentos listados"

for f in .claude/rules/*.md;               do [ -e "$f" ] && require_fields "$f" paths; done
for f in .claude/skills/*/SKILL.md;        do [ -e "$f" ] && require_fields "$f" name description; done
for f in .claude/agents/*.md;              do [ -e "$f" ] && require_fields "$f" name description tools; done
for f in .cursor/rules/*.mdc;              do [ -e "$f" ] && require_fields "$f" description globs; done
for f in .github/instructions/*.instructions.md; do [ -e "$f" ] && require_fields "$f" applyTo; done
ok "frontmatter dos adaptadores"

scan=()
for f in AGENTS.md CLAUDE.md GEMINI.md .github/copilot-instructions.md; do [ -f "$f" ] && scan+=("$f"); done
while IFS= read -r f; do scan+=("$f"); done < <(
  find docs/ai .claude .cursor .github/instructions -type f \( -name '*.md' -o -name '*.mdc' \) 2>/dev/null | sort
)
pattern='(`|@)(\./)?(AGENTS|CLAUDE|GEMINI|PLANO-IMPLEMENTACAO)\.md|(`|@)(\./)?(docs/ai|\.claude|\.cursor|\.github|scripts|tests/harness)/[A-Za-z0-9._/*<>-]+'
while IFS= read -r ref; do
  ref="${ref#[\`@]}"
  ref="${ref#./}"
  ref="${ref%.}"
  case "$ref" in
    *'*'*|*'<'*|*NNNN*) continue ;;                          # modelos e globs
    .github/workflows/*|.claude/settings.local.json|.claude/.state*) continue ;; # Etapa 0, pessoal ou gerado
  esac
  [ -e "$ref" ] || fail "referência quebrada: $ref"
done < <(grep -ohE "$pattern" "${scan[@]}" | sort -u)
ok "referências a arquivos"

if [ -f .claude/settings.json ] && command -v jq >/dev/null 2>&1; then
  jq empty .claude/settings.json 2>/dev/null || fail ".claude/settings.json não é JSON válido"
  ok "settings.json válido"
fi

echo
if [ "$errors" -gt 0 ]; then
  echo "$errors erro(s) encontrado(s)."
  exit 1
fi
echo "Documentação para IA consistente."
