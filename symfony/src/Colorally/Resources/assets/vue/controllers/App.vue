<script setup lang="ts">
import { useUrlState } from '@colorally/composables/useUrlState';
import type { View } from '@colorally/domain/palette-io';
import PalettePanel from '@colorally/vue/components/PalettePanel.vue';
import { useUiStore } from '@colorally/stores/ui';
import { computed } from 'vue';

const SCREENS: Record<View, { title: string; lead: string; heading: string }> = {
    dashboard: {
        title: 'Votre palette, en un coup d’œil.',
        lead: 'Mesurez son potentiel accessible, puis retrouvez les associations à utiliser.',
        heading: 'Statistiques sur la palette complète',
    },
    grid: {
        title: 'Toute votre palette. Les bons accords, en un regard.',
        lead: 'Croisez une couleur de texte et une couleur de fond : les associations compatibles prennent leur place dans la grille.',
        heading: 'La grille des associations',
    },
};

useUrlState();

const ui = useUiStore();

const screen = computed(() => SCREENS[ui.view]);
</script>

<template>
    <div class="colorally-app">
        <h1 class="colorally-app__title">{{ screen.title }}</h1>
        <p class="colorally-app__lead">{{ screen.lead }}</p>

        <div class="colorally-layout">
            <PalettePanel />

            <!-- Contenu de l'écran : remplacé par la synthèse (lot 5) et la grille (lot 6). -->
            <section class="colorally-layout__content" aria-labelledby="colorally-screen-title">
                <h2 id="colorally-screen-title" class="colorally-layout__heading">{{ screen.heading }}</h2>
                <button v-if="ui.view === 'dashboard'" type="button" @click="ui.setView('grid')">
                    Voir la grille complète
                </button>
                <button v-else type="button" @click="ui.setView('dashboard')">Retour à la synthèse</button>
            </section>
        </div>
    </div>
</template>
