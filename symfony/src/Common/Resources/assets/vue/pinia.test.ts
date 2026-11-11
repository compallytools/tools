import { describe, expect, it, vi } from 'vitest';
import type { App } from 'vue';

import { registerPinia } from './pinia';

describe('registerPinia', () => {
    it('installe une instance Pinia sur l’app montée (vue:before-mount)', () => {
        const target = new EventTarget();
        const use = vi.fn();

        registerPinia(target);
        target.dispatchEvent(new CustomEvent('vue:before-mount', { detail: { app: { use } as unknown as App } }));

        expect(use).toHaveBeenCalledTimes(1);
        expect(use.mock.calls[0]?.[0]).toHaveProperty('install');
    });

    it('ignore les autres événements', () => {
        const target = new EventTarget();
        const use = vi.fn();

        registerPinia(target);
        target.dispatchEvent(new CustomEvent('vue:mount', { detail: { app: { use } } }));

        expect(use).not.toHaveBeenCalled();
    });
});
