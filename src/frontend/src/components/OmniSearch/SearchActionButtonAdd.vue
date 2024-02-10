<template>
    <button class="text-gray-300 hover:text-accent shadow-2xl group"
            :class="[componentName]"
            :title="title">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.0" stroke="currentColor"
             class="w-7 h-7 group-hover:hidden"
        >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
          class="w-7 h-7 hidden group-hover:block"
        >
            <path fill-rule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                  clip-rule="evenodd" />
        </svg>
    </button>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
export const componentName = 'SearchActionButtonAdd'
export default defineComponent({
    name: componentName,
})
</script>

<script lang="ts" setup>

import type { IOmniSearchAction } from './IOmniSearchAction.ts'

const title = 'Add search filter'

</script>

<style scoped></style>
