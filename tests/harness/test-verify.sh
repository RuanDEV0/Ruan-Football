#!/usr/bin/env bash
# Motivo: crases literais nos textos (SC2016); OUT, CODE e TMP vêm de lib.sh (SC2154);
# funções test_* são chamadas pelo runner (SC2317).
# shellcheck disable=SC2016,SC2154,SC2317

setup() { make_fixture "$TMP/repo"; }
verify() { "$TMP/repo/scripts/verify.sh" --root "$TMP/repo" "$@"; }

test_passes_before_stage_0_and_reports_skipped_app_checks() {
  setup
  run verify
  assert_code 0
  assert_contains "ok      documentação para IA"
  assert_contains "pulado  aplicação"
}

test_does_not_rerun_harness_tests_inside_harness_tests() {
  setup
  run env HARNESS_TESTS_RUNNING=1 "$TMP/repo/scripts/verify.sh" --root "$TMP/repo"
  assert_code 0
  assert_contains "pulado  testes do harness"
}

test_fixture_contains_harness_tests() {
  setup
  assert_file "$TMP/repo/tests/harness/run.sh"
}

test_reports_shellcheck_as_skipped_when_missing() {
  setup
  run env PATH="$(dirname "$(command -v jq)"):/usr/bin:/bin" SHELLCHECK=nao-existe "$TMP/repo/scripts/verify.sh" --root "$TMP/repo"
  assert_contains "pulado  shellcheck"
}

test_fails_when_docs_are_inconsistent() {
  setup
  rm "$TMP/repo/GEMINI.md"
  run verify
  assert_code 1
  assert_contains "FALHOU  documentação para IA"
}

test_fails_on_shell_syntax_error() {
  setup
  printf '#!/usr/bin/env bash\nif then\n' > "$TMP/repo/scripts/quebrado.sh"
  run verify
  assert_code 1
  assert_contains "FALHOU  sintaxe shell"
}

test_files_mode_only_checks_what_changed() {
  setup
  run verify --files src/pages/index.astro
  assert_code 0
  assert_not_contains "documentação para IA"
}

test_files_mode_checks_docs_when_harness_changed() {
  setup
  rm "$TMP/repo/GEMINI.md"
  run verify --files AGENTS.md
  assert_code 1
  assert_contains "FALHOU  documentação para IA"
}

test_runs_package_scripts_when_present() {
  setup
  mkdir -p "$TMP/bin"
  cat > "$TMP/bin/pnpm" <<'EOF'
#!/usr/bin/env bash
echo "$*" >> "$(dirname "$0")/pnpm.calls"
[ "$1" = "lint" ] && exit 1
exit 0
EOF
  chmod +x "$TMP/bin/pnpm"
  echo '{"scripts":{"check":"x","lint":"x","test":"x","build":"x"}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo"
  assert_code 1
  assert_contains "ok      pnpm check"
  assert_contains "FALHOU  pnpm lint"
  assert_contains "pulado  pnpm test:e2e"
  grep -qx "build" "$TMP/bin/pnpm.calls" || fail "pnpm build não foi executado"
}

test_skips_missing_package_scripts() {
  setup
  mkdir -p "$TMP/bin"
  printf '#!/usr/bin/env bash\nexit 0\n' > "$TMP/bin/pnpm"
  chmod +x "$TMP/bin/pnpm"
  echo '{"scripts":{"build":"x"}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo"
  assert_code 0
  assert_contains "pulado  pnpm lint"
}
