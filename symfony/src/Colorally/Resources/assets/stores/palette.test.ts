import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { MAX_COLORS } from '../domain/palette-io';
import { usePaletteStore } from './palette';

beforeEach(() => {
    setActivePinia(createPinia());
});

describe('palette store', () => {
    it('démarre avec la palette par défaut', () => {
        const palette = usePaletteStore();

        expect(palette.count).toBe(9);
        expect(palette.isDefault).toBe(true);
        expect(palette.isFull).toBe(false);
        expect(palette.colors[0]?.id).toBe('default-1');
    });

    it('ajoute une couleur avec nom par défaut et id unique', () => {
        const palette = usePaletteStore();
        const first = palette.add({ hex: '#123456' });
        const second = palette.add({ name: 'Perso', hex: 'abcdef' });

        expect(first).toMatchObject({ ok: true });
        expect(second).toMatchObject({ ok: true });
        expect(first.ok && second.ok && first.id !== second.id).toBe(true);
        expect(palette.count).toBe(11);
        expect(palette.colors.at(-2)?.name).toBe('Couleur 10');
        expect(palette.colors.at(-1)).toMatchObject({ name: 'Perso', hex: '#ABCDEF' });
        expect(palette.isDefault).toBe(false);
    });

    it('refuse un hex invalide, un doublon et le dépassement de limite', () => {
        const palette = usePaletteStore();

        expect(palette.add({ hex: 'nope' })).toEqual({ ok: false, error: 'invalid-hex' });
        expect(palette.add({ hex: '#d54414' })).toEqual({ ok: false, error: 'duplicate' });

        palette.replaceAll(
            Array.from({ length: MAX_COLORS }, (_, index) => ({ hex: `#0000${index.toString(16).padStart(2, '0')}` })),
        );
        expect(palette.isFull).toBe(true);
        expect(palette.add({ hex: '#FFFFF0' })).toEqual({ ok: false, error: 'limit' });
        expect(palette.count).toBe(MAX_COLORS);
    });

    it('modifie une couleur, en autorisant de garder son propre hex', () => {
        const palette = usePaletteStore();
        const id = 'default-2';

        expect(palette.update(id, { name: 'Indigo' })).toEqual({ ok: true, id });
        expect(palette.update(id, { hex: '#3028F4', name: 'Indigo' })).toEqual({ ok: true, id });
        expect(palette.update(id, { hex: '#000000' })).toEqual({ ok: true, id });
        expect(palette.colors[1]).toEqual({ id, name: 'Indigo', hex: '#000000' });
    });

    it('refuse une modification invalide sans toucher à la couleur', () => {
        const palette = usePaletteStore();
        const before = { ...palette.colors[1] };

        expect(palette.update('default-2', { hex: '#D54414' })).toEqual({ ok: false, error: 'duplicate' });
        expect(palette.update('default-2', { hex: 'xx' })).toEqual({ ok: false, error: 'invalid-hex' });
        expect(palette.update('inconnu', { name: 'x' })).toEqual({ ok: false, error: 'not-found' });
        expect(palette.colors[1]).toEqual(before);
    });

    it('supprime et réinitialise', () => {
        const palette = usePaletteStore();

        expect(palette.remove('default-1')).toBe(true);
        expect(palette.remove('default-1')).toBe(false);
        expect(palette.count).toBe(8);

        palette.reset();
        expect(palette.count).toBe(9);
        expect(palette.isDefault).toBe(true);
    });

    it('importe en remplaçant ou en ajoutant, et rapporte les rejets', () => {
        const palette = usePaletteStore();

        const appended = palette.importEntries([{ hex: '#111111' }, { hex: '#D54414' }, { hex: 'zz' }], 'append');
        expect(appended.added).toBe(1);
        expect(appended.rejected.map(({ reason }) => reason)).toEqual(['duplicate', 'invalid-hex']);
        expect(palette.count).toBe(10);

        const replaced = palette.importEntries([{ name: 'Seule', hex: '#222222' }], 'replace');
        expect(replaced.added).toBe(1);
        expect(palette.colors).toHaveLength(1);
        expect(palette.colors[0]).toMatchObject({ name: 'Seule', hex: '#222222' });
    });
});
