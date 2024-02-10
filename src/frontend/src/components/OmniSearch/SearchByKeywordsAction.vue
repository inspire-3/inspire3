<template>
    <div class="relative z-10" :class="[componentName]">
        <svg class="pointer-events-none absolute top-1.5 left-2 h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />        </svg>

        <label for="proxy-identity-search-field" class="hidden">{{ title }}</label>
        <input id="proxy-identity-search-field"
               type="text"
               class="h-9 w-full text-lg font-light font-sauce border-0 bg-transparent pl-10 pr-10 text-gray-900 placeholder:text-gray-400  outline-none"
               :class="smaller ? 'pr-16'  : 'pr-10' "
               :placeholder="title" role="combobox" aria-expanded="false" aria-controls="options">

        <slot name="add" :action="props.action" />
        <slot name="remove" :action="props.action" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export const componentName = 'SearchByKeywordsAction'
export default defineComponent({
    name: componentName,
})
</script>

<script lang="ts" setup>
import type { IOmniSearchAction } from './IOmniSearchAction.ts'

const title = 'Search by keywords ...'
const props = defineProps<{
    action: IOmniSearchAction,
    smaller: boolean
}>()


</script>

<style scoped></style>
