# Tools

Application PHP / Symfony, environnement de dev dockerisé et piloté par [Task](https://taskfile.dev).

## Installation

Prérequis : [Docker](https://docs.docker.com/get-docker/) (avec Docker Compose) et [Task](https://taskfile.dev/installation/). Rien d'autre sur la machine.

```bash
git clone <url-du-depot> tools
cd tools
task up        # construit les images et démarre les containers
task install   # installe les dépendances (composer, npm) et génère les routes JS
```

Vite démarre tout seul à la fin de `task install`. Relancer `task install` après un `git pull` qui modifie les dépendances.

Une fois terminé :

| Quoi | URL |
|---|---|
| Liste des modules (dev uniquement) | <http://localhost> |
| Module Colorally | <http://colorally.localhost> |
| Serveur Vite (assets, HMR) | <http://localhost:5173> |
| Documentation | <http://localhost:8001> |

`*.localhost` résout vers 127.0.0.1 sous Chrome et Firefox. Sous Safari ou avec curl, ajouter les entrées dans `/etc/hosts` ou passer `-H 'Host: …'`.

## Au quotidien

| Commande | Description |
|---|---|
| `task` | Liste toutes les commandes |
| `task up` / `task down` | Démarre / stoppe l'environnement |
| `task install` | Installe composer + npm (à relancer si les dépendances changent) |
| `task quality` | Qualité (PHP, JS) et tests, à lancer avant de rendre la main |
| `task console -- <cmd>` | `bin/console` |
| `task composer -- <cmd>` | Composer |
| `task npm -- <cmd>` | npm |

PHP, Composer et Node ne tournent jamais sur la machine hôte : toujours passer par `task`.

## Configuration

Ports et identifiants de dev dans `.env`. Surcharges locales dans `.env.local` (non versionné).

## Documentation

Détails (architecture modulaire, qualité, Xdebug…) dans [`doc/docs/dev/`](doc/docs/dev/getting-started.md), ou sur <http://localhost:8001> une fois l'environnement démarré. Consignes pour les agents IA : [`AGENTS.md`](AGENTS.md).
