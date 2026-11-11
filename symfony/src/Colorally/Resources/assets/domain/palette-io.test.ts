import { describe, expect, it } from 'vitest';

import type { PaletteColor } from './color';
import { DEFAULT_PALETTE } from './defaults';
import {
    buildQuery,
    defaultName,
    isDuplicateHex,
    isValidHex,
    isValidName,
    MAX_COLORS,
    NAME_MAX_LENGTH,
    parsePastedList,
    parseQuery,
    sanitizeEntries,
    serializePalette,
} from './palette-io';

const defaultEntries = DEFAULT_PALETTE.map(({ name, hex }) => ({ name, hex }));

function colors(count: number): PaletteColor[] {
    return Array.from({ length: count }, (_, index) => ({
        id: `c${index}`,
        name: `Couleur ${index + 1}`,
        hex: `#${(index + 1).toString(16).padStart(6, '0').toUpperCase()}`,
    }));
}

describe('validateurs', () => {
    it('valide hex et nom', () => {
        expect(isValidHex('#abc')).toBe(true);
        expect(isValidHex('nope')).toBe(false);
        expect(isValidName('a'.repeat(NAME_MAX_LENGTH))).toBe(true);
        expect(isValidName('a'.repeat(NAME_MAX_LENGTH + 1))).toBe(false);
    });

    it('détecte un doublon d’hex en excluant la couleur éditée', () => {
        const existing = colors(2);
        const [first] = existing;

        expect(isDuplicateHex('#000001', existing)).toBe(true);
        expect(isDuplicateHex('000001', existing)).toBe(true);
        expect(isDuplicateHex('#000001', existing, first?.id)).toBe(false);
        expect(isDuplicateHex('zzz', existing)).toBe(false);
    });

    it('trouve le premier nom par défaut libre', () => {
        expect(defaultName([])).toBe('Couleur 1');
        expect(defaultName(['Rouge'])).toBe('Couleur 2');
        expect(defaultName(['Couleur 2'])).toBe('Couleur 3');
        expect(defaultName(['Couleur 2', 'Couleur 3'])).toBe('Couleur 4');
    });
});

describe('sanitizeEntries', () => {
    it('normalise, nomme par défaut et tronque', () => {
        const { accepted, rejected } = sanitizeEntries([
            { hex: 'abc' },
            { name: '  Rouge  ', hex: '#ff0000' },
            { name: 'x'.repeat(100), hex: '#00ff00' },
        ]);

        expect(rejected).toEqual([]);
        expect(accepted[0]).toEqual({ name: 'Couleur 1', hex: '#AABBCC' });
        expect(accepted[1]).toEqual({ name: 'Rouge', hex: '#FF0000' });
        expect(accepted[2]?.name).toHaveLength(NAME_MAX_LENGTH);
    });

    it('rejette hex invalide et doublons (dans le lot et dans l’existant)', () => {
        const { accepted, rejected } = sanitizeEntries(
            [{ hex: '#000001' }, { hex: 'zz' }, { hex: '#111111' }, { hex: '111111' }],
            { existing: colors(1) },
        );

        expect(accepted.map(({ hex }) => hex)).toEqual(['#111111']);
        expect(rejected).toEqual([
            { index: 0, reason: 'duplicate' },
            { index: 1, reason: 'invalid-hex' },
            { index: 3, reason: 'duplicate' },
        ]);
    });

    it(`rejette au-delà de ${MAX_COLORS} couleurs`, () => {
        const { accepted, rejected } = sanitizeEntries([{ hex: '#ABCDE0' }, { hex: '#ABCDE1' }, { hex: '#ABCDE2' }], {
            existing: colors(MAX_COLORS - 1),
        });

        expect(accepted).toHaveLength(1);
        expect(rejected).toEqual([
            { index: 1, reason: 'limit' },
            { index: 2, reason: 'limit' },
        ]);
    });
});

