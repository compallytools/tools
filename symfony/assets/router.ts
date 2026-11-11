import { createRouter } from '@symfony/ux-router';
import { defaultLocale, routes } from '../var/routes/index.js';

/*
 * Routes Symfony exposées au JS (voir config/packages/ux_router.yaml).
 * Si var/routes est absent ou incomplet : task console -- ux:router:warm-cache
 */
export const { path, url } = createRouter({ routes, defaultLocale });
