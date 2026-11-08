#!/usr/bin/env bash
# Versão do Node pedida pelo .nvmrc, compartilhada por scripts/verify.sh e scripts/processes.sh.
# Hooks, CI e processos em segundo plano não herdam o `nvm use` do terminal.

# O Astro recusa Node fora do intervalo do package.json com um erro que parece falha do projeto.
node_matches() {
  local want=$1 have
  have=$(node --version 2>/dev/null) || return 1
  have=${have#v}
  [ "${have%%.*}" = "${want%%.*}" ] &&
    [ "$(printf '%s\n%s\n' "$want" "$have" | sort -V | head -n 1)" = "$want" ]
}

activate_nvm() {
  local want=$1 script="${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  [ -s "$script" ] || return 1
  # O nvm não é compatível com `set -u`.
  set +u
  # shellcheck source=/dev/null
  . "$script" >/dev/null 2>&1 && nvm use "$want" >/dev/null 2>&1
  local status=$?
  set -u
  return "$status"
}

node_mismatch_hint() {
  local want=$1 have=$2
  if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
    echo "Node $have ativo; o projeto pede $want (.nvmrc) e o nvm não o tem. Rode: nvm install $want"
  else
    echo "Node $have ativo; o projeto pede $want (.nvmrc). Rode: nvm use"
  fi
}