describe('parsePastedList', () => {
    it.each([
        ['Orange sanguine #D54414', { name: 'Orange sanguine', hex: '#D54414' }],
        ['Orange sanguine: #D54414', { name: 'Orange sanguine', hex: '#D54414' }],
        ['Orange sanguine, #D54414', { name: 'Orange sanguine', hex: '#D54414' }],
        ['Orange sanguine - #d54414', { name: 'Orange sanguine', hex: '#d54414' }],
        ['#D54414 Orange sanguine', { name: 'Orange sanguine', hex: '#D54414' }],
        ['#D54414', { hex: '#D54414' }],
        ['D54414', { hex: 'D54414' }],
        ['f0a', { hex: 'f0a' }],
        ['Rouge #f00', { name: 'Rouge', hex: '#f00' }],
    ])('lit « %s »', (line, expected) => {
        expect(parsePastedList(line)).toEqual({ entries: [expected], errors: [] });
    });

    it('lit plusieurs lignes en ignorant les lignes vides', () => {
        const { entries, errors } = parsePastedList('Rouge #FF0000\r\n\r\n  \nBleu #0000FF\n');

        expect(entries.map(({ hex }) => hex)).toEqual(['#FF0000', '#0000FF']);
        expect(errors).toEqual([]);
    });

    it('lit plusieurs entrées séparées par des virgules ou points-virgules', () => {
        expect(parsePastedList('#111111, #222222; 333333').entries.map(({ hex }) => hex)).toEqual([
            '#111111',
            '#222222',
            '333333',
        ]);
        expect(parsePastedList('A #111111, B #222222').entries).toEqual([
            { name: 'A', hex: '#111111' },
            { name: 'B', hex: '#222222' },
        ]);
    });

    it('exige le # quand un nom est présent : « Decade » seul est un hex nu, « Bleu Decade » est une erreur', () => {
        expect(parsePastedList('Decade')).toEqual({ entries: [{ hex: 'Decade' }], errors: [] });
        expect(parsePastedList('Bleu Decade')).toEqual({ entries: [], errors: [{ line: 1, text: 'Bleu Decade' }] });
        expect(parsePastedList('Bleu D54414').errors).toHaveLength(1);
    });

    it('numérote les lignes en erreur et garde les lignes valides', () => {
        const { entries, errors } = parsePastedList('Rouge #FF0000\nn’importe quoi\n#12345\nBleu #0000FF');

        expect(entries).toHaveLength(2);
        expect(errors).toEqual([
            { line: 2, text: 'n’importe quoi' },
            { line: 3, text: '#12345' },
        ]);
    });
});

describe('URL', () => {
    it('est vide pour la palette et l’écran par défaut', () => {
        expect(buildQuery({ colors: defaultEntries, view: 'dashboard' })).toBe('');
    });

    it('n’écrit que ce qui diffère du défaut', () => {
        expect(buildQuery({ colors: defaultEntries, view: 'grid' })).toBe('?view=grid');
        expect(buildQuery({ colors: [{ name: 'Rouge', hex: '#FF0000' }], view: 'dashboard' })).toBe('?p=FF0000~Rouge');
        expect(buildQuery({ colors: [], view: 'dashboard' })).toBe('?p=');
    });

    it('encode le format HEX~Nom en échappant espaces, accents, virgules et tildes', () => {
        expect(serializePalette([{ name: 'Orange sanguine', hex: '#D54414' }])).toBe('D54414~Orange%20sanguine');
        expect(serializePalette([{ name: 'Bleu électrique', hex: '#3028F4' }])).toBe('3028F4~Bleu%20%C3%A9lectrique');
        expect(serializePalette([{ name: 'a,b~c', hex: '#000000' }])).toBe('000000~a%2Cb%7Ec');
    });

    it('fait l’aller-retour palette + écran (accents, virgule et tilde dans un nom)', () => {
        const palette = [
            { name: 'Bleu électrique', hex: '#3028F4' },
            { name: 'a,b~c d', hex: '#000000' },
        ];

        expect(parseQuery(buildQuery({ colors: palette, view: 'grid' }))).toEqual({ entries: palette, view: 'grid' });
    });

    it('lit l’exemple de la spec', () => {
        expect(parseQuery('?p=D54414~Orange%20sanguine,3028F4~Bleu%20%C3%A9lectrique&view=grid')).toEqual({
            entries: [
                { name: 'Orange sanguine', hex: '#D54414' },
                { name: 'Bleu électrique', hex: '#3028F4' },
            ],
            view: 'grid',
        });
    });

    it('renvoie la palette par défaut (null) sans p, ou sans entrée valide', () => {
        expect(parseQuery('')).toEqual({ entries: null, view: 'dashboard' });
        expect(parseQuery('?view=grid').entries).toBeNull();
        expect(parseQuery('?p=zzz~Nope,12~Court').entries).toBeNull();
    });

    it('traite p= explicite et vide comme une palette vide', () => {
        expect(parseQuery('?p=').entries).toEqual([]);
    });

    it('ignore silencieusement les entrées invalides, les doublons et l’excédent', () => {
        expect(parseQuery('?p=FF0000~Rouge,zzz~Nope,ff0000~Doublon,00FF00').entries).toEqual([
            { name: 'Rouge', hex: '#FF0000' },
            { name: 'Couleur 2', hex: '#00FF00' },
        ]);

        const many = Array.from({ length: 25 }, (_, index) => (index + 1).toString(16).padStart(6, '0')).join(',');
        expect(parseQuery(`?p=${many}`).entries).toHaveLength(MAX_COLORS);
    });

    it('accepte + comme espace et tolère un nom mal encodé', () => {
        expect(parseQuery('?p=FF0000~Rouge+vif').entries).toEqual([{ name: 'Rouge vif', hex: '#FF0000' }]);
        expect(parseQuery('?p=FF0000~%E0%A4%A').entries).toEqual([{ name: 'Couleur 1', hex: '#FF0000' }]);
    });

    it('retombe sur dashboard pour un écran inconnu', () => {
        expect(parseQuery('?view=nimportequoi').view).toBe('dashboard');
    });
});
