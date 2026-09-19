# QUI design system

One visual language, one token file: `src/styles/_tokens.css` (loaded last in `angular.json`).

## Rules

1. Use `--qui-*` tokens only. No hardcoded hex colours, `px` radii, `px` font sizes, box-shadows or font families in component CSS.
2. Brand colour is set by White Label (`--wl-accent`). `--qui-accent*` follows it automatically.
3. Do not add new `!important`. If a rule needs it to win, the selector or file order is wrong; fix that instead.
4. One stylesheet per component or page. Do not add `*-polish.css`, `*-v2.css`, `*-refined.css` override files.
5. Do not use the legacy `--ui-*`, `--ref-*`, `--enterprise-*`, `--canonical-*`, `--card-*` variables in new code. They are aliases kept for old files.

## Scales

| Token | Values |
|---|---|
| Radius | xs 4 · sm 6 · md 8 (inputs, buttons) · lg 12 (cards) · xl 16 · pill |
| Type | xs 11 · sm 12 · md 13 (body) · lg 14 · xl 16 · 2xl 18 · 3xl 22 (page title) · 4xl 28 |
| Spacing | 4 / 8 / 12 / 16 / 20 / 24 / 32 |
| Shadow | sm (controls) · md (cards) · lg (menus, modals) |
| Breakpoints | 640 phone · 960 tablet · 1200 small desktop |

## Migrating a file

1. Replace hex values with the matching `--qui-*` token.
2. Delete the `!important`s and see what breaks; fix the selector.
3. Merge any `*-polish` / `*-v2` sibling into the main file.
