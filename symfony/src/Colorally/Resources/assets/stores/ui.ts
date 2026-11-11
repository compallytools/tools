import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { View } from '../domain/palette-io';

export const useUiStore = defineStore('ui', () => {
    const view = ref<View>('dashboard');
    const editingId = ref<string | null>(null);

    function setView(next: View): void {
        view.value = next;
    }

    /** Un seul éditeur ouvert à la fois. */
    function startEditing(id: string): void {
        editingId.value = id;
    }

    function stopEditing(): void {
        editingId.value = null;
    }

    return { view, editingId, setView, startEditing, stopEditing };
});
