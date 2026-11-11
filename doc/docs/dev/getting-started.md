# Démarrage

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- [Task](https://taskfile.dev/installation/)

Rien d'autre : PHP, Composer et la CLI Symfony tournent dans le container `php`, Node/npm dans le container `node`.

## Démarrage

```bash
task up        # démarre les containers
task install   # composer install + npm install + routes JS (clone frais, ou après un changement de dépendances)
```

Sur un clone frais, le container `node` attend la fin de `task install` avant de lancer Vite. `task install` est idempotent : le relancer après un `git pull` qui modifie `composer.lock` ou `package-lock.json`.

- Modules : <http://localhost> (page de dev listant les modules, env `dev` uniquement). Chaque module a son sous-domaine, ex. <http://contrast-grid.localhost> (port `HTTP_PORT`). `*.localhost` résout vers 127.0.0.1 sous Chrome/Firefox ; ailleurs (Safari, curl) ajouter une entrée `/etc/hosts` ou utiliser `curl -H 'Host: …'`. Le host de chaque module se règle via `<MODULE>_HOST` (défaut dans `symfony/config/modules.yaml`), ex. `CONTRAST_GRID_HOST=contrast-grid.prp.tld.com` en preprod.
- Serveur Vite (assets, HMR) : <http://localhost:5173>
- Documentation : <http://localhost:8001> (live reload)
- PostgreSQL : `localhost:5432` (`app` / `app`, base `app`)

## Commandes utiles

| Commande | Description |
|---|---|
| `task up` / `task down` | Démarre / stoppe l'environnement |
| `task install` | Installe les dépendances (composer, npm) et génère les routes JS |
| `task ps`, `task logs -- php` | État et logs |
| `task sh` | Shell dans le container php |
| `task console -- <cmd>` | `bin/console` |
| `task composer -- <cmd>` | Composer |
| `task symfony -- <cmd>` | CLI Symfony |
| `task npm -- <cmd>` | npm (container node éphémère) |
| `task assets:dev` | Serveur Vite + HMR (par défaut au `task up`) |
| `task assets:watch` | Build en continu, sans serveur Vite |
| `task assets:build` | Build de prod des assets |
| `task db:diff` / `task db:migrate` | Migrations Doctrine |
| `task quality` | Toute la qualité + tests ([détails](quality.md)) |
| `task doc:logs` | Logs du serveur de doc |

Les ports et identifiants se configurent dans `.env` (surcharge locale possible dans `.env.local`).

## Xdebug

Installé mais désactivé. Pour l'activer : `XDEBUG_MODE=debug` dans `.env.local`, puis `task restart`.
