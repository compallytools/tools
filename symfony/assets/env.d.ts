/// <reference types="vite/client" />

import type { Component } from 'vue';

declare global {
    interface Window {
        /** Resolver lu par le contrôleur Stimulus de Symfony UX Vue (voir vue/registry.ts). */
        resolveVueComponent(name: string): Component;
    }
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<object, object, unknown>;
    export default component;
}
