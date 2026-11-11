<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { ping, type PingResponse } from '../../api';

defineProps<{
    title: string;
}>();

const result = ref<PingResponse | null>(null);
const error = ref<string | null>(null);

onMounted(async () => {
    try {
        result.value = await ping();
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    }
});
</script>

<template>
    <section class="contrast-grid">
        <h2>{{ title }} (Vue)</h2>
        <p v-if="error" class="contrast-grid__error">Erreur API : {{ error }}</p>
        <p v-else-if="result" class="contrast-grid__status">
            API {{ result.module }} : <strong>{{ result.status }}</strong>
        </p>
        <p v-else>Chargement…</p>
    </section>
</template>

<style scoped lang="scss">
.contrast-grid__error {
    color: #b00020;
}
</style>
