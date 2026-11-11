import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick } from 'vue';
import type { EffectScope } from 'vue';

import { usePaletteStore } from '../stores/palette';
import { useUiStore } from '../stores/ui';
import { useUrlState } from './useUrlState';

let scope: EffectScope;

function mountUrlState(url: string): void {
    window.history.replaceState(null, '', url);
    setActivePinia(createPinia());
    scope = effectScope();
    scope.run(() => useUrlState());
}

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    scope.stop();
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
});

describe('useUrlState', () => {
    it('hydrate la palette et l’écran depuis l’URL', () => {
        mountUrlState('/?p=FF0000~Rouge,0000FF~Bleu&view=grid');

        expect(usePaletteStore().colors.map(({ name }) => name)).toEqual(['Rouge', 'Bleu']);
        expect(useUiStore().view).toBe('grid');
    });

    it('retombe sur la palette par défaut sans paramètre', () => {
        mountUrlState('/');

        expect(usePaletteStore().isDefault).toBe(true);
        expect(useUiStore().view).toBe('dashboard');
        expect(window.location.search).toBe('');
    });

    it('écrit la palette dans l’URL avec debounce, sans créer d’entrée d’historique', async () => {
        mountUrlState('/');
        const length = window.history.length;

        usePaletteStore().add({ name: 'Rouge', hex: '#FF0000' });
        await nextTick();
        expect(window.location.search).toBe('');

        vi.advanceTimersByTime(249);
        expect(window.location.search).toBe('');

        vi.advanceTimersByTime(1);
        expect(window.location.search).toContain('p=D54414~Orange%20sanguine');
        expect(window.location.search).toContain('FF0000~Rouge');
        expect(window.history.length).toBe(length);
    });

    it('regroupe plusieurs modifications rapprochées en une seule écriture', async () => {
        mountUrlState('/');
        const replaceState = vi.spyOn(window.history, 'replaceState');
        const palette = usePaletteStore();

        palette.add({ hex: '#111111' });
        await nextTick();
        vi.advanceTimersByTime(100);
        palette.add({ hex: '#222222' });
        await nextTick();
        vi.advanceTimersByTime(250);

        expect(replaceState).toHaveBeenCalledTimes(1);
        expect(window.location.search).toContain('222222');
        replaceState.mockRestore();
    });

    it('pousse une entrée d’historique au changement d’écran, avec la palette à jour', async () => {
        mountUrlState('/');
        const length = window.history.length;

        usePaletteStore().importEntries([{ name: 'Rouge', hex: '#FF0000' }], 'replace');
        await nextTick();
        useUiStore().setView('grid');

        expect(window.location.search).toBe('?p=FF0000~Rouge&view=grid');
        expect(window.history.length).toBe(length + 1);

        // Le debounce de la palette a été annulé : pas d'écriture tardive.
        vi.advanceTimersByTime(1000);
        expect(window.history.length).toBe(length + 1);
    });

    it('au retour arrière, restaure l’écran mais conserve la palette, sans boucle', async () => {
        mountUrlState('/?view=grid');
        const palette = usePaletteStore();
        const ui = useUiStore();

        palette.importEntries([{ name: 'Rouge', hex: '#FF0000' }], 'replace');
        await nextTick();
        const length = window.history.length;

        // Simule Précédent : le navigateur remet l'URL de l'entrée précédente puis émet popstate.
        window.history.replaceState(null, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));

        expect(ui.view).toBe('dashboard');
        expect(palette.colors.map(({ name }) => name)).toEqual(['Rouge']);
        expect(window.location.search).toBe('?p=FF0000~Rouge');
        expect(window.history.length).toBe(length);
    });

    it('se nettoie à l’arrêt du scope', async () => {
        mountUrlState('/');
        const palette = usePaletteStore();

        palette.add({ hex: '#111111' });
        await nextTick();
        scope.stop();
        vi.advanceTimersByTime(1000);
        expect(window.location.search).toBe('');

        useUiStore().setView('grid');
        expect(window.location.search).toBe('');

        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(window.location.search).toBe('');
    });
});
