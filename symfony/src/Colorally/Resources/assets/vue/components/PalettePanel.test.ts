import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { usePaletteStore } from '../../stores/palette';
import PalettePanel from './PalettePanel.vue';

function mountPanel() {
    const pinia = createPinia();
    setActivePinia(pinia);

    return mount(PalettePanel, { global: { plugins: [pinia] } });
}

beforeEach(() => {
    setActivePinia(createPinia());
});

describe('PalettePanel', () => {
    it('affiche le compteur et la liste des couleurs avec nom et hex', () => {
        const wrapper = mountPanel();

        expect(wrapper.get('.palette-panel__count').text()).toBe('9');
        expect(wrapper.findAll('.palette-panel__item')).toHaveLength(9);
        expect(wrapper.get('.palette-panel__item').text()).toContain('Orange sanguine');
        expect(wrapper.get('.palette-panel__item').text()).toContain('#D54414');
        expect(wrapper.text()).toContain('9 couleurs, plein de possibilités.');
    });

    it('donne à chaque pastille la couleur de la palette (custom property)', () => {
        const wrapper = mountPanel();

        expect(wrapper.get('.palette-panel__swatch').attributes('style')).toContain('--swatch: #D54414');
    });

    it('réinitialise la palette', async () => {
        const wrapper = mountPanel();
        const palette = usePaletteStore();

        palette.remove('default-1');
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.palette-panel__item')).toHaveLength(8);

        await wrapper.get('.palette-panel__link--muted').trigger('click');
        expect(wrapper.findAll('.palette-panel__item')).toHaveLength(9);
    });
});
