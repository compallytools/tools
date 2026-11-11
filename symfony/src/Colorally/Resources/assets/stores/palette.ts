import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { PaletteColor } from '../domain/color';
import { DEFAULT_PALETTE } from '../domain/defaults';
import type { PaletteEntry, RawEntry, Rejected, RejectReason } from '../domain/palette-io';
import { isDefaultPalette, MAX_COLORS, sanitizeEntries } from '../domain/palette-io';

export type PaletteResult = { ok: true; id: string } | { ok: false; error: RejectReason | 'not-found' };

let sequence = 0;
const nextId = (): string => `color-${++sequence}`;
const withId = (entry: PaletteEntry): PaletteColor => ({ id: nextId(), ...entry });
const defaultColors = (): PaletteColor[] => DEFAULT_PALETTE.map((color) => ({ ...color }));

export const usePaletteStore = defineStore('palette', () => {
    const colors = ref<PaletteColor[]>(defaultColors());

    const count = computed(() => colors.value.length);
    const isFull = computed(() => colors.value.length >= MAX_COLORS);
    const isDefault = computed(() => isDefaultPalette(colors.value));

    function add(entry: RawEntry): PaletteResult {
        const { accepted, rejected } = sanitizeEntries([entry], { existing: colors.value });
        const first = accepted[0];

        if (first === undefined) {
            return { ok: false, error: rejected[0]?.reason ?? 'invalid-hex' };
        }

        const color = withId(first);
        colors.value.push(color);

        return { ok: true, id: color.id };
    }

    function update(id: string, patch: Partial<RawEntry>): PaletteResult {
        const index = colors.value.findIndex((color) => color.id === id);
        const current = colors.value[index];

        if (current === undefined) {
            return { ok: false, error: 'not-found' };
        }

        const others = colors.value.filter((color) => color.id !== id);
        const { accepted, rejected } = sanitizeEntries(
            [{ name: patch.name ?? current.name, hex: patch.hex ?? current.hex }],
            { existing: others },
        );
        const first = accepted[0];

        if (first === undefined) {
            return { ok: false, error: rejected[0]?.reason ?? 'invalid-hex' };
        }

        colors.value[index] = { id, ...first };

        return { ok: true, id };
    }

    function remove(id: string): boolean {
        const before = colors.value.length;
        colors.value = colors.value.filter((color) => color.id !== id);

        return colors.value.length < before;
    }

    function reset(): void {
        colors.value = defaultColors();
    }

    function importEntries(
        entries: readonly RawEntry[],
        mode: 'replace' | 'append',
    ): { added: number; rejected: Rejected[] } {
        const { accepted, rejected } = sanitizeEntries(entries, {
            existing: mode === 'append' ? colors.value : [],
        });
        const added = accepted.map(withId);

        colors.value = mode === 'append' ? [...colors.value, ...added] : added;

        return { added: added.length, rejected };
    }

    function replaceAll(entries: readonly RawEntry[]): Rejected[] {
        return importEntries(entries, 'replace').rejected;
    }

    return { colors, count, isFull, isDefault, add, update, remove, reset, replaceAll, importEntries };
});
