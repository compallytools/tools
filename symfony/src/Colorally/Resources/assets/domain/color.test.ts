import { describe, expect, it } from 'vitest';

import { parseHex, relativeLuminance } from './color';

describe('parseHex', () => {
    it.each([
        ['#d54414', '#D54414'],
        ['D54414', '#D54414'],
        ['  #d54414  ', '#D54414'],
        ['#abc', '#AABBCC'],
        ['f0a', '#FF00AA'],
    ])('normalise %s en %s', (input, expected) => {
        expect(parseHex(input)).toBe(expected);
    });

    it.each(['', '#', '#12', '#12345', '#1234567', 'GGGGGG', '#12 456', 'rgb(0,0,0)'])('refuse "%s"', (input) => {
        expect(parseHex(input)).toBeNull();
    });
});

describe('relativeLuminance', () => {
    it('vaut 0 pour le noir et 1 pour le blanc', () => {
        expect(relativeLuminance('#000000')).toBe(0);
        expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 10);
    });

    it('applique les coefficients par canal', () => {
        expect(relativeLuminance('#FF0000')).toBeCloseTo(0.2126, 4);
        expect(relativeLuminance('#00FF00')).toBeCloseTo(0.7152, 4);
        expect(relativeLuminance('#0000FF')).toBeCloseTo(0.0722, 4);
    });
});
