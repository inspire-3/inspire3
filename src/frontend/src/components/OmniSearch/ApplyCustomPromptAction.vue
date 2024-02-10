<template>
    <div v-if="showAction" class="relative z-10" :class="[componentName]">
        <svg class="pointer-events-none absolute top-1.5 left-2 h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24"
             stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
        </svg>

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

export const componentName = 'ApplyCustomPromptAction'
export default defineComponent({
    name: componentName,
})
</script>

<script lang="ts" setup>
import type { IOmniSearchAction } from './IOmniSearchAction.ts'
import { useOmniSearchState } from './useOmniSearchState.ts'

const title = 'Apply custom prompt...'
const props = defineProps<{
    action: IOmniSearchAction,
    smaller: boolean
}>()

// @info show action only when there are items selected
const showAction = true

</script>

<style scoped></style>
