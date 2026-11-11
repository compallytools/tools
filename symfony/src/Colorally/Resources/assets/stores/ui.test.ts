import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useUiStore } from './ui';

beforeEach(() => {
    setActivePinia(createPinia());
});

describe('ui store', () => {
    it('démarre sur la synthèse, sans édition', () => {
        const ui = useUiStore();

        expect(ui.view).toBe('dashboard');
        expect(ui.editingId).toBeNull();
    });

    it('change d’écran', () => {
        const ui = useUiStore();

        ui.setView('grid');
        expect(ui.view).toBe('grid');
    });

    it('n’édite qu’une couleur à la fois', () => {
        const ui = useUiStore();

        ui.startEditing('a');
        ui.startEditing('b');
        expect(ui.editingId).toBe('b');

        ui.stopEditing();
        expect(ui.editingId).toBeNull();
    });
});
