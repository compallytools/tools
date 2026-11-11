# Skills du projet

Skills Claude Code versionnés avec le dépôt, pour automatiser les tâches de développement récurrentes. Ils s'appellent par `/<nom>` ou se déclenchent d'après leur `description`.

| Skill | Rôle |
|---|---|
| [`add-module`](add-module/SKILL.md) | Ajoute un module vierge (`/add-module <NomModule>`) |

## Conventions

- Un dossier par skill : `.claude/skills/<nom>/SKILL.md`, avec un sous-dossier `templates/` pour les gabarits de fichiers (extension `.tpl`, placeholders `__MODULE__`, `__snake__`…).
- Instructions en français, comme le reste du projet.
- `description` précise **quand** déclencher le skill ; `argument-hint` documente les arguments.
- Le skill renvoie vers la documentation (`doc/docs/dev/`) au lieu de la dupliquer, et la met à jour si le processus change.
- Tout passe par `task` (jamais `php`, `composer`, `npm` sur l'hôte) et se termine par `task quality`.
- Pas de commit sans demande explicite.
