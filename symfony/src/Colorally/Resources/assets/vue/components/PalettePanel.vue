<script setup lang="ts">
import { usePaletteStore } from '@colorally/stores/palette';
import { computed } from 'vue';

const palette = usePaletteStore();

const summary = computed(
    () => `${palette.count} ${palette.count > 1 ? 'couleurs' : 'couleur'}, plein de possibilités.`,
);
</script>

<template>
    <aside class="palette-panel" aria-labelledby="palette-panel-title">
        <div class="palette-panel__header">
            <h2 id="palette-panel-title" class="palette-panel__title">Votre palette</h2>
            <span class="palette-panel__count" aria-hidden="true">{{ palette.count }}</span>
        </div>
        <p class="palette-panel__summary">{{ summary }}</p>

        <div class="palette-panel__actions">
            <!-- Inerte jusqu'au lot 4 (dialogue de collage). -->
            <button type="button" class="palette-panel__link" disabled>Coller une liste</button>
            <button type="button" class="palette-panel__link palette-panel__link--muted" @click="palette.reset()">
                Réinitialiser
            </button>
        </div>

        <ul class="palette-panel__list">
            <li v-for="color in palette.colors" :key="color.id" class="palette-panel__item">
                <span class="palette-panel__swatch" :style="{ '--swatch': color.hex }" aria-hidden="true"></span>
                <span class="palette-panel__identity">
                    <span class="palette-panel__name">{{ color.name }}</span>
                    <span class="palette-panel__hex">{{ color.hex }}</span>
                </span>
                <!-- Inerte jusqu'au lot 4 (éditeur de couleur). -->
                <button type="button" class="palette-panel__link palette-panel__link--small" disabled>
                    Modifier
                    <span class="visually-hidden">{{ color.name }}</span>
                </button>
            </li>
        </ul>

        <!-- Inerte jusqu'au lot 4. -->
        <button type="button" class="palette-panel__add" disabled>+ Ajouter une couleur</button>
    </aside>
</template>
