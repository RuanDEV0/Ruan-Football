#!/usr/bin/env bash
# Hook PostToolUse (.claude/settings.json): mantém o código gerado no padrão do Prettier
# (docs/ai/guides/code-standards.md). Até a Etapa 0 instalar o Prettier, não tem efeito.
set -u

command -v jq >/dev/null 2>&1 || exit 0

file=$(jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0
[ -n "$file" ] && [ -f "$file" ] || exit 0

project="${CLAUDE_PROJECT_DIR:-$(pwd)}"
prettier="$project/node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0

case "$file" in
  "$project"/node_modules/*|"$project"/dist/*|"$project"/.astro/*) exit 0 ;;
esac

case "$file" in
  *.ts|*.mts|*.js|*.mjs|*.astro|*.css|*.json|*.md|*.mdx|*.yml|*.yaml|*.html)
    "$prettier" --write --log-level warn "$file" >/dev/null 2>&1 || true
    ;;
esac

exit 0
