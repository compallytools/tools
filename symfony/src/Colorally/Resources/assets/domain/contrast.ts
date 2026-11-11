import { relativeLuminance } from './color';

/** Seuils WCAG 2.2 : source unique, ne jamais dupliquer ces littéraux. */
export const THRESHOLDS = { large: 3, aa: 4.5, aaa: 7 } as const;

export type Level = 'aaa' | 'aa' | 'large' | 'fail';

export type Usage = {
    id: 'large' | 'text' | 'enhanced';
    label: string;
    threshold: number;
};

export const USAGES: readonly Usage[] = [
    { id: 'large', label: 'Grand texte', threshold: THRESHOLDS.large },
    { id: 'text', label: 'Texte courant', threshold: THRESHOLDS.aa },
    { id: 'enhanced', label: 'Contraste renforcé', threshold: THRESHOLDS.aaa },
];

/**
 * Usage mis en avant (carte accentuée, couleur polyvalente, meilleures paires, cellules compatibles).
 * Un futur sélecteur d'usage remplacera cette constante par un état.
 */
export const HIGHLIGHT_USAGE: Usage = { id: 'text', label: 'Texte courant', threshold: THRESHOLDS.aa };

/** Ratio de contraste WCAG (symétrique), jamais arrondi. */
export function contrastRatio(hexA: string, hexB: string): number {
    const luminanceA = relativeLuminance(hexA);
    const luminanceB = relativeLuminance(hexB);
    const lighter = Math.max(luminanceA, luminanceB);
    const darker = Math.min(luminanceA, luminanceB);

    return (lighter + 0.05) / (darker + 0.05);
}

/** Niveau exclusif, évalué sur le ratio brut. */
export function classify(ratio: number): Level {
    if (ratio >= THRESHOLDS.aaa) {
        return 'aaa';
    }
    if (ratio >= THRESHOLDS.aa) {
        return 'aa';
    }
    if (ratio >= THRESHOLDS.large) {
        return 'large';
    }

    return 'fail';
}

export function meetsUsage(ratio: number, usage: Usage): boolean {
    return ratio >= usage.threshold;
}

const ratioFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Affichage uniquement (arrondi à 2 décimales) : `14,25:1`. Les verdicts utilisent le ratio brut. */
export function formatRatio(ratio: number): string {
    return `${ratioFormatter.format(ratio)}:1`;
}
