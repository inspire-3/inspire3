<template>
    <div class="relative z-10" :class="[componentName]">
        <svg class="pointer-events-none absolute top-1.5 left-2 h-6 w-6 text-gray-400" viewBox="0 0 24 24"
             stroke-width="1.5" stroke="currentColor"
             fill="none" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>

        <label for="text-search-field" class="hidden">{{ title }}</label>
        <input id="text-search-field"
               type="text"
               class="h-9 w-full text-lg font-light font-sauce  border-0 bg-transparent pl-10 text-gray-900 placeholder:text-gray-400  outline-none"
               :class="smaller ? 'pr-16'  : 'pr-10' "
               :placeholder="title" role="combobox" aria-expanded="false" aria-controls="options">

        <slot name="add" :action="props.action" />
        <slot name="remove" :action="props.action" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export const componentName = 'SearchByProxyIdentityAction'
export default defineComponent({
    name: componentName,
})
</script>

<script lang="ts" setup>
import type { IOmniSearchAction } from './IOmniSearchAction.ts'

const title = 'Search by proxy identity...'
const props = defineProps<{
    action: IOmniSearchAction,
    smaller: boolean
}>()


</script>

<style scoped></style>
