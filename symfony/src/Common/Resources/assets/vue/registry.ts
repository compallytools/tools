import { type Component, defineAsyncComponent } from 'vue';

/*
 * Registre des composants Vue « controllers » de tous les modules (Symfony UX Vue).
 *
 * Chaque fichier src/<Module>/Resources/assets/vue/controllers/<Chemin>.vue est exposé à Twig sous
 * le nom stable "<Module>/<Chemin>" :
 *   <div {{ vue_component('ContrastGrid/ContrastGrid', {...}) }}></div>
 *
 * On remplace registerVueControllerComponents() de @symfony/ux-vue, dont les noms dépendent du
 * préfixe commun des chemins (et changeraient donc à chaque ajout de module).
 * Chargement à la demande : chaque composant est un chunk séparé.
 */
const loaders = import.meta.glob<{ default: Component }>('/src/*/Resources/assets/vue/controllers/**/*.vue');

const PATH_PATTERN = /^\/src\/([^/]+)\/Resources\/assets\/vue\/controllers\/(.+)\.vue$/;

function buildRegistry(): Map<string, () => Promise<{ default: Component }>> {
    const registry = new Map<string, () => Promise<{ default: Component }>>();
    for (const [path, loader] of Object.entries(loaders)) {
        const match = PATH_PATTERN.exec(path);
        if (match !== null) {
            registry.set(`${match[1]}/${match[2]}`, loader);
        }
    }

    return registry;
}

export function registerModuleVueComponents(): void {
    const registry = buildRegistry();
    const resolved = new Map<string, Component>();

    window.resolveVueComponent = (name: string): Component => {
        const cached = resolved.get(name);
        if (cached !== undefined) {
            return cached;
        }
        const loader = registry.get(name);
        if (loader === undefined) {
            throw new Error(
                `Vue controller "${name}" does not exist. Possible values: ${[...registry.keys()].join(', ')}`,
            );
        }
        const component = defineAsyncComponent(async () => (await loader()).default);
        resolved.set(name, component);

        return component;
    };
}
