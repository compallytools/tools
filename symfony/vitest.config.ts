import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const fromRoot = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

// Config séparée de vite.config.ts : pas besoin du plugin Symfony/Reprise pour les tests.
export default defineConfig({
    resolve: {
        alias: {
            '@common': fromRoot('./src/Common/Resources/assets'),
            '@colorally': fromRoot('./src/Colorally/Resources/assets'),
            '@router': fromRoot('./assets/router.ts'),
        },
    },
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        include: ['src/**/Resources/assets/**/*.test.ts'],
    },
});
