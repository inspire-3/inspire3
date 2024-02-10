<template>
    <div class="relative z-10" :class="[componentName]">
        <svg class="pointer-events-none absolute top-1.5 left-2 h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24"
             stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>

        <label for="proxy-identity-search-field" class="hidden">{{ title }}</label>
        <input id="proxy-identity-search-field"
               type="text"
               class="h-9 w-full text-lg font-light font-sauce border-0 bg-transparent pl-10 text-gray-900 placeholder:text-gray-400  outline-none"
               :class="smaller ? 'pr-16'  : 'pr-10' "
               :placeholder="title" role="combobox" aria-expanded="false" aria-controls="options">

        <slot name="add" :action="props.action" />
        <slot name="remove" :action="props.action" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export const componentName = 'SearchByTextAction'
export default defineComponent({
    name: componentName,
})
</script>

<script lang="ts" setup>
import type { IOmniSearchAction } from './IOmniSearchAction.ts'

const title = 'Search ...'
const props = defineProps<{
    action: IOmniSearchAction,
    smaller: boolean
}>()

</script>

<style scoped></style>
