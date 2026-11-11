import type { PaletteColor } from './color';

/** Palette par défaut (les 9 couleurs des maquettes) : des données, pas des couleurs de charte. */
export const DEFAULT_PALETTE: readonly PaletteColor[] = [
    { id: 'default-1', name: 'Orange sanguine', hex: '#D54414' },
    { id: 'default-2', name: 'Bleu électrique', hex: '#3028F4' },
    { id: 'default-3', name: 'Jaune miel', hex: '#F2BB04' },
    { id: 'default-4', name: 'Violet lavande', hex: '#B87CFF' },
    { id: 'default-5', name: 'Pêche de vigne', hex: '#FA9A64' },
    { id: 'default-6', name: 'Bleu nuit', hex: '#121289' },
    { id: 'default-7', name: 'Bleu lagune', hex: '#AEE6ED' },
    { id: 'default-8', name: 'Gris fleur de sel', hex: '#F2EFE9' },
    { id: 'default-9', name: 'Blanc neige', hex: '#FFFFFF' },
];
