#!/usr/bin/env bash
# Protege contra a regressão do runner descrita em docs/ai/procedures/implement-change.md, passo 5.
# Motivo: crases literais nos textos (SC2016); OUT, CODE e TMP vêm de lib.sh (SC2154);
# funções test_* são chamadas pelo runner (SC2317).
# shellcheck disable=SC2016,SC2154,SC2317

make_suite() {
  mkdir -p "$TMP/suite"
  cp "$REPO_ROOT/tests/harness/run.sh" "$REPO_ROOT/tests/harness/lib.sh" "$TMP/suite/"
  cat > "$TMP/suite/test-sample.sh" <<'EOF'
test_middle_assertion_fails() {
  CODE=1 OUT=""
  assert_code 0
  CODE=0
  assert_code 0
}
test_all_pass() {
  CODE=0 OUT="abc"
  assert_contains "b"
}
EOF
}

test_runner_detects_failure_before_last_assertion() {
  make_suite
  run "$TMP/suite/run.sh"
  assert_code 1
  assert_contains "FALHA test-sample › test_middle_assertion_fails"
  assert_contains "ok    test-sample › test_all_pass"
  assert_contains "1 passaram, 1 falharam."
}

test_runner_filter_selects_tests() {
  make_suite
  run "$TMP/suite/run.sh" all_pass
  assert_code 0
  assert_contains "1 passaram, 0 falharam."
}

# scripts/verify.sh mostra só o fim da saída de uma etapa que falha.
test_runner_ends_by_naming_the_failed_tests() {
  make_suite
  run "$TMP/suite/run.sh"
  assert_code 1
  [[ "$(tail -n 2 <<< "$OUT")" == *"test-sample › test_middle_assertion_fails"* ]] ||
    fail "o resumo final não nomeia o teste que falhou. Saída:"$'\n'"$OUT"
}
