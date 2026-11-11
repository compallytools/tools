import { describe, expect, it } from 'vitest';

import {
    buildAssociations,
    compatiblePairs,
    computeDistribution,
    computeStats,
    findMostVersatile,
    percentage,
    TOP_PAIRS_LIMIT,
    topPairs,
} from './analysis';
import type { PaletteColor } from './color';
import { HIGHLIGHT_USAGE, formatRatio } from './contrast';
import { DEFAULT_PALETTE } from './defaults';

const defaults = [...DEFAULT_PALETTE];

function color(id: string, hex: string): PaletteColor {
    return { id, name: id, hex };
}

describe('buildAssociations', () => {
    it('produit n × (n-1) associations ordonnées sur la palette par défaut (72)', () => {
        const associations = buildAssociations(defaults);

        expect(associations).toHaveLength(72);
        expect(associations.every(({ text, background }) => text.id !== background.id)).toBe(true);
    });

    it('compte séparément texte/fond inversés, avec le même ratio', () => {
        const [a, b] = [color('a', '#000000'), color('b', '#FFFFFF')];
        const associations = buildAssociations([a, b]);

        expect(associations).toHaveLength(2);
        expect(associations[0]?.ratio).toBe(associations[1]?.ratio);
        expect(associations[0]?.text.id).not.toBe(associations[1]?.text.id);
    });

    it.each([[[]], [[color('a', '#000000')]]])('renvoie 0 association pour moins de 2 couleurs', (palette) => {
        expect(buildAssociations(palette)).toEqual([]);
    });

    it('exclut par id : deux couleurs de même hex restent associées (ratio 1)', () => {
        const associations = buildAssociations([color('a', '#336699'), color('b', '#336699')]);

        expect(associations).toHaveLength(2);
        expect(associations.every(({ ratio }) => ratio === 1)).toBe(true);
    });
});

describe('computeStats', () => {
    const stats = computeStats(buildAssociations(defaults));

    it('donne les compteurs cumulés des maquettes : 30 / 20 / 10 / 42', () => {
        expect(stats).toEqual({ total: 72, large: 30, aa: 20, aaa: 10, fail: 42 });
    });

    it('donne les pourcentages des maquettes', () => {
        expect(percentage(stats.large, stats.total).toFixed(1)).toBe('41.7');
        expect(percentage(stats.aa, stats.total).toFixed(1)).toBe('27.8');
        expect(percentage(stats.aaa, stats.total).toFixed(1)).toBe('13.9');
        expect(percentage(stats.fail, stats.total).toFixed(1)).toBe('58.3');
    });

    it('gère une palette vide', () => {
        expect(computeStats([])).toEqual({ total: 0, large: 0, aa: 0, aaa: 0, fail: 0 });
        expect(percentage(0, 0)).toBe(0);
    });
});

describe('computeDistribution', () => {
    it('donne la répartition exclusive des maquettes : 10 / 10 / 10 / 42', () => {
        expect(computeDistribution(buildAssociations(defaults))).toEqual({
            total: 72,
            aaa: 10,
            aa: 10,
            large: 10,
            fail: 42,
        });
    });

    it('a une somme égale au total', () => {
        const distribution = computeDistribution(buildAssociations(defaults));

        expect(distribution.aaa + distribution.aa + distribution.large + distribution.fail).toBe(distribution.total);
    });
});

describe('findMostVersatile', () => {
    it('trouve Bleu nuit : 6 partenaires, meilleur contraste avec Blanc neige (14,25:1)', () => {
        const result = findMostVersatile(defaults, HIGHLIGHT_USAGE);

        expect(result?.color.name).toBe('Bleu nuit');
        expect(result?.partners).toBe(6);
        expect(result?.best.other.name).toBe('Blanc neige');
        expect(formatRatio(result?.best.ratio ?? 0)).toBe('14,25:1');
    });

    it('renvoie null sans paire compatible', () => {
        expect(findMostVersatile([], HIGHLIGHT_USAGE)).toBeNull();
        expect(findMostVersatile([color('a', '#000000')], HIGHLIGHT_USAGE)).toBeNull();
        expect(findMostVersatile([color('a', '#336699'), color('b', '#336699')], HIGHLIGHT_USAGE)).toBeNull();
    });

    it('départage les égalités par l’ordre de la palette', () => {
        const result = findMostVersatile([color('noir', '#000000'), color('blanc', '#FFFFFF')], HIGHLIGHT_USAGE);

        expect(result?.color.id).toBe('noir');
        expect(result?.partners).toBe(1);
    });
});

describe('topPairs', () => {
    it('compte 10 paires compatibles (≥ 4,5) sur la palette par défaut, dont Orange/Blanc à 4,5005', () => {
        const pairs = compatiblePairs(defaults, HIGHLIGHT_USAGE);

        expect(pairs).toHaveLength(10);
        expect(
            pairs.some(
                ({ text, background }) => [text.name, background.name].sort().join() === 'Blanc neige,Orange sanguine',
            ),
        ).toBe(true);
    });

    it('limite à 6 paires triées par ratio décroissant, dans l’ordre des maquettes', () => {
        const pairs = topPairs(defaults, HIGHLIGHT_USAGE);

        expect(TOP_PAIRS_LIMIT).toBe(6);
        expect(pairs.map(({ ratio }) => formatRatio(ratio))).toEqual([
            '14,25:1',
            '12,42:1',
            '10,41:1',
            '8,07:1',
            '7,68:1',
            '6,70:1',
        ]);
    });

    it('place le plus sombre en fond par défaut (première carte des maquettes)', () => {
        const [first] = topPairs(defaults, HIGHLIGHT_USAGE);

        expect(first?.text.name).toBe('Blanc neige');
        expect(first?.background.name).toBe('Bleu nuit');
    });

    it('respecte une limite personnalisée et une palette vide', () => {
        expect(topPairs(defaults, HIGHLIGHT_USAGE, 2)).toHaveLength(2);
        expect(topPairs([], HIGHLIGHT_USAGE)).toEqual([]);
    });
});
