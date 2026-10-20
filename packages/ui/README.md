# @vue-js-spa-components/ui

Accessible Vue 3 components with a clean, system-native look, built on Tailwind CSS 4 design tokens.

```bash
pnpm add @vue-js-spa-components/ui
```

```js
import '@vue-js-spa-components/ui/style.css'
import { Button, NumberField, ToastProvider, useToast } from '@vue-js-spa-components/ui'
```

- 38 components: inputs (including an IME-aware `NumberField`), selection controls, dialogs,
  toasts, menus, tabs, combobox, data table, pagination, error boundary and an app shell.
- 8 composables: `useForm` (Standard Schema validation), `useAsync`, `usePolling`, `useToast`,
  `useConfirm`, `useTheme`, `useFocusTrap`, `useClickOutside`.
- Light, dark and increased-contrast themes; every text color is tested for WCAG AA contrast.

Live documentation: https://rumman-hossain.github.io/vue-js-spa-components/components

Peer dependency: `vue@^3.5`. License: MIT.
