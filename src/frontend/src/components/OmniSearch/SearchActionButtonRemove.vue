<template>
    <button class="text-gray-300 hover:text-secondary shadow-2xl group"
            :class="[componentName]"
            :title="title">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor"
             class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>

    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export const componentName = 'SearchActionButtonRemove'
export default defineComponent({
    name: componentName,
})
</script>

<script lang="ts" setup>

import type { IOmniSearchAction } from './IOmniSearchAction.ts'

const title = 'Add search filter'
const props = defineProps<{ action: IOmniSearchAction }>()

</script>

<style scoped></style>
