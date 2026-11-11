# Architecture

## Modules

Le code Symfony (`symfony/`) est découpé en **modules** dans `src/<Module>/`. Tout ce qui appartient à un module (PHP, templates, assets) vit dans son dossier.

| Module | Rôle |
|---|---|
| `Common` | Layout, composants partagés, entrée JS principale (seule route : la page de dev `localhost` listant les modules, env `dev` uniquement) |
| `Demo` | Module de démonstration (host `demo.localhost`) |
| `ContrastGrid` | Outil « Contrast Grid » |

```
src/<Module>/
├── Controller/                  # pages : #[Route] (préfixe d'URL + de nom par module)
├── ApiResource/                 # API Platform : ressources DTO (#[ApiResource])
├── State/                       # API Platform : providers / processors
├── Entity/  Repository/         # Doctrine (mapping par module)
├── Twig/Components/             # Twig Components PHP
└── Resources/
    ├── templates/               # namespace Twig @<Module>
    │   └── components/          # templates des Twig Components
    └── assets/
        ├── <entry>.ts           # entrée Vite du module
        ├── styles/*.scss
        └── vue/controllers/*.vue  # composants Vue montés depuis Twig
```

## Conventions par brique

| Brique | Convention | Configuration |
|---|---|---|
| Routes | host `<MODULE_SNAKE_UPPER>_HOST` (variable d'env, un `/` propre par module), nom `<module_snake>_…` | `config/routes.yaml` |
| Doctrine | Entités `App\<Module>\Entity`, migrations globales `migrations/` | `config/packages/doctrine.yaml` |
| Twig | `@<Module>/chemin.html.twig`, layout `@Common/base.html.twig` | `config/packages/twig.yaml` |
| Twig Components | `<twig:Card>` (Common), `<twig:ContrastGrid:Nom>` (autres modules) ; anonymes dans `@Common/components/` | `config/packages/twig_component.yaml` |
| Vue (Symfony UX Vue) | `vue_component('<Module>/<Nom>', props)` ; chargement lazy, un chunk par composant | `src/Common/Resources/assets/vue/registry.ts` |
| API (API Platform) | `/api/<module-kebab>/…`, opérations nommées `<module_snake>_api_<action>` | `config/packages/api_platform.yaml` |
| Routes JS (UX Router) | Routes `<module>_api_*` exposées ; `import { path } from '@router'` (typé) | `config/packages/ux_router.yaml` |
| Assets | Une entrée Vite par module ; `reprise_entry_script_tags('<entrée>')` | `vite.config.ts` |
| Alias TS/SCSS | `@common/…`, `@contrast-grid/…`, `@router` | `vite.config.ts` + `tsconfig.json` |

## Assets : Symfony Reprise + Vite

Trois modes **exclusifs**, car ils écrivent tous `public/build/entrypoints.json` :

| Commande | Mode | Service `node` |
|---|---|---|
| `task assets:dev` | Serveur Vite + HMR (`http://localhost:5173`). Mode par défaut de `task up` | démarré |
| `task assets:watch` | `vite build --watch` : fichiers dans `public/build`, rebuild à chaque modification, sans HMR | arrêté |
| `task assets:build` | Build de production (hashé, minifié) dans `public/build` | arrêté |

Après un `watch` ou un `build`, revenir au mode dev avec `task assets:dev` (ou `task up`).
`task npm` et `task quality:js` tournent dans un container éphémère et marchent dans les trois modes.
### Charte graphique

Charte de <https://chloecorfmat.fr/> (`src/Common/Resources/assets/`) :

| Fichier | Rôle |
|---|---|
| `styles/_variables.scss` | Couleurs de marque (`$color-midnight-blue`…), map `$palette`, alias sémantiques (`$color-text`, `$color-heading-primary`…), fonts (`$font-heading`, `$font-body`), tailles |
| `styles/_root.scss` | Palette exposée en custom properties `--color-<nom>` (composants Vue, JS) |
| `styles/_fonts.scss` + `fonts/` | `@font-face` des trois polices `.woff2` (hashées par Vite) |

Dans un module : `@use '@common/styles/variables' as *;`, puis les variables. Jamais de couleur en dur.

- Stimulus : `assets/controllers.json` (géré par Flex) et contrôleurs locaux dans `src/Common/Resources/assets/controllers/`.

## API : API Platform + session PHP

L'API (`/api`) sert **uniquement le front de l'application**. Elle est authentifiée par la **session PHP** (cookie), comme les pages Twig.

- Pas de JWT, d'OAuth ni de CORS : l'API est appelée depuis la même origine. Un seul firewall `main`, stateful (`config/packages/security.yaml`), et `api_platform.defaults.stateless: false`.
- Cookie de session `SameSite=lax`, `HttpOnly` et `Secure` en HTTPS (`config/packages/framework.yaml`). L'API n'accepte que des corps JSON (`application/ld+json`, `application/json` et `application/merge-patch+json` pour PATCH), ce qui empêche les requêtes cross-site par formulaire. Pas de jeton CSRF à gérer côté front.
- Ressources :
    - DTO + provider/processor dans `src/<Module>/ApiResource` et `src/<Module>/State`
    - ou entités Doctrine annotées `#[ApiResource]` dans `src/<Module>/Entity`
- Nommer chaque opération `<module>_api_<action>` (ex. `new Get(uriTemplate: '/contrast-grid/ping', name: 'contrast_grid_api_ping')`) pour qu'UX Router l'expose au JS.
- Front : `apiFetch(path('contrast_grid_api_ping'))` (`src/Common/Resources/assets/api/client.ts`). Il envoie JSON-LD par défaut (surchargeable via `headers`, sans effet sur les corps non JSON comme `FormData`) et le cookie de session, et lève une `ApiError` en cas d'erreur.
- Documentation OpenAPI : <http://localhost/api/docs> en dev, désactivée en prod.

## Créer un module

1. Dossiers `src/<Module>/{Controller,ApiResource,State,Entity,Repository,Twig/Components,Resources/{templates,assets}}`.
2. `config/routes.yaml` : import `../src/<Module>/Controller/` avec `host: '%<module_snake>.host%'` et `name_prefix` ; déclarer le module et son host par défaut dans `symfony/config/modules.yaml` (surcharge par environnement : variable `<MODULE>_HOST`, cache à réchauffer).
3. `config/packages/api_platform.yaml` : ajouter `src/<Module>/ApiResource` et `src/<Module>/Entity` aux `mapping.paths` ; `config/packages/ux_router.yaml` : ajouter `<module>_api_*`.
4. `config/packages/doctrine.yaml` : mapping `<Module>`.
5. `config/packages/twig.yaml` : path `src/<Module>/Resources/templates: <Module>`.
6. `config/packages/twig_component.yaml` : `App\<Module>\Twig\Components\` avec `name_prefix`.
7. `vite.config.ts` (entrée + alias) et `tsconfig.json` (alias).
8. `tests/<Module>/` pour les tests.

Les ressources API Platform d'un module (`App\<Module>\…`) héritent implicitement du host du module (`ModuleHostResourceMetadataCollectionFactory`) : l'API n'est servie que sur le host du module.
