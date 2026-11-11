import { describe, expect, it } from 'vitest';

import { classify, contrastRatio, formatRatio, HIGHLIGHT_USAGE, meetsUsage, THRESHOLDS, USAGES } from './contrast';

describe('contrastRatio', () => {
    it('vaut 21 pour noir sur blanc', () => {
        expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 10);
    });

    it('vaut 1 pour deux couleurs identiques', () => {
        expect(contrastRatio('#3028F4', '#3028F4')).toBeCloseTo(1, 10);
    });

    it('vaut environ 4,54 pour #767676 sur blanc', () => {
        expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
    });

    it('est symétrique', () => {
        expect(contrastRatio('#121289', '#FFFFFF')).toBe(contrastRatio('#FFFFFF', '#121289'));
    });

    it('ne rejoint pas 4,5 par arrondi : #777777 sur blanc reste sous AA', () => {
        // ≈ 4,48 : affiché « 4,48:1 », verdict « grand texte »
        expect(classify(contrastRatio('#777777', '#FFFFFF'))).toBe('large');
    });
});

describe('classify', () => {
    it.each([
        [21, 'aaa'],
        [7, 'aaa'],
        [6.999, 'aa'],
        [4.5, 'aa'],
        [4.499, 'large'],
        [3, 'large'],
        [2.999, 'fail'],
        [1, 'fail'],
    ] as const)('ratio %s → %s', (ratio, level) => {
        expect(classify(ratio)).toBe(level);
    });
});

describe('meetsUsage', () => {
    it('compare au seuil de l’usage, bornes incluses', () => {
        const [large, text, enhanced] = USAGES;

        expect(meetsUsage(3, large!)).toBe(true);
        expect(meetsUsage(2.999, large!)).toBe(false);
        expect(meetsUsage(4.5, text!)).toBe(true);
        expect(meetsUsage(4.499, text!)).toBe(false);
        expect(meetsUsage(7, enhanced!)).toBe(true);
        expect(meetsUsage(6.999, enhanced!)).toBe(false);
    });

    it('met en avant le texte courant (AA)', () => {
        expect(HIGHLIGHT_USAGE.threshold).toBe(THRESHOLDS.aa);
    });
});

describe('formatRatio', () => {
    it.each([
        [14.252064785333573, '14,25:1'],
        [21, '21,00:1'],
        [1, '1,00:1'],
        [4.5004721914135635, '4,50:1'],
    ])('formate %s en %s', (ratio, expected) => {
        // Intl insère parfois des espaces insécables : on ne les attend pas sous 1000, mais on normalise par prudence.
        expect(formatRatio(ratio).replace(/\s/g, ' ')).toBe(expected);
    });
});
