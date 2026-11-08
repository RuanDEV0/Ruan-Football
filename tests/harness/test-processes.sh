#!/usr/bin/env bash
# Motivo: TMP, OUT e CODE vêm do runner; as funções test_* são descobertas em runtime.
# shellcheck disable=SC2016,SC2154,SC2317

setup_processes() {
  make_fixture "$TMP/repo"
  manager="$TMP/repo/scripts/processes.sh"
  mkdir -p "$TMP/repo/.claude/.state/processes"
}

start_process() {
  "$manager" start --root "$TMP/repo" --cycle "$1" -- bash -c 'sleep 120 & wait'
}

cleanup_process_test() {
  local p
  for p in "${tracked_pids[@]}"; do kill -KILL -- "-$p" 2>/dev/null || true; done
}

test_processes_requires_approval_and_closes_only_its_cycle() {
  setup_processes
  tracked_pids=()
  trap cleanup_process_test EXIT
  first=$(start_process first); tracked_pids+=("$first")
  second=$(start_process second); tracked_pids+=("$second")
  run "$manager" close --root "$TMP/repo" --cycle first
  assert_code 1
  kill -0 "$first"
  "$manager" approve --root "$TMP/repo" --cycle first
  run "$manager" close --root "$TMP/repo" --cycle first
  assert_code 0
  assert_contains 'encerrado'
  kill -0 "$second"
  run "$manager" close --root "$TMP/repo" --cycle first
  assert_code 0
}

test_processes_refuses_reused_pid_identity() {
  setup_processes
  tracked_pids=()
  trap cleanup_process_test EXIT
  pid=$(start_process stale); tracked_pids+=("$pid")
  printf '%s\t0\n' "$pid" > "$TMP/repo/.claude/.state/processes/stale/$pid.pid"
  "$manager" approve --root "$TMP/repo" --cycle stale
  run "$manager" close --root "$TMP/repo" --cycle stale
  assert_code 1
  assert_contains 'identidade'
  kill -0 "$pid"
}

