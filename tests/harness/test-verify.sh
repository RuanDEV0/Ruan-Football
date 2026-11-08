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

test_full_mode_runs_performance_after_browser_tests() {
  setup
  mkdir -p "$TMP/bin"
  printf '#!/usr/bin/env bash\nprintf "%%s\\n" "$1" >> "$(dirname "$0")/pnpm.calls"\n' > "$TMP/bin/pnpm"
  chmod +x "$TMP/bin/pnpm"
  echo '{"scripts":{"test:e2e":"x","test:performance":"x"}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo" --full
  assert_code 0
  assert_contains "ok      pnpm test:e2e"
  assert_contains "ok      pnpm test:performance"
}

test_package_changes_require_application_checks() {
  setup
  mkdir -p "$TMP/bin"
  printf '#!/usr/bin/env bash\nexit 1\n' > "$TMP/bin/pnpm"
  chmod +x "$TMP/bin/pnpm"
  echo '{"scripts":{"check":"x"}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo" --files package.json
  assert_code 1
  assert_contains "FALHOU  pnpm check"
}

test_fixture_preserves_shellcheck_source_resolution() {
  setup
  assert_file "$TMP/repo/.shellcheckrc"
}

fake_pnpm_logging() {
  mkdir -p "$TMP/bin"
  cat > "$TMP/bin/pnpm" <<'SH'
#!/usr/bin/env bash
echo "$1" >> "$(dirname "$0")/pnpm.calls"
[ "$1" = "${PNPM_FAIL_ON:-}" ] && exit 1
exit 0
SH
  chmod +x "$TMP/bin/pnpm"
}

test_fails_early_when_node_differs_from_nvmrc() {
  setup
  fake_node v22.23.1
  fake_pnpm_logging
  echo '26.13.0' > "$TMP/repo/.nvmrc"
  echo '{"scripts":{"check":"x","build":"x"}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" NVM_DIR="$TMP/sem-nvm" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo"
  assert_code 1
  assert_contains "FALHOU  versão do Node"
  assert_contains "v22.23.1"
  assert_contains "nvm use"
  assert_no_file "$TMP/bin/pnpm.calls"
}

test_accepts_node_matching_nvmrc() {
  setup
  fake_node v26.13.0
  fake_pnpm_logging
  echo '26.13.0' > "$TMP/repo/.nvmrc"
  echo '{"scripts":{"build":"x"}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo"
  assert_code 0
  assert_contains "ok      versão do Node"
}

test_rejects_older_patch_of_same_major() {
  setup
  fake_node v26.12.9
  fake_pnpm_logging
  echo '26.13.0' > "$TMP/repo/.nvmrc"
  echo '{"scripts":{"build":"x"}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" NVM_DIR="$TMP/sem-nvm" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo"
  assert_code 1
  assert_contains "FALHOU  versão do Node"
}

test_files_mode_checks_node_before_linting() {
  setup
  fake_node v22.23.1
  echo '26.13.0' > "$TMP/repo/.nvmrc"
  echo '{"scripts":{}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" NVM_DIR="$TMP/sem-nvm" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo" --files src/pages/index.astro
  assert_code 1
  assert_contains "FALHOU  versão do Node"
}

test_activates_nvmrc_version_through_nvm_when_installed() {
  setup
  fake_node v22.23.1
  fake_nvm 26.13.0
  fake_pnpm_logging
  echo '26.13.0' > "$TMP/repo/.nvmrc"
  echo '{"scripts":{"build":"x"}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" NVM_DIR="$TMP/nvm" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo"
  assert_code 0
  assert_contains "ok      versão do Node"
  assert_contains "ok      pnpm build"
  grep -qx build "$TMP/bin/pnpm.calls" || fail "pnpm não rodou depois de ativar o Node pelo nvm"
}

test_reports_install_hint_when_nvm_lacks_the_version() {
  setup
  fake_node v22.23.1
  fake_nvm 24.0.0
  fake_pnpm_logging
  echo '26.13.0' > "$TMP/repo/.nvmrc"
  echo '{"scripts":{"build":"x"}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" NVM_DIR="$TMP/nvm" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo"
  assert_code 1
  assert_contains "FALHOU  versão do Node"
  assert_contains "nvm install"
  assert_no_file "$TMP/bin/pnpm.calls"
}

test_checks_bundle_budgets_after_a_successful_build() {
  setup
  fake_pnpm_logging
  echo '{"scripts":{"build":"x"}}' > "$TMP/repo/package.json"
  mkdir -p "$TMP/repo/dist/_astro"
  printf '<script type="module" src="/_astro/entry.js"></script>' > "$TMP/repo/dist/index.html"
  head -c 80000 /dev/urandom | base64 -w0 > "$TMP/repo/dist/_astro/entry.js"
  run env PATH="$TMP/bin:$PATH" "$TMP/repo/scripts/verify.sh" --root "$TMP/repo"
  assert_code 1
  assert_contains "ok      pnpm build"
  assert_contains "FALHOU  orçamentos de bundle"
  assert_contains "acima do orçamento"
}

test_skips_browser_and_performance_checks_when_build_fails() {
  setup
  fake_pnpm_logging
  echo '{"scripts":{"build":"x","test:e2e":"x","test:performance":"x"}}' > "$TMP/repo/package.json"
  run env PATH="$TMP/bin:$PATH" PNPM_FAIL_ON=build "$TMP/repo/scripts/verify.sh" --root "$TMP/repo" --full
  assert_code 1
  assert_contains "FALHOU  pnpm build"
  assert_contains "pulado  pnpm test:performance (build falhou"
  assert_contains "pulado  pnpm test:e2e (build falhou"
  if grep -qx "test:performance" "$TMP/bin/pnpm.calls"; then fail "Lighthouse rodou sobre um dist/ antigo"; fi
}

test_runs_assets_check_by_default() {
  setup
  run verify
  assert_contains "ok      assets e referências"
}

test_files_mode_checks_assets_when_reference_changes() {
  setup
  echo 'x' > "$TMP/repo/assets-src/referencias/sem-registro.txt"
  run verify --files assets-src/referencias/sem-registro.txt
  assert_code 1
  assert_contains "FALHOU  assets e referências"
}
