#!/usr/bin/env bash
# Motivo: crases literais nos textos (SC2016); OUT, CODE e TMP vêm de lib.sh (SC2154);
# funções test_* são chamadas pelo runner (SC2317).
# shellcheck disable=SC2016,SC2154,SC2317

checker() { "$TMP/repo/scripts/check-ai-docs.sh" --root "$TMP/repo"; }

setup() { make_fixture "$TMP/repo"; }

test_passes_on_current_harness() {
  setup
  run checker
  assert_code 0
  assert_contains "consistente"
}

test_root_option_checks_given_directory() {
  setup
  make_fixture "$TMP/other"
  rm "$TMP/other/GEMINI.md"
  run "$TMP/repo/scripts/check-ai-docs.sh" --root "$TMP/other"
  assert_code 1
  assert_contains "GEMINI.md"
}

test_fails_on_broken_reference() {
  setup
  echo 'Veja `docs/ai/guides/inexistente.md`.' >> "$TMP/repo/docs/ai/README.md"
  run checker
  assert_code 1
  assert_contains "referência quebrada: docs/ai/guides/inexistente.md"
}

test_ignores_placeholder_references() {
  setup
  echo 'Modelo: `docs/decisoes/NNNN-titulo.md`, `docs/ai/guides/<area>.md` e `tests/harness/test-*.sh`.' >> "$TMP/repo/docs/ai/README.md"
  run checker
  assert_code 0
}

test_fails_when_guide_lacks_adapter() {
  setup
  rm "$TMP/repo/.cursor/rules/assets.mdc"
  run checker
  assert_code 1
  assert_contains ".cursor/rules/assets.mdc"
}

test_fails_when_agents_md_too_large() {
  setup
  head -c 17000 /dev/zero | tr '\0' 'x' >> "$TMP/repo/AGENTS.md"
  run checker
  assert_code 1
  assert_contains "limite: 16384"
}

test_fails_on_invalid_settings_json() {
  setup
  echo '{ invalido' > "$TMP/repo/.claude/settings.json"
  run checker
  assert_code 1
  assert_contains "settings.json não é JSON válido"
}

test_fails_when_claude_md_does_not_import_agents() {
  setup
  sed -i '/^@AGENTS.md$/d' "$TMP/repo/CLAUDE.md"
  run checker
  assert_code 1
  assert_contains "CLAUDE.md não importa"
}

test_fails_when_skill_points_to_missing_procedure() {
  setup
  sed -i 's#docs/ai/procedures/start-stage.md#docs/ai/procedures/nao-existe.md#' \
    "$TMP/repo/.claude/skills/start-stage/SKILL.md"
  run checker
  assert_code 1
  assert_contains "docs/ai/procedures/nao-existe.md"
}

test_fails_when_skill_lacks_description() {
  setup
  sed -i '/^description:/d' "$TMP/repo/.claude/skills/add-project/SKILL.md"
  run checker
  assert_code 1
  assert_contains "add-project/SKILL.md sem 'description'"
}

test_fails_when_subagent_lacks_tools() {
  setup
  sed -i '/^tools:/d' "$TMP/repo/.claude/agents/content-reviewer.md"
  run checker
  assert_code 1
  assert_contains "content-reviewer.md sem 'tools'"
}

test_fails_when_cursor_rule_lacks_globs() {
  setup
  sed -i '/^globs:/d' "$TMP/repo/.cursor/rules/content.mdc"
  run checker
  assert_code 1
  assert_contains "content.mdc sem 'globs'"
}

test_fails_when_copilot_instruction_lacks_apply_to() {
  setup
  sed -i '/^applyTo:/d' "$TMP/repo/.github/instructions/quality.instructions.md"
  run checker
  assert_code 1
  assert_contains "quality.instructions.md sem 'applyTo'"
}

test_fails_when_procedure_missing_from_agents_md() {
  setup
  echo '# Novo' > "$TMP/repo/docs/ai/procedures/novo.md"
  run checker
  assert_code 1
  assert_contains "docs/ai/procedures/novo.md não aparece"
}

test_ok_lines_do_not_follow_errors() {
  setup
  rm "$TMP/repo/.cursor/rules/assets.mdc"
  run checker
  assert_not_contains "ok    guias com adaptadores"
}

test_fails_when_approved_plan_is_missing_from_docs() {
  setup
  rm -f "$TMP/repo/docs/PLANO-IMPLEMENTACAO.md"
  run checker
  assert_code 1
  assert_contains "docs/PLANO-IMPLEMENTACAO.md"
}

test_fails_on_broken_reference_in_stage_report() {
  setup
  echo 'Arquivo: `src/data/nao-existe.ts`.' >> "$TMP/repo/docs/etapa-0-verificacao.md"
  run checker
  assert_code 1
  assert_contains "referência quebrada: src/data/nao-existe.ts"
}

test_fails_on_broken_reference_in_readme() {
  setup
  echo 'Veja `assets-src/referencias/nao-existe.html`.' >> "$TMP/repo/README.md"
  run checker
  assert_code 1
  assert_contains "referência quebrada: assets-src/referencias/nao-existe.html"
}

test_content_drafts_may_cite_other_repositories() {
  setup
  echo 'No outro projeto: `src/main/java/App.java`.' >> "$TMP/repo/docs/conteudo/evidencias-locais.md"
  run checker
  assert_code 0
}