test_processes_closes_orphaned_children_and_rejects_invalid_cycles() {
  setup_processes
  tracked_pids=()
  trap cleanup_process_test EXIT
  pid=$("$manager" start --root "$TMP/repo" --cycle child -- bash -c 'sleep 120 & printf "%s" "$!" > child.pid'); tracked_pids+=("$pid")
  for ((i=0; i<100; i++)); do [ -s "$TMP/repo/child.pid" ] && break; sleep 0.02; done
  child=$(cat "$TMP/repo/child.pid")
  "$manager" approve --root "$TMP/repo" --cycle child
  run "$manager" close --root "$TMP/repo" --cycle child
  assert_code 0
  # Um processo finalizado pode permanecer brevemente como zumbi sob o init do ambiente de teste.
  if [ -r "/proc/$child/stat" ]; then
    stat=$(cat "/proc/$child/stat"); rest=${stat##*) }
    [[ "$rest" == Z\ * ]] || fail "filho continua ativo"
  fi
  run "$manager" start --root "$TMP/repo" --cycle '../outside' -- true
  assert_code 2
}

test_processes_hook_is_gated_by_approval() {
  setup_processes
  export CLAUDE_PROJECT_DIR="$TMP/repo"
  tracked_pids=()
  trap cleanup_process_test EXIT
  pid=$(start_process hook); tracked_pids+=("$pid")
  run_stdin '{"session_id":"hook"}' "$TMP/repo/.claude/hooks/close-processes.sh"
  assert_code 0
  assert_empty
  kill -0 "$pid"
  "$manager" approve --root "$TMP/repo" --cycle hook
  run_stdin '{"session_id":"hook"}' "$TMP/repo/.claude/hooks/close-processes.sh"
  assert_code 0
  assert_contains 'encerrado'
}


test_processes_forces_stubborn_children_and_preserves_literal_arguments() {
  setup_processes
  tracked_pids=()
  trap cleanup_process_test EXIT
  pid=$("$manager" start --root "$TMP/repo" --cycle stubborn -- bash -c 'trap "" TERM; printf "%s" "$1" > literal.txt; sleep 120 & wait' bash '$(touch injected)')
  tracked_pids+=("$pid")
  for ((i=0; i<100; i++)); do [ -s "$TMP/repo/literal.txt" ] && break; sleep 0.02; done
  assert_no_file "$TMP/repo/injected"
  grep -Fxq '$(touch injected)' "$TMP/repo/literal.txt"
  "$manager" approve --root "$TMP/repo" --cycle stubborn
  run "$manager" close --root "$TMP/repo" --cycle stubborn
  assert_code 0
  assert_contains 'encerrado'
}

test_processes_new_work_revokes_previous_approval() {
  setup_processes
  tracked_pids=()
  trap cleanup_process_test EXIT
  first=$(start_process reuse); tracked_pids+=("$first")
  "$manager" approve --root "$TMP/repo" --cycle reuse
  second=$(start_process reuse); tracked_pids+=("$second")
  run "$manager" close --root "$TMP/repo" --cycle reuse
  assert_code 1
  kill -0 "$first"
  kill -0 "$second"
}

test_processes_cleanup_hook_is_registered() {
  setup_processes
  jq -e '[.hooks.Stop[].hooks[].command | contains("/close-processes.sh")] | any' "$TMP/repo/.claude/settings.json" >/dev/null
}

test_processes_hook_ignores_invalid_or_missing_sessions() {
  setup_processes
  export CLAUDE_PROJECT_DIR="$TMP/repo"
  for input in 'invalid' '{}' '{"session_id":"../outside"}'; do
    run_stdin "$input" "$TMP/repo/.claude/hooks/close-processes.sh"
    assert_code 0
    assert_empty
  done
}

is_running() {
  local stat rest
  [ -r "/proc/$1/stat" ] || return 1
  stat=$(cat "/proc/$1/stat") || return 1
  rest=${stat##*) }
  [[ "$rest" != Z\ * ]]
}

test_processes_supervisor_exits_when_its_command_ends() {
  setup_processes
  tracked_pids=()
  trap cleanup_process_test EXIT
  pid=$("$manager" start --root "$TMP/repo" --cycle ended -- false); tracked_pids+=("$pid")
  for ((i=0; i<100; i++)); do is_running "$pid" || break; sleep 0.05; done
  ! is_running "$pid" || fail "supervisor $pid continua ativo depois que o comando terminou"
}

test_processes_start_runs_command_with_nvmrc_node() {
  setup_processes
  fake_node v22.23.1
  fake_nvm 26.13.0
  echo '26.13.0' > "$TMP/repo/.nvmrc"
  tracked_pids=()
  trap cleanup_process_test EXIT
  pid=$(env PATH="$TMP/bin:$PATH" NVM_DIR="$TMP/nvm" "$manager" start --root "$TMP/repo" --cycle node -- bash -c 'node > node.txt'); tracked_pids+=("$pid")
  for ((i=0; i<100; i++)); do [ -s "$TMP/repo/node.txt" ] && break; sleep 0.02; done
  [ "$(cat "$TMP/repo/node.txt")" = v26.13.0 ] || fail "comando rodou com $(cat "$TMP/repo/node.txt"), esperado v26.13.0"
}

test_processes_start_warns_when_nvmrc_node_is_unavailable() {
  setup_processes
  fake_node v22.23.1
  fake_nvm 24.0.0
  echo '26.13.0' > "$TMP/repo/.nvmrc"
  tracked_pids=()
  trap cleanup_process_test EXIT
  run env PATH="$TMP/bin:$PATH" NVM_DIR="$TMP/nvm" "$manager" start --root "$TMP/repo" --cycle missing -- bash -c 'sleep 120 & wait'
  tracked_pids+=("${OUT##*$'\n'}")
  assert_code 0
  assert_contains "nvm install 26.13.0"
}
