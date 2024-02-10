<template>
  <span class="inline-flex items-center justify-center rounded-full group hover:bg-primary/50 border border-primary/50"  :class="[componentName,...props.classes]">
    <span class="text-xs font-medium leading-none text-primary/50 group-hover:text-primary-content">{{ nameInitials }}</span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export const componentName = 'Avatar'
export default defineComponent({
    name: componentName,
})
</script>

<script lang="ts" setup>

import { computed } from 'vue'

const props = withDefaults(defineProps<{
    fullname?: string
    classes?: string[]
}>(), {
    fullname: 'Jon Doe',
    classes: () => ['h-6', 'w-6'],
})

const nameInitials = computed(() => {
    const parts = props.fullname.split(' ')
    const initials = [] as string[]

    parts.forEach((item) => {
        if (item.length > 0 && item !== '') {
            initials.push(item[0])
        }
    })

    const resultingInitials = [] as string[]

    resultingInitials.push(initials[0])
    if (initials.length > 1) {
        resultingInitials.push(initials[initials.length - 1])
    }

    return resultingInitials.join('').toUpperCase()
})

</script>

