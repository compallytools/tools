# Qualité

Tout se lance via Task, dans les conteneurs. Les tâches sont regroupées dans le namespace `quality` (`taskfiles/quality.yml`).

| Commande | Contenu |
|---|---|
| `task quality` | Tout : `quality:php` + `quality:js` + `test` |
| `task quality:fix` | Corrections automatiques PHP + JS |

## PHP

| Commande | Outil |
|---|---|
| `task quality:php` | phpcs + phpstan + psalm |
| `task quality:php:phpcs` | PHP_CodeSniffer : PSR-12 + Slevomat (`phpcs.xml.dist`) |
| `task quality:php:phpcbf` | Correction du style PHP (alias de `quality:php:fix`) |
| `task quality:php:phpstan` | PHPStan niveau max + extensions symfony, doctrine, phpunit, strict-rules (`phpstan.dist.neon`, loaders dans `tools/phpstan/`) |
| `task quality:php:psalm` | Psalm niveau 1 + plugins Symfony et Doctrine (`psalm.xml`) |
| `task test` | PHPUnit (`phpunit.dist.xml`, tests dans `tests/<Module>/`) |

## Front (TS, Vue, SCSS)

| Commande | Outil |
|---|---|
| `task quality:js` | eslint + stylelint + prettier + typecheck + vitest |
| `task quality:js:eslint` | ESLint : TS + Vue (`eslint.config.js`) |
| `task quality:js:stylelint` | Stylelint : SCSS + `<style>` Vue, classes BEM (`.stylelintrc.json`) |
| `task quality:js:prettier` | Formatage Prettier (`.prettierrc.json`) |
| `task quality:js:typecheck` | vue-tsc (`tsconfig.json`, routes UX Router typées) |
| `task quality:js:vitest` | Tests unitaires Vitest (`vitest.config.ts`, fichiers `*.test.ts` à côté du code, jsdom, `@vue/test-utils`). En continu : `task npm -- run test:watch` |
| `task quality:js:fix` | eslint --fix, stylelint --fix, prettier --write |

Les arguments passent après `--`, par exemple `task quality:php:phpcs -- src/Common`.
