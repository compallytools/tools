/*
 * Entrée principale (layout @Common/base.html.twig) : Stimulus, Symfony UX Vue, styles globaux.
 */
import { startStimulusApp } from '@symfony/reprise/stimulus';

import { registerModuleVueComponents } from './vue/registry';
import './styles/app.scss';

startStimulusApp();
registerModuleVueComponents();
