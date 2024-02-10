<template>
    <div v-if="show && isOmniSearchActivated" class="relative flex items-center justify-start w-full"
         :class="[componentName, isLgScreen ? 'h-[44px]' : 'h-[52px]']"
    >
        <div class="absolute z-0 top-0 left-0 right-0 lg:pt-1 backdrop:blur "
             :class="isLgScreen ? (isMultiSearch ? 'bg-base-100/90 shadow-2xl rounded-b-2xl' : '') : 'px-1 sm:px-2 md:px-4 bg-base-100/90 shadow-2xl rounded-3xl'"
        >
            <div v-for="(action, index) in omniSearchState.actions.value"
                 :key="action.type"
                 class="pb-2"
                 :class="(index !== 0 || !isLgScreen) ? 'pt-2' : ''"
            >
                <component :is="action.componentName"
                           :action="action"
                           :smaller="showAddAction(action) && showRemoveAction(action)"
                >
                    <template v-if="showAddAction(action)" #add="{action}">
                        <SearchActionButtonAdd
                            class="absolute top-1 right-1.5"
                            :action="action"
                            @click="add(action)"
                        />
                    </template>
                    <template v-if="!showAddAction(action) || showRemoveAction(action)" #remove="{action}">
                        <SearchActionButtonRemove
                            class="absolute top-1.5 right-2"
                            :class="showAddAction(action) && showRemoveAction(action) ? '!right-9' : ''"
                            :action="action"
                            @click="remove(action)"
                        />
                    </template>
                </component>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SearchByTextAction from './SearchByTextAction.vue'
import SearchByProxyIdentityAction from './SearchByProxyIdentityAction.vue'
import SearchByKeywordsAction from './SearchByKeywordsAction.vue'
import ApplyCustomPromptAction from './ApplyCustomPromptAction.vue'

export const componentName = 'OmniSearch'
export default defineComponent({
    name: componentName,
    components: {
        SearchByTextAction,
        SearchByProxyIdentityAction,
        SearchByKeywordsAction,
        ApplyCustomPromptAction,
    },
})
</script>

<script lang="ts" setup>
import SearchActionButtonAdd from './SearchActionButtonAdd.vue'
import { useOmniSearchState } from './useOmniSearchState.ts'
import { computed, onMounted, ref, toValue, watch } from 'vue'
import SearchActionButtonRemove from './SearchActionButtonRemove.vue'
import type { IOmniSearchAction } from './IOmniSearchAction.ts'
import { useBrowserLocation, useMediaQuery } from '@vueuse/core'

const props = withDefaults(defineProps<{location?: 'body' | 'navigation'}>(), {
    location: 'navigation'
})

const isLgScreen = useMediaQuery('(min-width: 1024px)')

watch(isLgScreen, (value) =>{
    console.log('🚨','is (min-width: 1024px)', value)
}  )

const show = computed(() => {
    switch (props.location) {
        case 'navigation':
            return toValue(isLgScreen)
        case 'body':
            return !toValue(isLgScreen)
        default:
            return false
    }
})

const omniSearchState = useOmniSearchState()
const add = (action: IOmniSearchAction) => {
    const first = omniSearchState.availableActions.value[0] ?? undefined
    if (first) {
        omniSearchState.addAction(first)
    }
}

const showAddAction = (currentAction: IOmniSearchAction) => {
    if (omniSearchState.availableActions.value.length === 0) {
        return false
    }
    const index = omniSearchState.actions.value.findIndex(
        action => action.type === currentAction.type,
    )

    if (index !== omniSearchState.actions.value.length - 1) {
        return false
    }

    return true
}

const showRemoveAction = (currentAction: IOmniSearchAction) => {
    if (omniSearchState.availableActions.value.length === 0) {
        return true
    }

    const index = omniSearchState.actions.value.findIndex(
        action => action.type === currentAction.type,
    )

    if (index === omniSearchState.actions.value.length - 1 && index !== 0) {
        return true
    }

    return false
}


const remove = (action: IOmniSearchAction) => {
    omniSearchState.removeAction(action.type)
}

const supportedPaths = [
    '/',
]
const browserLocation = useBrowserLocation()
const resolveIsOmniSearchActivated = ((pathname?: string) => {
    if (!pathname) {
        isOmniSearchActivated.value = false
        return
    }

    const result = supportedPaths.findIndex(path => {
        return path === pathname
    })

    if (result < 0) {
        isOmniSearchActivated.value = false
        return
    }

    isOmniSearchActivated.value = true
    return
})

const isOmniSearchActivated = ref(false)
const isMultiSearch = computed(() => omniSearchState.actions.value.length > 1)

onMounted(() => {
    resolveIsOmniSearchActivated(browserLocation.value.pathname)
    omniSearchState.initialize()

    console.log('📌', {
        show: toValue(show),
        isLgScreen: toValue(isLgScreen),
        location: props.location,
    })

})

</script>

<style scoped></style>
