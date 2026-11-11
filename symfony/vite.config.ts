import { fileURLToPath, URL } from 'node:url';

import Symfony from '@symfony/reprise/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const port = Number(process.env.VITE_PORT ?? 5173);
const fromRoot = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
    // Une entrée par module : src/<Module>/Resources/assets/<entry>.ts
    // Twig : reprise_entry_script_tags('<nom>') / reprise_entry_link_tags('<nom>')
    input: {
        app: './src/Common/Resources/assets/app.ts',
        colorally: './src/Colorally/Resources/assets/colorally.ts',
    },
    resolve: {
        alias: {
            '@common': fromRoot('./src/Common/Resources/assets'),
            '@colorally': fromRoot('./src/Colorally/Resources/assets'),
            '@router': fromRoot('./assets/router.ts'),
        },
    },
    plugins: [
        vue(),
        Symfony({
            stimulus: {
                controllersJson: 'assets/controllers.json',
                controllersDir: 'src/Common/Resources/assets/controllers',
            },
            // Le serveur écoute sur 0.0.0.0 dans Docker : on donne l'origine vue par le navigateur.
            devServerOrigin: `http://localhost:${port}`,
        }),
    ],
    server: {
        host: '0.0.0.0',
        port,
        strictPort: true,
        cors: true,
        watch: {
            // Les fichiers PHP/Twig ne concernent pas Vite.
            ignored: ['**/vendor/**', '**/var/cache/**', '**/var/log/**'],
        },
    },
});
