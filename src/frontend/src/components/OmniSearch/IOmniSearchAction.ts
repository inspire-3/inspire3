import type { TOmniSearchActionType } from './TOmniSearchActionType.ts'

export interface IOmniSearchAction {
    type: TOmniSearchActionType,
    name: string,
    componentName: 'SearchByTextAction' | 'SearchByKeywordsAction' | 'SearchByProxyIdentityAction' | 'ApplyCustomPromptAction',
    isEnabled: boolean
    value?: string|string[]
}
