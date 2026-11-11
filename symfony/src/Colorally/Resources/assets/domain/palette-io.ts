import type { PaletteColor } from './color';
import { parseHex } from './color';
import { DEFAULT_PALETTE } from './defaults';

export const MAX_COLORS = 20;
export const NAME_MAX_LENGTH = 40;

export type View = 'dashboard' | 'grid';

/** Entrée brute (saisie, collage, URL) : pas encore validée. */
export type RawEntry = { name?: string; hex: string };
/** Entrée validée : hex normalisé `#RRGGBB`, nom non vide. */
export type PaletteEntry = { name: string; hex: string };

export type RejectReason = 'invalid-hex' | 'duplicate' | 'limit';
export type Rejected = { index: number; reason: RejectReason };

// --- Validateurs unitaires (réutilisables par les formulaires) -------------------------------

export function isValidHex(input: string): boolean {
    return parseHex(input) !== null;
}

export function isValidName(name: string): boolean {
    return name.trim().length <= NAME_MAX_LENGTH;
}

/** Vrai si `hex` (valide) existe déjà dans `existing`, hors la couleur `selfId` (édition). */
export function isDuplicateHex(hex: string, existing: readonly PaletteColor[], selfId?: string): boolean {
    const normalized = parseHex(hex);

    return normalized !== null && existing.some((color) => color.id !== selfId && color.hex === normalized);
}

/** Premier nom « Couleur N » libre. */
export function defaultName(names: readonly string[]): string {
    let number = names.length + 1;
    while (names.includes(`Couleur ${number}`)) {
        number += 1;
    }

    return `Couleur ${number}`;
}

// --- Règle de fond unique : collage, URL et stores -------------------------------------------

export function sanitizeEntries(
    entries: readonly RawEntry[],
    { existing = [], limit = MAX_COLORS }: { existing?: readonly PaletteColor[]; limit?: number } = {},
): { accepted: PaletteEntry[]; rejected: Rejected[] } {
    const accepted: PaletteEntry[] = [];
    const rejected: Rejected[] = [];
    const taken = new Set(existing.map((color) => color.hex));
    const names = existing.map((color) => color.name);

    entries.forEach((entry, index) => {
        const hex = parseHex(entry.hex);

        if (hex === null) {
            rejected.push({ index, reason: 'invalid-hex' });
        } else if (taken.has(hex)) {
            rejected.push({ index, reason: 'duplicate' });
        } else if (existing.length + accepted.length >= limit) {
            rejected.push({ index, reason: 'limit' });
        } else {
            const name = (entry.name ?? '').trim().slice(0, NAME_MAX_LENGTH) || defaultName(names);
            taken.add(hex);
            names.push(name);
            accepted.push({ name, hex });
        }
    });

    return { accepted, rejected };
}

// --- Collage d'une liste ---------------------------------------------------------------------

const SEPARATORS = '\\s,;:–-';
const NAME_THEN_HEX = new RegExp(`^(.+?)[${SEPARATORS}]*(#(?:[0-9a-f]{6}|[0-9a-f]{3}))$`, 'i');
const HEX_THEN_NAME = new RegExp(`^(#(?:[0-9a-f]{6}|[0-9a-f]{3}))[${SEPARATORS}]+(.+)$`, 'i');
const BARE_HEX = /^#?(?:[0-9a-f]{6}|[0-9a-f]{3})$/i;

/** Avec un nom, le `#` est obligatoire (« Decade » est un hex valide sans `#`). */
function parseEntry(text: string): RawEntry | null {
    const value = text.trim();

    if (BARE_HEX.test(value)) {
        return { hex: value };
    }

    const nameFirst = NAME_THEN_HEX.exec(value);
    if (nameFirst?.[1] !== undefined && nameFirst[2] !== undefined) {
        return { name: nameFirst[1], hex: nameFirst[2] };
    }

    const hexFirst = HEX_THEN_NAME.exec(value);
    if (hexFirst?.[1] !== undefined && hexFirst[2] !== undefined) {
        return { name: hexFirst[2], hex: hexFirst[1] };
    }

    return null;
}

