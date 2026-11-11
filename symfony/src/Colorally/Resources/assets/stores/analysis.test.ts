import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAnalysisStore } from './analysis';
import { usePaletteStore } from './palette';

beforeEach(() => {
    setActivePinia(createPinia());
});

describe('analysis store', () => {
    it('dérive les chiffres des maquettes de la palette par défaut', () => {
        const analysis = useAnalysisStore();

        expect(analysis.associations).toHaveLength(72);
        expect(analysis.stats).toEqual({ total: 72, large: 30, aa: 20, aaa: 10, fail: 42 });
        expect(analysis.distribution).toEqual({ total: 72, aaa: 10, aa: 10, large: 10, fail: 42 });
        expect(analysis.versatile?.color.name).toBe('Bleu nuit');
        expect(analysis.versatile?.partners).toBe(6);
        expect(analysis.pairs).toHaveLength(6);
        expect(analysis.compatiblePairCount).toBe(10);
    });

    it('se recalcule quand la palette change', () => {
        const palette = usePaletteStore();
        const analysis = useAnalysisStore();

        palette.importEntries([{ hex: '#000000' }, { hex: '#FFFFFF' }], 'replace');

        expect(analysis.associations).toHaveLength(2);
        expect(analysis.compatiblePairCount).toBe(1);
        expect(analysis.stats.aaa).toBe(2);
    });
});
