/*
 * Entrée principale (layout @Common/base.html.twig) : Stimulus, Symfony UX Vue, styles globaux.
 */
import { startStimulusApp } from '@symfony/reprise/stimulus';

import { registerPinia } from './vue/pinia';
import { registerModuleVueComponents } from './vue/registry';
import './styles/app.scss';

// Avant le démarrage de Stimulus : les apps Vue sont montées dès la connexion des controllers.
registerPinia();
startStimulusApp();
registerModuleVueComponents();