export function parsePastedList(text: string): {
    entries: RawEntry[];
    errors: { line: number; text: string }[];
} {
    const entries: RawEntry[] = [];
    const errors: { line: number; text: string }[] = [];

    text.split(/\r?\n/).forEach((rawLine, index) => {
        const line = rawLine.trim();
        if (line === '') {
            return;
        }

        // Une ligne avec un seul `#` peut être « Nom, #HEX » : on tente d'abord la ligne entière.
        const single = (line.match(/#/g) ?? []).length <= 1 ? parseEntry(line) : null;
        if (single !== null) {
            entries.push(single);

            return;
        }

        for (const piece of line.split(/[,;]/)) {
            if (piece.trim() === '') {
                continue;
            }
            const entry = parseEntry(piece);
            if (entry === null) {
                errors.push({ line: index + 1, text: piece.trim() });
            } else {
                entries.push(entry);
            }
        }
    });

    return { entries, errors };
}

// --- URL ---------------------------------------------------------------------------------------

const encodeName = (name: string): string => encodeURIComponent(name).replace(/~/g, '%7E');

/** `D54414~Orange%20sanguine,3028F4~Bleu%20%C3%A9lectrique` : hex sans `#`. */
export function serializePalette(colors: readonly PaletteEntry[]): string {
    return colors.map(({ hex, name }) => `${hex.slice(1)}~${encodeName(name)}`).join(',');
}

export function isDefaultPalette(colors: readonly PaletteEntry[]): boolean {
    return (
        colors.length === DEFAULT_PALETTE.length &&
        colors.every((color, index) => {
            const reference = DEFAULT_PALETTE[index];

            return reference !== undefined && color.hex === reference.hex && color.name === reference.name;
        })
    );
}

/** `?p=…&view=grid`, ou `''` quand tout est par défaut. */
export function buildQuery({ colors, view }: { colors: readonly PaletteEntry[]; view: View }): string {
    const params: string[] = [];

    if (!isDefaultPalette(colors)) {
        params.push(`p=${serializePalette(colors)}`);
    }
    if (view !== 'dashboard') {
        params.push(`view=${view}`);
    }

    return params.length > 0 ? `?${params.join('&')}` : '';
}

function decodeName(raw: string): string | undefined {
    try {
        return decodeURIComponent(raw.replace(/\+/g, ' '));
    } catch {
        return undefined;
    }
}

/**
 * Lit la chaîne brute (pas URLSearchParams : il décode `%2C` avant le découpage, ce qui casserait
 * les noms contenant une virgule). `entries === null` → palette par défaut.
 */
export function parseQuery(search: string): { entries: PaletteEntry[] | null; view: View } {
    let rawPalette: string | undefined;
    let rawView: string | undefined;

    for (const param of search.replace(/^\?/, '').split('&')) {
        const separator = param.indexOf('=');
        const key = separator < 0 ? param : param.slice(0, separator);
        const value = separator < 0 ? '' : param.slice(separator + 1);

        if (key === 'p') {
            rawPalette = value;
        } else if (key === 'view') {
            rawView = value;
        }
    }

    const view: View = rawView === 'grid' ? 'grid' : 'dashboard';

    if (rawPalette === undefined) {
        return { entries: null, view };
    }
    if (rawPalette === '') {
        return { entries: [], view };
    }

    const raw: RawEntry[] = rawPalette.split(',').map((item) => {
        const separator = item.indexOf('~');

        return separator < 0
            ? { hex: item }
            : { hex: item.slice(0, separator), name: decodeName(item.slice(separator + 1)) };
    });
    const { accepted } = sanitizeEntries(raw);

    return { entries: accepted.length > 0 ? accepted : null, view };
}
