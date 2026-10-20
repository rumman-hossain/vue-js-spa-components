/**
 * @typedef {object} SplitViewContext
 * @property {() => void} openSidebar Opens the off-canvas sidebar on narrow screens.
 * @property {string} openLabel Accessible name for the button that opens it.
 */

/**
 * Lets a Toolbar inside a SplitView render the "show sidebar" button for narrow screens.
 * @type {import('vue').InjectionKey<SplitViewContext>}
 */
export const SPLIT_VIEW_KEY = Symbol('split-view')

/** Width at which the sidebar becomes a permanent column (Tailwind's `lg`). */
export const WIDE_QUERY = '(min-width: 64rem)'
