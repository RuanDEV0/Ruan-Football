#!/usr/bin/env bash
# Motivo: OUT, CODE e TMP vêm de lib.sh (SC2154); funções test_* são chamadas pelo runner (SC2317).
# shellcheck disable=SC2154,SC2317

budgets() { "$REPO_ROOT/scripts/check-budgets.sh" --root "$TMP/site" "$@"; }

# Conteúdo aleatório não comprime: o tamanho gzip fica próximo do tamanho pedido.
random_js() { head -c "$2" /dev/urandom | base64 -w0 | sed 's/^/\/\//' > "$1"; }

make_site() {
  mkdir -p "$TMP/site/dist/_astro"
  cat > "$TMP/site/dist/index.html" <<'HTML'
<html><head><script type="module" src="/_astro/entry.js"></script></head></html>
HTML
  printf 'import{a}from"./shared.js";const s=()=>import("./scene.js");\n' > "$TMP/site/dist/_astro/entry.js"
  printf 'export const a=1;\n' > "$TMP/site/dist/_astro/shared.js"
  printf 'import"./three.js";\n' > "$TMP/site/dist/_astro/scene.js"
  printf '//three\n' > "$TMP/site/dist/_astro/three.js"
}

test_reports_initial_and_scene_sizes_within_budget() {
  make_site
  run budgets
  assert_code 0
  assert_contains "JS inicial"
  assert_contains "cena"
}

test_counts_static_imports_as_initial_and_dynamic_imports_as_scene() {
  make_site
  random_js "$TMP/site/dist/_astro/shared.js" 60000
  run budgets
  assert_code 1
  assert_contains "JS inicial"
  assert_contains "acima"
}

test_fails_when_scene_exceeds_its_budget() {
  make_site
  random_js "$TMP/site/dist/_astro/three.js" 300000
  run budgets
  assert_code 1
  assert_contains "cena"
  assert_contains "acima"
}

test_fails_with_usage_error_without_build() {
  mkdir -p "$TMP/site"
  run budgets
  assert_code 2
  assert_contains "dist/"
}
