
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const Footer: typeof import("../components/Footer.vue")['default']
export const Navbar: typeof import("../components/Navbar.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const InputNumber: typeof import("primevue/inputnumber")['default']
export const InputText: typeof import("primevue/inputtext")['default']
export const Select: typeof import("primevue/select")['default']
export const Textarea: typeof import("primevue/textarea")['default']
export const Button: typeof import("primevue/button")['default']
export const Dialog: typeof import("primevue/dialog")['default']
export const Toast: typeof import("primevue/toast")['default']
export const Avatar: typeof import("primevue/avatar")['default']
export const Badge: typeof import("primevue/badge")['default']
export const ProgressSpinner: typeof import("primevue/progressspinner")['default']
export const Tag: typeof import("primevue/tag")['default']
export const NuxtPage: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyFooter: LazyComponent<typeof import("../components/Footer.vue")['default']>
export const LazyNavbar: LazyComponent<typeof import("../components/Navbar.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyInputNumber: LazyComponent<typeof import("primevue/inputnumber")['default']>
export const LazyInputText: LazyComponent<typeof import("primevue/inputtext")['default']>
export const LazySelect: LazyComponent<typeof import("primevue/select")['default']>
export const LazyTextarea: LazyComponent<typeof import("primevue/textarea")['default']>
export const LazyButton: LazyComponent<typeof import("primevue/button")['default']>
export const LazyDialog: LazyComponent<typeof import("primevue/dialog")['default']>
export const LazyToast: LazyComponent<typeof import("primevue/toast")['default']>
export const LazyAvatar: LazyComponent<typeof import("primevue/avatar")['default']>
export const LazyBadge: LazyComponent<typeof import("primevue/badge")['default']>
export const LazyProgressSpinner: LazyComponent<typeof import("primevue/progressspinner")['default']>
export const LazyTag: LazyComponent<typeof import("primevue/tag")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.21.1_@parcel+watcher_248607a156f9959537a3a08e23e0f869/node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
