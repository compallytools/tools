# AGENTS.md

Guide pour les agents IA (et humains) travaillant sur ce dépôt.

## Projet

Application PHP / Symfony, environnement de dev entièrement dockerisé et piloté par [Task](https://taskfile.dev).

## Structure

```
Taskfile.yml        # point d'entrée de toutes les commandes
taskfiles/          # Taskfiles inclus par domaine : docker, cli (sans préfixe), assets:*, db:*, test, quality:*, doc:*
compose.yaml        # services de dev : php (FrankenPHP), database (PostgreSQL), node (Vite), doc (Zensical serve)
.env                # ports, versions, identifiants de dev (surcharges locales : .env.local, non versionné)
docker/dev/php/     # image de dev : FrankenPHP + PHP 8.4 + Composer + CLI Symfony + Xdebug
docker/dev/node/    # image Node (serveur Vite, npm)
docker/dev/doc/     # image Zensical
docker/prod/        # images de prod (à venir)
symfony/            # code de l'application Symfony (monté dans /app du container php)
doc/                # documentation Zensical (voir doc/AGENTS.md)
```

## Règles

- **Toujours passer par `task`.** Ne jamais lancer `php`, `composer`, `bin/console` ou `symfony` sur la machine hôte : ils tournent dans le container `php`.
  - `task console -- <cmd>`, `task composer -- <cmd>`, `task symfony -- <cmd>`, `task php -- <args>`
  - Node/npm tourne dans le container `node` : `task npm -- <cmd>`.
- **Lancer `task quality` avant de rendre la main** (phpcs, phpstan, psalm, eslint, stylelint, prettier, vue-tsc, phpunit). `task quality:fix` corrige ce qui peut l’être. Sous-ensembles : `quality:php`, `quality:js`, `quality:php:psalm`, etc.
- Architecture modulaire (`symfony/src/<Module>/`) : voir `doc/docs/dev/architecture.md`.
- Skills du projet : `.claude/skills/` (voir son `README.md`). Ajouter un module : `/add-module <NomModule>`.
- Lister les tâches : `task` (ou `task --list`).
- Démarrer / arrêter l'env : `task up` / `task down`. Installer les dépendances (composer, npm, routes JS) : `task install` (clone frais, ou après un changement de `composer.lock` / `package-lock.json`).
- Une nouvelle commande récurrente → l'ajouter avec une `desc` dans le Taskfile de son domaine (`taskfiles/<domaine>.yml`), pas dans `Taskfile.yml`, qui ne fait qu'inclure. Nommage hiérarchique `<namespace>:<domaine>:<outil>` (ex. `quality:php:phpcs`). Les vars déclarées dans un Taskfile inclus sont globales : leur donner un nom propre au fichier, sinon elles écrasent celles des autres.
- Un changement d'environnement (service, port, commande) → mettre à jour `doc/docs/dev/getting-started.md`.
- Ne pas versionner de secrets ; les valeurs de `.env` sont des valeurs de dev uniquement.

## Spécifique

- Code Symfony : voir `symfony/AGENTS.md`.
- Documentation : voir `doc/AGENTS.md`.
