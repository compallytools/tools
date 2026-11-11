import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import App from './App.vue';

function mountApp(url = '/') {
    window.history.replaceState(null, '', url);
    const pinia = createPinia();
    setActivePinia(pinia);

    return mount(App, { global: { plugins: [pinia] } });
}

beforeEach(() => {
    window.history.replaceState(null, '', '/');
});

afterEach(() => {
    window.history.replaceState(null, '', '/');
});

describe('App', () => {
    it('affiche la synthèse par défaut avec la palette par défaut', () => {
        const wrapper = mountApp();

        expect(wrapper.get('h1').text()).toBe('Votre palette, en un coup d’œil.');
        expect(wrapper.text()).toContain('9 couleurs, plein de possibilités.');
        wrapper.unmount();
    });

    it('affiche la grille quand l’URL le demande', () => {
        const wrapper = mountApp('/?view=grid');

        expect(wrapper.get('h1').text()).toBe('Toute votre palette. Les bons accords, en un regard.');
        wrapper.unmount();
    });

    it('hydrate la palette depuis l’URL', () => {
        const wrapper = mountApp('/?p=FF0000~Rouge');

        expect(wrapper.text()).toContain('1 couleur, plein de possibilités.');
        wrapper.unmount();
    });

    it('bascule entre les écrans et reflète l’écran dans l’URL', async () => {
        const wrapper = mountApp();

        await wrapper.get('.colorally-layout__content button').trigger('click');
        expect(wrapper.get('h1').text()).toContain('Les bons accords');
        expect(window.location.search).toBe('?view=grid');
        expect(wrapper.get('.colorally-layout__content button').text()).toBe('Retour à la synthèse');

        await wrapper.get('.colorally-layout__content button').trigger('click');
        expect(wrapper.get('h1').text()).toContain('coup d’œil');
        expect(window.location.search).toBe('');
        wrapper.unmount();
    });
});
