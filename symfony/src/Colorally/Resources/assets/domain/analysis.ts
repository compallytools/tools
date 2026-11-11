import type { PaletteColor } from './color';
import { relativeLuminance } from './color';
import type { Usage } from './contrast';
import { classify, contrastRatio, meetsUsage, THRESHOLDS } from './contrast';

/** Nombre maximal de paires affichées dans « Meilleures paires ». */
export const TOP_PAIRS_LIMIT = 6;

export type Association = {
    text: PaletteColor;
    background: PaletteColor;
    ratio: number;
};

export type Stats = {
    total: number;
    /** Compteurs cumulés (≥ 7 inclus dans ≥ 4,5, inclus dans ≥ 3) : ne pas les additionner. */
    large: number;
    aa: number;
    aaa: number;
    fail: number;
};

export type Distribution = {
    total: number;
    aaa: number;
    aa: number;
    large: number;
    fail: number;
};

export type Versatile = {
    color: PaletteColor;
    partners: number;
    best: { other: PaletteColor; ratio: number };
};

/** Associations ordonnées texte/fond, mêmes couleurs exclues : n × (n-1). */
export function buildAssociations(palette: readonly PaletteColor[]): Association[] {
    const associations: Association[] = [];

    for (const background of palette) {
        for (const text of palette) {
            if (text.id !== background.id) {
                associations.push({ text, background, ratio: contrastRatio(text.hex, background.hex) });
            }
        }
    }

    return associations;
}

export function computeStats(associations: readonly Association[]): Stats {
    const count = (threshold: number): number => associations.filter(({ ratio }) => ratio >= threshold).length;

    return {
        total: associations.length,
        large: count(THRESHOLDS.large),
        aa: count(THRESHOLDS.aa),
        aaa: count(THRESHOLDS.aaa),
        fail: associations.filter(({ ratio }) => ratio < THRESHOLDS.large).length,
    };
}

/** Répartition exclusive : chaque association appartient à un seul groupe. */
export function computeDistribution(associations: readonly Association[]): Distribution {
    const distribution: Distribution = { total: associations.length, aaa: 0, aa: 0, large: 0, fail: 0 };

    for (const { ratio } of associations) {
        distribution[classify(ratio)] += 1;
    }

    return distribution;
}

/** Pourcentage (0 à 100) de `count` dans `total` ; 0 si `total` est nul. */
export function percentage(count: number, total: number): number {
    return total === 0 ? 0 : (count / total) * 100;
}

/**
 * Couleur ayant le plus de partenaires compatibles (en texte ou en fond), avec le meilleur contraste.
 * À égalité, la première de la palette l'emporte. `null` si aucune paire compatible.
 */
export function findMostVersatile(palette: readonly PaletteColor[], usage: Usage): Versatile | null {
    let winner: Versatile | null = null;

    for (const color of palette) {
        let partners = 0;
        let best: Versatile['best'] | null = null;

        for (const other of palette) {
            if (other.id === color.id) {
                continue;
            }

            const ratio = contrastRatio(color.hex, other.hex);
            if (!meetsUsage(ratio, usage)) {
                continue;
            }

            partners += 1;
            if (best === null || ratio > best.ratio) {
                best = { other, ratio };
            }
        }

        if (best !== null && (winner === null || partners > winner.partners)) {
            winner = { color, partners, best };
        }
    }

    return winner;
}

/** Paires non ordonnées compatibles, par ratio décroissant. Orientation par défaut : le plus sombre en fond (inversable par carte). */
export function compatiblePairs(palette: readonly PaletteColor[], usage: Usage): Association[] {
    const pairs: Association[] = [];

    palette.forEach((first, index) => {
        for (const second of palette.slice(index + 1)) {
            const ratio = contrastRatio(first.hex, second.hex);
            if (!meetsUsage(ratio, usage)) {
                continue;
            }

            const firstIsLighter = relativeLuminance(first.hex) > relativeLuminance(second.hex);
            pairs.push(
                firstIsLighter
                    ? { text: first, background: second, ratio }
                    : { text: second, background: first, ratio },
            );
        }
    });

    // Tri stable : à ratio égal, l'ordre de la palette est conservé.
    return pairs.sort((a, b) => b.ratio - a.ratio);
}

export function topPairs(
    palette: readonly PaletteColor[],
    usage: Usage,
    limit: number = TOP_PAIRS_LIMIT,
): Association[] {
    return compatiblePairs(palette, usage).slice(0, limit);
}
