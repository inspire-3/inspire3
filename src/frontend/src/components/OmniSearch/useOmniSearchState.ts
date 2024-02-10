import { createGlobalState } from '@vueuse/core'
import { computed, type Ref, ref } from 'vue'
import type { IOmniSearchAction } from './IOmniSearchAction.ts'

const omniSearchActions: IOmniSearchAction[] = [
  {
    type: 'text',
    name: 'Search by text',
    componentName: 'SearchByTextAction',
    isEnabled: true,
  },
  {
    type: 'keywords',
    name: 'Search by Keywords',
    componentName: 'SearchByKeywordsAction',
    isEnabled: true,
  },
  {
    type: 'proxy-identities',
    name: 'Search by ProxyIdentities',
    componentName: 'SearchByProxyIdentityAction',
    isEnabled: false,
  },
  {
    type: 'custom-prompt',
    name: 'Apply custom prompt to selection',
    componentName: 'ApplyCustomPromptAction',
    isEnabled: false,
  },
]

const forceEnableAllActions = true

export const useOmniSearchState = createGlobalState(
  () => {
    // state
    const actions: Ref<IOmniSearchAction[]> = ref([] as IOmniSearchAction[])

    // getters
    const availableActions = computed(() => {
      return omniSearchActions.filter(
        source => !actions.value.find(
          used => used.type === source.type
        )
      ).filter(
        source => forceEnableAllActions|| source.isEnabled
      );
    })

    // actions
    const addAction = (actionToBeAdded: IOmniSearchAction) => {
      const index = omniSearchActions.findIndex(
        action => action.type === actionToBeAdded.type,
      )

      if (index === -1) {
        actions.value.push(actionToBeAdded)
      } else {
        actions.value[index] = actionToBeAdded
      }
    }

    const removeAction = (actionType :string) => {
      console.log('❌', actionType)
      const index = actions.value.findIndex(
        action => action.type === actionType,
      )

      if (index !== -1) {
        actions.value.splice(index, 1)
      }
    }

    const initialize = (/* url query params */) => {
      if ( actions.value.length === 0 ) {
        addAction(omniSearchActions.filter(action => action.type === 'text' )[0])
      }
    }

    return {
      initialize: initialize,
      availableActions,
      actions,
      addAction,
      removeAction,
      // @todo current query
    }
  },
)
