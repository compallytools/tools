export type PaletteColor = {
    id: string;
    name: string;
    /** Toujours normalisé : `#RRGGBB`, majuscules. */
    hex: string;
};

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Normalise `#abc`, `abc`, `#aabbcc` ou `aabbcc` en `#AABBCC` ; `null` si invalide. */
export function parseHex(input: string): string | null {
    const match = HEX_PATTERN.exec(input.trim());
    const digits = match?.[1];

    if (digits === undefined) {
        return null;
    }

    const full =
        digits.length === 3
            ? digits
                  .split('')
                  .map((digit) => digit + digit)
                  .join('')
            : digits;

    return `#${full.toUpperCase()}`;
}

function linearize(channel: number): number {
    const value = channel / 255;

    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** Luminance relative WCAG d'une couleur `#RRGGBB` (0 = noir, 1 = blanc). */
export function relativeLuminance(hex: string): number {
    const red = linearize(parseInt(hex.slice(1, 3), 16));
    const green = linearize(parseInt(hex.slice(3, 5), 16));
    const blue = linearize(parseInt(hex.slice(5, 7), 16));

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
