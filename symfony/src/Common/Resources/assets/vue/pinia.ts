import { createPinia } from 'pinia';
import type { App } from 'vue';

/**
 * Installe Pinia sur chaque app Vue montée par Symfony UX Vue (événement `vue:before-mount`).
 * À appeler dans l'entrée commune AVANT startStimulusApp() : Stimulus connecte les controllers dès que
 * render_controller est chargé, donc avant l'évaluation des entrées de module (course constatée en navigateur).
 * Pas de filtre sur le composant : installer Pinia sur une app sans store est sans effet.
 */
export function registerPinia(target: EventTarget = document): void {
    target.addEventListener('vue:before-mount', (event) => {
        (event as CustomEvent<{ app: App }>).detail.app.use(createPinia());
    });
}
