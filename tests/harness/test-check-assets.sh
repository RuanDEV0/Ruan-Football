#!/usr/bin/env bash
# Motivo: crases literais nos textos (SC2016); OUT, CODE e TMP vêm de lib.sh (SC2154);
# funções test_* são chamadas pelo runner (SC2317).
# shellcheck disable=SC2016,SC2154,SC2317

setup() { make_fixture "$TMP/repo"; }
check() { "$TMP/repo/scripts/check-assets.sh" --root "$TMP/repo"; }
refs() { echo "$TMP/repo/assets-src/referencias"; }

register() {
  printf '| `%s` | teste | 07/11/2026 | — | interno |\n' "$1" >> "$(refs)/ORIGEM.md"
}

test_passes_on_current_repository() {
  setup
  run check
  assert_code 0
  assert_contains "Assets e referências consistentes."
}

test_fails_when_reference_is_not_registered() {
  setup
  echo 'x' > "$(refs)/rascunho.svg"
  run check
  assert_code 1
  assert_contains "assets-src/referencias/rascunho.svg sem registro em ORIGEM.md"
}

test_accepts_registered_reference() {
  setup
  echo '<svg></svg>' > "$(refs)/rascunho.svg"
  register rascunho.svg
  run check
  assert_code 0
}

test_fails_when_registry_lists_missing_file() {
  setup
  register sumiu.html
  run check
  assert_code 1
  assert_contains "ORIGEM.md cita arquivo inexistente: sumiu.html"
}

test_fails_when_reference_folder_lacks_registry() {
  setup
  rm "$(refs)/ORIGEM.md"
  run check
  assert_code 1
  assert_contains "ORIGEM.md ausente"
}

test_fails_when_reference_embeds_raster_image() {
  setup
  printf '<img src="data:image/jpeg;base64,AAAA">\n' > "$(refs)/com-foto.html"
  register com-foto.html
  run check
  assert_code 1
  assert_contains "com-foto.html embute imagem"
}

test_fails_on_photo_files_in_references() {
  setup
  printf 'jpeg' > "$(refs)/self.jpg"
  register self.jpg
  run check
  assert_code 1
  assert_contains "foto ou vídeo em referências: assets-src/referencias/self.jpg"
}

test_fails_on_video_outside_public_video() {
  setup
  mkdir -p "$TMP/repo/src/assets"
  printf 'mp4' > "$TMP/repo/src/assets/penalti.mp4"
  run check
  assert_code 1
  assert_contains "vídeo fora de public/video/: src/assets/penalti.mp4"
}

test_ignores_video_in_build_and_dependency_folders() {
  setup
  mkdir -p "$TMP/repo/node_modules/pkg" "$TMP/repo/dist" "$TMP/repo/public/video"
  printf 'mp4' > "$TMP/repo/node_modules/pkg/a.mp4"
  printf 'mp4' > "$TMP/repo/dist/b.mp4"
  printf 'mp4' > "$TMP/repo/public/video/penalti-720p.mp4"
  run check
  assert_code 0
}

test_fails_when_public_text_names_third_party_toy_brand() {
  setup
  echo '<p>Boneco estilo PlayMobil</p>' > "$TMP/repo/src/pages/marca.astro"
  run check
  assert_code 1
  assert_contains "marca de terceiros em src/pages/marca.astro"
}

test_ok_lines_do_not_follow_errors() {
  setup
  echo 'x' > "$(refs)/rascunho.svg"
  run check
  assert_not_contains "ok    registro de origem"
}
