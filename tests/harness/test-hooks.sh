#!/usr/bin/env bash
# Motivo: crases literais nos textos (SC2016); OUT, CODE e TMP vêm de lib.sh (SC2154);
# funções test_* são chamadas pelo runner (SC2317).
# shellcheck disable=SC2016,SC2154,SC2317

setup() {
  make_fixture "$TMP/repo"
  export CLAUDE_PROJECT_DIR="$TMP/repo"
  HOOKS="$TMP/repo/.claude/hooks"
}

install_fake_prettier() {
  mkdir -p "$TMP/repo/node_modules/.bin"
  cat > "$TMP/repo/node_modules/.bin/prettier" <<'EOF'
#!/usr/bin/env bash
for a in "$@"; do case "$a" in --*|warn) ;; *) echo "$a" >> "$(dirname "$0")/prettier.calls" ;; esac; done
EOF
  chmod +x "$TMP/repo/node_modules/.bin/prettier"
}


test_format_is_noop_without_prettier() {
  setup
  echo 'x' > "$TMP/repo/a.ts"
  run_stdin "$(hook_input s1 "$TMP/repo/a.ts")" "$HOOKS/format-file.sh"
  assert_code 0
  assert_empty
}

test_format_tolerates_invalid_json() {
  setup
  run_stdin 'não é json' "$HOOKS/format-file.sh"
  assert_code 0
}

test_format_formats_supported_extension() {
  setup
  install_fake_prettier
  echo 'x' > "$TMP/repo/a.ts"
  run_stdin "$(hook_input s1 "$TMP/repo/a.ts")" "$HOOKS/format-file.sh"
  assert_code 0
  grep -qx "$TMP/repo/a.ts" "$TMP/repo/node_modules/.bin/prettier.calls" || fail "prettier não foi chamado para a.ts"
}

test_format_skips_unsupported_extension() {
  setup
  install_fake_prettier
  echo 'x' > "$TMP/repo/foto.png"
  run_stdin "$(hook_input s1 "$TMP/repo/foto.png")" "$HOOKS/format-file.sh"
  assert_code 0
  assert_no_file "$TMP/repo/node_modules/.bin/prettier.calls"
}

test_format_skips_generated_directories() {
  setup
  install_fake_prettier
  mkdir -p "$TMP/repo/dist"
  echo 'x' > "$TMP/repo/dist/a.js"
  run_stdin "$(hook_input s1 "$TMP/repo/dist/a.js")" "$HOOKS/format-file.sh"
  assert_no_file "$TMP/repo/node_modules/.bin/prettier.calls"
}


test_track_records_edited_file() {
  setup
  echo 'x' > "$TMP/repo/AGENTS.md"
  run_stdin "$(hook_input sessao-1 "$TMP/repo/AGENTS.md")" "$HOOKS/track-edit.sh"
  assert_code 0
  assert_file "$TMP/repo/.claude/.state/edits-sessao-1.txt"
  grep -qx "AGENTS.md" "$TMP/repo/.claude/.state/edits-sessao-1.txt" || fail "caminho relativo não registrado"
}

test_track_sanitizes_session_id() {
  setup
  run_stdin "$(hook_input '../../fora' "$TMP/repo/AGENTS.md")" "$HOOKS/track-edit.sh"
  assert_code 0
  assert_no_file "$TMP/fora.txt"
  assert_file "$TMP/repo/.claude/.state/edits-fora.txt"
}

test_track_ignores_files_outside_project() {
  setup
  run_stdin "$(hook_input s1 "/etc/hosts")" "$HOOKS/track-edit.sh"
  assert_code 0
  assert_no_file "$TMP/repo/.claude/.state/edits-s1.txt"
}


record_edit() {
  mkdir -p "$TMP/repo/.claude/.state"
  echo "$2" >> "$TMP/repo/.claude/.state/edits-$1.txt"
}

test_stop_is_silent_without_edits() {
  setup
  run_stdin "$(hook_input s1)" "$HOOKS/verify-on-stop.sh"
  assert_code 0
  assert_empty
}

test_stop_passes_and_clears_state_when_checks_pass() {
  setup
  record_edit s1 AGENTS.md
  run_stdin "$(hook_input s1)" "$HOOKS/verify-on-stop.sh"
  assert_code 0
  assert_not_contains '"decision"'
  assert_no_file "$TMP/repo/.claude/.state/edits-s1.txt"
}

test_stop_blocks_when_checks_fail() {
  setup
  echo 'Veja `docs/ai/guides/inexistente.md`.' >> "$TMP/repo/docs/ai/README.md"
  record_edit s1 docs/ai/README.md
  run_stdin "$(hook_input s1)" "$HOOKS/verify-on-stop.sh"
  assert_code 0
  [ "$(jq -r .decision <<<"$OUT")" = "block" ] || fail "esperado decision=block. Saída: $OUT"
  assert_contains "inexistente.md"
  assert_file "$TMP/repo/.claude/.state/edits-s1.txt"
}

test_stop_never_blocks_twice() {
  setup
  echo 'Veja `docs/ai/guides/inexistente.md`.' >> "$TMP/repo/docs/ai/README.md"
  record_edit s1 docs/ai/README.md
  run_stdin "$(hook_input s1 '' true)" "$HOOKS/verify-on-stop.sh"
  assert_code 0
  [ "$(jq -r '.decision // "none"' <<<"$OUT")" = "none" ] || fail "não pode bloquear com stop_hook_active. Saída: $OUT"
  [ -n "$(jq -r '.systemMessage // empty' <<<"$OUT")" ] || fail "deveria avisar Ruan via systemMessage. Saída: $OUT"
  assert_no_file "$TMP/repo/.claude/.state/edits-s1.txt"
}

test_stop_ignores_deleted_files() {
  setup
  record_edit s1 docs/ai/apagado.md
  run_stdin "$(hook_input s1)" "$HOOKS/verify-on-stop.sh"
  assert_code 0
  assert_not_contains '"decision"'
}
