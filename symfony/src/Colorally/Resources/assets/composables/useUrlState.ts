import { onScopeDispose, watch } from 'vue';

import { buildQuery, parseQuery } from '../domain/palette-io';
import { usePaletteStore } from '../stores/palette';
import { useUiStore } from '../stores/ui';

/**
 * Synchronise la palette et l'écran avec l'URL (aucune persistance ailleurs).
 * À appeler dans le setup du composant racine : hydratation synchrone, donc pas de flash.
 */
export function useUrlState({ debounceMs = 250 }: { debounceMs?: number } = {}): void {
    const palette = usePaletteStore();
    const ui = useUiStore();

    const parsed = parseQuery(window.location.search);
    if (parsed.entries === null) {
        palette.reset();
    } else {
        palette.replaceAll(parsed.entries);
    }
    ui.setView(parsed.view);

    const currentUrl = (): string =>
        `${window.location.pathname}${buildQuery({ colors: palette.colors, view: ui.view })}${window.location.hash}`;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const cancelPending = (): void => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    };

    // Palette → replaceState, débouncé.
    watch(
        () => palette.colors,
        () => {
            cancelPending();
            timer = setTimeout(() => {
                timer = null;
                window.history.replaceState(null, '', currentUrl());
            }, debounceMs);
        },
        { deep: true },
    );

    // Écran → pushState, immédiat (sauf lors d'un retour arrière, voir onPopState).
    let restoring = false;
    watch(
        () => ui.view,
        () => {
            if (!restoring) {
                cancelPending();
                window.history.pushState(null, '', currentUrl());
            }
        },
        { flush: 'sync' },
    );

    // Précédent/Suivant : on restaure l'écran, pas la palette (sinon on annulerait ses modifications).
    const onPopState = (): void => {
        restoring = true;
        ui.setView(parseQuery(window.location.search).view);
        restoring = false;
        cancelPending();
        window.history.replaceState(null, '', currentUrl());
    };
    window.addEventListener('popstate', onPopState);

    onScopeDispose(() => {
        window.removeEventListener('popstate', onPopState);
        cancelPending();
    });
}
