import { defineStore } from 'pinia';
import { computed } from 'vue';

import {
    buildAssociations,
    compatiblePairs,
    computeDistribution,
    computeStats,
    findMostVersatile,
    topPairs,
} from '../domain/analysis';
import { HIGHLIGHT_USAGE } from '../domain/contrast';
import { usePaletteStore } from './palette';

/** Getters dérivés de la palette : aucune logique ici, tout vit dans domain/analysis.ts. */
export const useAnalysisStore = defineStore('analysis', () => {
    const palette = usePaletteStore();

    const associations = computed(() => buildAssociations(palette.colors));
    const stats = computed(() => computeStats(associations.value));
    const distribution = computed(() => computeDistribution(associations.value));
    const versatile = computed(() => findMostVersatile(palette.colors, HIGHLIGHT_USAGE));
    const pairs = computed(() => topPairs(palette.colors, HIGHLIGHT_USAGE));
    const compatiblePairCount = computed(() => compatiblePairs(palette.colors, HIGHLIGHT_USAGE).length);

    return { associations, stats, distribution, versatile, pairs, compatiblePairCount };
});
