---
name: add-module
description: Ajoute un module vierge à l'application Symfony (src/<Module>, host dédié, routes, entrée Vite, nav, test). À utiliser quand on demande de créer, ajouter ou initialiser un nouveau module.
argument-hint: <NomModule> [libellé]
---

# Ajouter un module vierge

Crée un module minimal mais complet : une page d'accueil servie sur son propre host, une entrée Vite avec sa feuille de style, un lien dans la navigation et un test. Modèle de référence : `symfony/src/Demo/` (contrôleur) et `symfony/src/ContrastGrid/` (entrée Vite).

Architecture : `doc/docs/dev/architecture.md`. Règles du projet : `AGENTS.md` et `symfony/AGENTS.md` (tout passe par `task`, jamais `php`/`composer`/`npm` sur l'hôte ; ne pas committer sauf demande).

## 1. Nom du module

Argument : `<NomModule>` en PascalCase (ex. `Facturation`, `SuiviClient`), libellé optionnel (par défaut : le nom ; pour un nom composé, proposer une version lisible, ex. « Suivi client »).

Refuser et demander un autre nom si : pas alphanumérique PascalCase, `Common`, ou déjà présent dans `symfony/src/` ou `symfony/config/modules.yaml`.

Dériver les formes (exemple `SuiviClient`) :

| Placeholder | Valeur | Usage |
|---|---|---|
| `__MODULE__` | `SuiviClient` | dossier, namespace, namespace Twig `@SuiviClient` |
| `__snake__` | `suivi_client` | clés YAML, `name_prefix`, paramètre `%suivi_client.host%`, entrée Vite, surcharge `SUIVI_CLIENT_HOST` |
| `__kebab__` | `suivi-client` | host `suivi-client.localhost`, alias `@suivi-client`, fichiers d'entrée, classe CSS |
| `__LABEL__` | `Suivi client` | titre de page, lien de navigation |

snake : `_` avant chaque majuscule interne puis minuscules ; kebab : `_` remplacé par `-`.

## 2. Créer les fichiers

Depuis `.claude/skills/add-module/templates/`, en remplaçant les placeholders :

| Gabarit | Destination |
|---|---|
| `Controller.php.tpl` | `symfony/src/__MODULE__/Controller/__MODULE__Controller.php` |
| `index.html.twig.tpl` | `symfony/src/__MODULE__/Resources/templates/index.html.twig` |
| `entry.ts.tpl` | `symfony/src/__MODULE__/Resources/assets/__kebab__.ts` |
| `styles.scss.tpl` | `symfony/src/__MODULE__/Resources/assets/styles/__kebab__.scss` |
| `ControllerTest.php.tpl` | `symfony/tests/__MODULE__/Controller/__MODULE__ControllerTest.php` |

## 3. Câbler la configuration

Lire chaque fichier avant de le modifier et ajouter à la suite des blocs existants, sans toucher aux modules déjà présents.

1. `symfony/config/modules.yaml`, ajouter :
   ```yaml
   __snake__:
       host: __kebab__.localhost
   ```
2. `symfony/config/routes.yaml`, ajouter **avant** le bloc `when@dev` :
   ```yaml
   __snake__:
       resource: ../src/__MODULE__/Controller/
       type: attribute
       host: '%__snake__.host%'
       name_prefix: __snake___
   ```
3. `symfony/config/packages/twig.yaml`, dans `twig.paths` :
   ```yaml
   '%kernel.project_dir%/src/__MODULE__/Resources/templates': __MODULE__
   ```
4. `symfony/vite.config.ts` : dans `input`, `__snake__: './src/__MODULE__/Resources/assets/__kebab__.ts',` ; dans `resolve.alias`, `'@__kebab__': fromRoot('./src/__MODULE__/Resources/assets'),`.
5. `symfony/tsconfig.json`, dans `compilerOptions.paths` : `"@__kebab__/*": ["./src/__MODULE__/Resources/assets/*"],`.
6. `symfony/src/Common/Resources/templates/base.html.twig`, dans `<nav class="main-nav">` :
   ```twig
   <a href="{{ path('__snake___index') }}">__LABEL__</a>
   ```
7. `symfony/tests/Common/Controller/DevControllerTest.php`, dans `testListsModulesInDev` :
   ```php
   self::assertSelectorExists('a[href*="__kebab__.localhost"]');
   ```
8. Documentation : une ligne dans le tableau des URLs de `README.md` (`| Module __LABEL__ | <http://__kebab__.localhost> |`), une ligne dans le tableau des modules de `doc/docs/dev/architecture.md`, et, si `getting-started.md` liste les hosts, y ajouter le module.

## 4. Vérifier

```bash
task console -- cache:warmup      # le host vient de modules.yaml
task console -- ux:router:warm-cache
task quality                      # doit passer en entier
task assets:build                 # valide l'entrée Vite, puis revenir avec : task assets:dev
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: __kebab__.localhost' http://localhost/   # 200
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: other.localhost' http://localhost/        # 404
```

Si l'environnement n'est pas démarré : `task up` puis `task install`.

## 5. Rendre la main

Résumer les fichiers créés et modifiés, l'URL du module, puis rappeler les briques **optionnelles** non créées (voir « Créer un module » dans `doc/docs/dev/architecture.md`) :
- API Platform : dossiers `ApiResource/` et `State/`, `api_platform.yaml`, `ux_router.yaml`.
- Doctrine : dossiers `Entity/` et `Repository/`, mapping dans `doctrine.yaml`.
- Twig Components : `Twig/Components/` et `twig_component.yaml`.
- Composants Vue : `Resources/assets/vue/controllers/*.vue` (découverts automatiquement).

Ne rien committer sans demande explicite.
