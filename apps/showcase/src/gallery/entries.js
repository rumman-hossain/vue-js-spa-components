/**
 * Documentation for every export of the component library, one entry per gallery section.
 *
 * `code` is the demo's own source file, so the Usage tab always shows exactly what renders
 * above it. `entries.spec.js` checks the prop, event and default lists against the components.
 */

/** @typedef {import('./model.js').GalleryEntry} GalleryEntry */
/** @typedef {import('./model.js').PropDoc} PropDoc */

const sources = /** @type {Record<string, string>} */ (
  import.meta.glob('./demos/*.vue', { query: '?raw', import: 'default', eager: true })
)

/** @param {string} name Demo file name without extension. */
function code(name) {
  const source = sources[`./demos/${name}.vue`]
  if (source === undefined) throw new Error(`Missing demo source: ${name}`)
  return source
}

// Props shared by most form fields, so their wording stays identical everywhere.
const FIELD = /** @type {const} */ ({
  label: {
    name: 'label',
    type: 'string',
    default: 'required',
    description: 'Visible label, linked to the control with `for`/`id`.',
  },
  labelHidden: {
    name: 'labelHidden',
    type: 'boolean',
    default: 'false',
    description: 'Hides the label visually; it stays the accessible name.',
  },
  hint: {
    name: 'hint',
    type: 'string',
    default: '—',
    description: 'Help text below the control, wired with `aria-describedby`.',
  },
  error: {
    name: 'error',
    type: 'string',
    default: '—',
    description: 'Error message. Sets `aria-invalid` and is described before the hint.',
  },
  placeholder: {
    name: 'placeholder',
    type: 'string',
    default: '—',
    description: 'Example input. Never a replacement for the label.',
  },
  required: {
    name: 'required',
    type: 'boolean',
    default: 'false',
    description: 'Native `required`; also shows `requiredLabel` next to the label.',
  },
  requiredLabel: {
    name: 'requiredLabel',
    type: 'string',
    default: "'Required'",
    description: 'Visible marker for required fields (hidden from assistive technology).',
  },
  disabled: {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the control.',
  },
  readonly: {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description: 'Value can be read and copied but not changed.',
  },
  id: {
    name: 'id',
    type: 'string',
    default: '—',
    description: 'Id of the native control. Generated with `useId()` when omitted.',
  },
})

/** @type {import('./model.js').EventDoc} */
const BLUR = { name: 'blur', payload: 'FocusEvent', description: 'The control lost focus.' }

/**
 * @param {string} type
 * @param {string} defaultValue
 * @param {string} [description]
 * @returns {PropDoc}
 */
const model = (type, defaultValue, description = 'Bound with `v-model`.') => ({
  name: 'modelValue',
  type,
  default: defaultValue,
  description,
})

/** @type {PropDoc[]} */
const BUTTON_LOOK = [
  {
    name: 'variant',
    type: "'filled' | 'tinted' | 'gray' | 'plain'",
    default: "'filled'",
    description: 'Visual weight. Use one `filled` button per view for the main action.',
  },
  {
    name: 'tone',
    type: "'accent' | 'danger'",
    default: "'accent'",
    description: '`danger` for destructive actions.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Height and text size.',
  },
  {
    name: 'type',
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: 'Native button type. Defaults to `button` so it never submits a form by accident.',
  },
]

/** @type {GalleryEntry[]} */
export const entries = [
  // Actions
  {
    id: 'button',
    name: 'Button',
    category: 'Actions',
    kind: 'component',
    summary: 'Triggers an action. Renders a link instead when given `href`.',
    exports: ['Button'],
    demo: () => import('./demos/ButtonDemo.vue'),
    code: code('ButtonDemo'),
    props: [
      ...BUTTON_LOOK,
      {
        name: 'href',
        type: 'string',
        default: '—',
        description: 'Renders an `<a>` with button styling.',
      },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button.' },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: 'Shows a spinner, keeps the width and blocks further presses.',
      },
      {
        name: 'block',
        type: 'boolean',
        default: 'false',
        description: 'Stretches to the full width of the container.',
      },
    ],
    slots: [
      { name: 'default', props: '—', description: 'Button text, the accessible name.' },
      { name: 'leading', props: '—', description: 'Decorative icon before the text.' },
      { name: 'trailing', props: '—', description: 'Decorative icon after the text.' },
    ],
    a11y: [
      'A native `<button>` (or `<a>` with `href`), so Enter and Space work without extra code.',
      'While `loading` it sets `aria-busy="true"` and is disabled; the text stays in the accessibility tree, so the name does not change.',
      'A disabled link drops its `href` and gets `role="link"` with `aria-disabled="true"`, because links cannot be disabled natively.',
      'Icons in the `leading` and `trailing` slots are wrapped in `aria-hidden="true"`.',
      'Focus is shown with a 3px outline on keyboard focus only (`:focus-visible`).',
    ],
  },
  {
    id: 'icon-button',
    name: 'IconButton',
    category: 'Actions',
    kind: 'component',
    summary: 'A round button that shows only an icon. The `label` prop is required.',
    exports: ['IconButton'],
    demo: () => import('./demos/IconButtonDemo.vue'),
    code: code('IconButtonDemo'),
    props: [
      {
        name: 'label',
        type: 'string',
        default: 'required',
        description: 'Accessible name, set as `aria-label`.',
      },
      { ...BUTTON_LOOK[0], default: "'plain'" },
      ...BUTTON_LOOK.slice(1),
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button.' },
    ],
    slots: [
      { name: 'default', props: '—', description: 'The icon. Hidden from assistive technology.' },
    ],
    a11y: [
      'The name comes from `label` via `aria-label`; the icon itself is `aria-hidden="true"`.',
      'For a toggle, pass `aria-pressed` and keep the label constant: screen readers announce “Favorite, toggle button, pressed”.',
      'Sizes are at least 32px; the default `md` is 44px, a comfortable touch target.',
    ],
  },

  // Inputs
  {
    id: 'text-field',
    name: 'TextField',
    category: 'Inputs',
    kind: 'component',
    summary: 'Single-line text input with label, hint and error message.',
    exports: ['TextField'],
    demo: () => import('./demos/TextFieldDemo.vue'),
    code: code('TextFieldDemo'),
    props: [
      FIELD.label,
      FIELD.labelHidden,
      FIELD.hint,
      FIELD.error,
      {
        name: 'type',
        type: "'text' | 'email' | 'url' | 'tel' | 'password' | 'search'",
        default: "'text'",
        description: 'Native input type; picks the right on-screen keyboard.',
      },
      FIELD.placeholder,
      FIELD.required,
      FIELD.requiredLabel,
      FIELD.disabled,
      FIELD.readonly,
      {
        name: 'autocomplete',
        type: 'string',
        default: '—',
        description: 'Autofill hint such as `email` or `name`.',
      },
      {
        name: 'inputmode',
        type: "'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'",
        default: '—',
        description: 'Virtual keyboard hint.',
      },
      { name: 'maxlength', type: 'number', default: '—', description: 'Native `maxlength`.' },
      FIELD.id,
      model('string', "''"),
    ],
    events: [BLUR],
    slots: [
      {
        name: 'leading',
        props: '—',
        description: 'Decorative icon inside the field, before the text.',
      },
      { name: 'trailing', props: '—', description: 'Content after the text, e.g. a button.' },
    ],
    a11y: [
      'A real `<label for>` names the input; `labelHidden` hides it visually only.',
      '`aria-describedby` lists the error before the hint, so the more urgent message is read first.',
      'With `error` set the input gets `aria-invalid="true"`.',
      'Native `v-model` waits for `compositionend`, so Japanese and Chinese IME input is never rewritten mid-word.',
      '`class` and `style` go to the wrapper; every other attribute (`name`, `data-*`, listeners) reaches the `<input>`.',
    ],
  },
  {
    id: 'number-field',
    name: 'NumberField',
    category: 'Inputs',
    kind: 'component',
    summary:
      'Number input that groups digits for the locale as you type and keeps the caret in place. `v-model` is a number or `null`.',
    exports: ['NumberField'],
    demo: () => import('./demos/NumberFieldDemo.vue'),
    code: code('NumberFieldDemo'),
    props: [
      FIELD.label,
      FIELD.labelHidden,
      FIELD.hint,
      FIELD.error,
      FIELD.required,
      FIELD.requiredLabel,
      FIELD.disabled,
      FIELD.readonly,
      FIELD.placeholder,
      {
        name: 'min',
        type: 'number',
        default: '—',
        description: 'Lower bound, applied on blur and by the arrow keys.',
      },
      {
        name: 'max',
        type: 'number',
        default: '—',
        description: 'Upper bound, applied on blur and by the arrow keys.',
      },
      {
        name: 'step',
        type: 'number',
        default: '1',
        description: 'Change per ArrowUp / ArrowDown.',
      },
      {
        name: 'allowNegative',
        type: 'boolean',
        default: 'true',
        description: 'Accepts a leading minus sign.',
      },
      {
        name: 'maxFractionDigits',
        type: 'number',
        default: '0',
        description: 'Digits allowed after the decimal separator. `0` means integers only.',
      },
      {
        name: 'maxDigits',
        type: 'number',
        default: '15',
        description: 'Digits allowed before the decimal separator; extra input is ignored.',
      },
      {
        name: 'locale',
        type: 'string',
        default: '—',
        description:
          'BCP 47 locale for separators, e.g. `ja-JP` or `de-DE`. Defaults to the browser.',
      },
      FIELD.id,
      model('number | null', 'null', 'Bound with `v-model`. `null` while the field is empty.'),
    ],
    events: [BLUR],
    slots: [
      { name: 'leading', props: '—', description: 'Decorative prefix such as a currency sign.' },
      { name: 'trailing', props: '—', description: 'Decorative suffix such as a unit.' },
    ],
    a11y: [
      'A text input with `inputmode="numeric"` (or `decimal`), not `type="number"`: no spinner buttons, no scroll-wheel surprises, and grouping separators can be shown.',
      'ArrowUp and ArrowDown change the value by `step` and respect `min`/`max`.',
      'Full-width digits from a Japanese IME (１２３) are converted to 123, and nothing is reformatted until the IME commits the text.',
      'Clamping waits until blur, so typing “1” on the way to “15” is never overwritten.',
      'Use `hint` or `aria-describedby` to state the unit when the prefix or suffix carries meaning; the slots are `aria-hidden`.',
    ],
  },
  {
    id: 'secure-field',
    name: 'SecureField',
    category: 'Inputs',
    kind: 'component',
    summary: 'Password input with a show/hide toggle that works with password managers.',
    exports: ['SecureField'],
    demo: () => import('./demos/SecureFieldDemo.vue'),
    code: code('SecureFieldDemo'),
    props: [
      FIELD.label,
      FIELD.hint,
      FIELD.error,
      FIELD.placeholder,
      FIELD.required,
      FIELD.requiredLabel,
      FIELD.disabled,
      {
        name: 'autocomplete',
        type: 'string',
        default: "'current-password'",
        description: 'Use `new-password` on sign-up so managers offer to generate one.',
      },
      { name: 'maxlength', type: 'number', default: '—', description: 'Native `maxlength`.' },
      {
        name: 'toggleLabel',
        type: 'string',
        default: "'Show password'",
        description:
          'Name of the reveal button. It stays the same; `aria-pressed` carries the state.',
      },
      model('string', "''"),
    ],
    events: [BLUR],
    a11y: [
      'The reveal button is a toggle: constant name plus `aria-pressed="true|false"`.',
      'Autocapitalize and spellcheck are off, so the browser never changes or sends the password for spellchecking.',
      'The password is never shown by default and the reveal state is not remembered.',
    ],
  },
  {
    id: 'text-area',
    name: 'TextArea',
    category: 'Inputs',
    kind: 'component',
    summary: 'Multi-line text input that can grow with its content and count characters.',
    exports: ['TextArea'],
    demo: () => import('./demos/TextAreaDemo.vue'),
    code: code('TextAreaDemo'),
    props: [
      FIELD.label,
      FIELD.labelHidden,
      FIELD.hint,
      FIELD.error,
      FIELD.placeholder,
      FIELD.required,
      FIELD.requiredLabel,
      FIELD.disabled,
      FIELD.readonly,
      { name: 'rows', type: 'number', default: '3', description: 'Initial visible lines.' },
      {
        name: 'autoGrow',
        type: 'boolean',
        default: 'false',
        description: 'Grows with its content instead of scrolling.',
      },
      {
        name: 'maxlength',
        type: 'number',
        default: '—',
        description: 'Native `maxlength`; also shows a live character count.',
      },
      FIELD.id,
      model('string', "''"),
    ],
    events: [BLUR],
    a11y: [
      'The counter is part of `aria-describedby` and lives in an `aria-live="polite"` region, read after the typed character rather than over it.',
      'Hint and error are wired like `TextField`.',
      'Without `autoGrow` the user can resize it vertically.',
    ],
  },
  {
    id: 'search-field',
    name: 'SearchField',
    category: 'Inputs',
    kind: 'component',
    summary:
      'Search input with a debounced `search` event, a clear button and Escape to clear. This page filters with one.',
    exports: ['SearchField'],
    demo: () => import('./demos/SearchFieldDemo.vue'),
    code: code('SearchFieldDemo'),
    props: [
      {
        name: 'label',
        type: 'string',
        default: "'Search'",
        description: 'Accessible name. Hidden visually unless `labelVisible` is set.',
      },
      { name: 'labelVisible', type: 'boolean', default: 'false', description: 'Shows the label.' },
      {
        name: 'placeholder',
        type: 'string',
        default: "'Search'",
        description: 'Placeholder text.',
      },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the field.' },
      {
        name: 'debounce',
        type: 'number',
        default: '300',
        description: 'Milliseconds after the last keystroke before `search` fires.',
      },
      {
        name: 'clearLabel',
        type: 'string',
        default: "'Clear search'",
        description: 'Name of the clear button.',
      },
      {
        name: 'landmark',
        type: 'boolean',
        default: 'false',
        description: 'Wraps the field in `role="search"`. Use once per page for the main search.',
      },
      model('string', "''", 'Bound with `v-model`; updates on every keystroke.'),
    ],
    events: [
      {
        name: 'search',
        payload: 'string',
        description: 'After the debounce, on Enter, and immediately when cleared.',
      },
    ],
    a11y: [
      'Enter searches immediately; Escape clears a non-empty field (and does nothing otherwise, so an enclosing dialog can still close).',
      'Both keys are ignored during IME composition, so confirming a Japanese candidate does not trigger a search.',
      'The clear button has its own name and returns focus to the input.',
      '`type="search"` with `enterkeyhint="search"` gives a Search key on phone keyboards.',
    ],
  },
  {
    id: 'select-field',
    name: 'SelectField',
    category: 'Inputs',
    kind: 'component',
    summary: 'A native `<select>` with the field styling, hint and error handling.',
    exports: ['SelectField'],
    demo: () => import('./demos/SelectFieldDemo.vue'),
    code: code('SelectFieldDemo'),
    props: [
      FIELD.label,
      FIELD.labelHidden,
      {
        name: 'options',
        type: '{ value: string | number, label: string, disabled?: boolean }[]',
        default: 'required',
        description: 'Choices in display order.',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: '—',
        description: 'Shown while nothing is selected; cannot be chosen again afterwards.',
      },
      FIELD.hint,
      FIELD.error,
      FIELD.required,
      FIELD.requiredLabel,
      FIELD.disabled,
      FIELD.id,
      model('string | number | null', 'null'),
    ],
    events: [BLUR],
    a11y: [
      'A native `<select>`: the platform picker on phones, type-to-select and full screen reader support.',
      'The chevron icon is decorative (`aria-hidden`).',
      'Prefer `Combobox` when there are more than about 15 options.',
    ],
  },

  // Selection
  {
    id: 'toggle',
    name: 'Toggle',
    category: 'Selection',
    kind: 'component',
    summary: 'An on/off switch for settings that apply immediately.',
    exports: ['Toggle'],
    demo: () => import('./demos/ToggleDemo.vue'),
    code: code('ToggleDemo'),
    props: [
      {
        name: 'label',
        type: 'string',
        default: '—',
        description: 'Visible label. The default slot can be used instead.',
      },
      {
        name: 'description',
        type: 'string',
        default: '—',
        description: 'Secondary text, read as the description.',
      },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the switch.' },
      model('boolean', 'false'),
    ],
    slots: [{ name: 'default', props: '—', description: 'Rich label content instead of `label`.' }],
    a11y: [
      'A `<button role="switch">` with `aria-checked`; Space and Enter toggle it.',
      'The whole row is the switch, so the label is a large touch target.',
      'Named by the label (`aria-labelledby`) and described by `description` (`aria-describedby`).',
      'Use a Checkbox instead when the change only applies after a Save button.',
    ],
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'Selection',
    kind: 'component',
    summary: 'A native checkbox with label, description and an indeterminate state.',
    exports: ['Checkbox'],
    demo: () => import('./demos/CheckboxDemo.vue'),
    code: code('CheckboxDemo'),
    props: [
      {
        name: 'label',
        type: 'string',
        default: '—',
        description: 'Visible label. The default slot can be used instead.',
      },
      { name: 'description', type: 'string', default: '—', description: 'Secondary text.' },
      {
        name: 'indeterminate',
        type: 'boolean',
        default: 'false',
        description: 'Shows a dash for “some selected”. The browser clears it when toggled.',
      },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the box.' },
      { name: 'required', type: 'boolean', default: 'false', description: 'Native `required`.' },
      FIELD.id,
      model('boolean', 'false'),
    ],
    slots: [{ name: 'default', props: '—', description: 'Rich label content instead of `label`.' }],
    a11y: [
      'A real `<input type="checkbox">` inside its `<label>`: Space toggles, clicking the text toggles.',
      '`indeterminate` is set as the DOM property, so screen readers announce “mixed”.',
      'With a description, the name comes from the title alone and the description is read as a description.',
    ],
  },
  {
    id: 'radio-group',
    name: 'RadioGroup',
    category: 'Selection',
    kind: 'component',
    summary: 'Pick exactly one of a few options, each with an optional description.',
    exports: ['RadioGroup'],
    demo: () => import('./demos/RadioGroupDemo.vue'),
    code: code('RadioGroupDemo'),
    props: [
      {
        name: 'label',
        type: 'string',
        default: 'required',
        description: 'Rendered as the `<legend>` of the fieldset.',
      },
      FIELD.labelHidden,
      {
        name: 'options',
        type: '{ value: string | number, label: string, description?: string, disabled?: boolean }[]',
        default: 'required',
        description: 'Choices in display order.',
      },
      FIELD.hint,
      FIELD.error,
      {
        name: 'orientation',
        type: "'vertical' | 'horizontal'",
        default: "'vertical'",
        description: 'Layout of the options.',
      },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the group.' },
      {
        name: 'required',
        type: 'boolean',
        default: 'false',
        description: 'Native `required` on every radio button.',
      },
      {
        name: 'name',
        type: 'string',
        default: '—',
        description: 'Form field name. Generated when omitted so two groups never merge.',
      },
      model('string | number | null', 'null'),
    ],
    a11y: [
      'A `<fieldset>` with a `<legend>`: the group name is read when focus enters it.',
      'Native radio buttons: Tab reaches the group once, arrow keys move and select.',
      'Hint and error describe the fieldset; an error sets `aria-invalid`.',
    ],
  },
  {
    id: 'segmented-control',
    name: 'SegmentedControl',
    category: 'Selection',
    kind: 'component',
    summary: 'A compact row of mutually exclusive choices, e.g. a view switcher.',
    exports: ['SegmentedControl'],
    demo: () => import('./demos/SegmentedControlDemo.vue'),
    code: code('SegmentedControlDemo'),
    props: [
      {
        name: 'label',
        type: 'string',
        default: 'required',
        description: 'Accessible name of the group. Hidden unless `labelVisible`.',
      },
      { name: 'labelVisible', type: 'boolean', default: 'false', description: 'Shows the label.' },
      {
        name: 'options',
        type: '{ value: string | number, label: string, disabled?: boolean }[]',
        default: 'required',
        description: 'Segments in display order. Keep it to 2–5 short labels.',
      },
      { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Segment height.' },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables every segment.',
      },
      {
        name: 'name',
        type: 'string',
        default: '—',
        description: 'Form field name; generated if omitted.',
      },
      model('string | number | null', 'null'),
    ],
    a11y: [
      'Native radio buttons styled as segments inside `role="radiogroup"`: arrow keys move the selection, Tab leaves the group.',
      'The radio buttons are visually hidden, not removed, so focus is visible on the segment (`peer-focus-visible`).',
      'Use `Tabs` instead when each choice reveals a different panel of content.',
    ],
  },
  {
    id: 'combobox',
    name: 'Combobox',
    category: 'Selection',
    kind: 'component',
    summary: 'Type to filter a list of options, then pick one. For long lists such as airports.',
    exports: ['Combobox'],
    demo: () => import('./demos/ComboboxDemo.vue'),
    code: code('ComboboxDemo'),
    props: [
      FIELD.label,
      FIELD.labelHidden,
      {
        name: 'options',
        type: '{ value: string | number, label: string, disabled?: boolean }[]',
        default: 'required',
        description: 'All choices; filtered by label as the user types.',
      },
      FIELD.placeholder,
      FIELD.hint,
      FIELD.error,
      FIELD.required,
      FIELD.requiredLabel,
      FIELD.disabled,
      FIELD.id,
      {
        name: 'noResultsLabel',
        type: 'string',
        default: "'No results'",
        description: 'Shown and announced when nothing matches.',
      },
      {
        name: 'toggleLabel',
        type: 'string',
        default: "'Show options'",
        description: 'Name of the pointer-only button that opens the list.',
      },
      model(
        'string | number | null',
        'null',
        'Value of the selected option, bound with `v-model`.',
      ),
    ],
    events: [BLUR],
    a11y: [
      'WAI-ARIA combobox with list autocomplete: `role="combobox"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`.',
      'ArrowDown / ArrowUp open the list and move the active option (focus stays in the input), Enter selects, Escape closes the list or clears the field, Tab closes it.',
      'Filtering waits for IME composition to end, so the list does not jump under a half-typed character.',
      '“No results” is announced from an always-mounted `role="status"` region.',
      'Disabled options stay visible with `aria-disabled` and are skipped by the arrow keys.',
    ],
  },

  // Containers
  {
    id: 'card',
    name: 'Card',
    category: 'Containers',
    kind: 'component',
    summary: 'A rounded surface that groups related content, with optional header and footer.',
    exports: ['Card'],
    demo: () => import('./demos/CardDemo.vue'),
    code: code('CardDemo'),
    props: [
      { name: 'title', type: 'string', default: '—', description: 'Heading of the card.' },
      { name: 'description', type: 'string', default: '—', description: 'Text under the title.' },
      {
        name: 'headingLevel',
        type: '1 | 2 | 3 | 4 | 5 | 6',
        default: '2',
        description: 'Level of the title heading. Match the page outline.',
      },
      {
        name: 'material',
        type: 'boolean',
        default: 'false',
        description: 'Translucent surface for cards placed over imagery or color.',
      },
    ],
    slots: [
      { name: 'default', props: '—', description: 'Body content.' },
      { name: 'title', props: '—', description: 'Rich title instead of `title`.' },
      { name: 'description', props: '—', description: 'Rich description.' },
      { name: 'actions', props: '—', description: 'Controls at the trailing edge of the header.' },
      { name: 'footer', props: '—', description: 'Actions at the bottom, aligned to the end.' },
    ],
    a11y: [
      'A `<section>` labelled by its title, so a titled card is a named region screen reader users can jump to.',
      'Choose `headingLevel` so headings never skip a level (here: page h1, section h2, card h3).',
      'Without a title the section has no name and is not exposed as a landmark.',
    ],
  },
  {
    id: 'grouped-list',
    name: 'GroupedList & ListRow',
    category: 'Containers',
    kind: 'component',
    summary:
      'Inset grouped rows for settings and detail screens. A row becomes a link or button when given `href`, `to` or a click listener.',
    exports: ['GroupedList', 'ListRow'],
    demo: () => import('./demos/GroupedListDemo.vue'),
    code: code('GroupedListDemo'),
    props: [
      {
        name: 'header',
        type: 'string',
        default: '—',
        description: 'Caption above the group; names the list.',
      },
      {
        name: 'footer',
        type: 'string',
        default: '—',
        description: 'Explanatory text below the group; describes the list.',
      },
      {
        name: 'headingLevel',
        type: '2 | 3 | 4 | 5 | 6',
        default: '2',
        description: 'Level of the header heading. Match the page outline.',
      },
    ],
    slots: [
      { name: 'default', props: '—', description: '`ListRow` components.' },
      { name: 'header', props: '—', description: 'Rich header content.' },
      { name: 'footer', props: '—', description: 'Rich footer content.' },
    ],
    parts: [
      {
        name: 'ListRow',
        kind: 'component',
        props: [
          { name: 'title', type: 'string', default: '—', description: 'Primary text.' },
          { name: 'subtitle', type: 'string', default: '—', description: 'Secondary line.' },
          {
            name: 'value',
            type: 'string',
            default: '—',
            description: 'Trailing value, e.g. the current setting.',
          },
          { name: 'href', type: 'string', default: '—', description: 'Makes the row a link.' },
          {
            name: 'to',
            type: 'string | RouteLocation',
            default: '—',
            description: 'Router location; uses the app’s `RouterLink` when installed.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Disables a button row.',
          },
        ],
        slots: [
          { name: 'default', props: '—', description: 'Replaces title and subtitle.' },
          { name: 'leading', props: '—', description: 'Icon or avatar before the text.' },
          { name: 'trailing', props: '—', description: 'Control after the text, e.g. a Toggle.' },
        ],
      },
    ],
    a11y: [
      'The group is a `<ul role="list">` named by its header (`aria-labelledby`) and described by its footer.',
      'An interactive row renders one real `<a>` or `<button>` filling the row, with a decorative chevron.',
      'Rows with a click listener become buttons; plain rows stay static text, so nothing pretends to be clickable.',
      'Put a `Toggle` in a static row (default slot) rather than making the row itself clickable.',
    ],
  },

  // Overlays
  {
    id: 'dialog',
    name: 'Dialog',
    category: 'Overlays',
    kind: 'component',
    summary:
      'A modal built on the native `<dialog>` element. Centered, as a bottom sheet, or as a side panel.',
    exports: ['Dialog'],
    demo: () => import('./demos/DialogDemo.vue'),
    code: code('DialogDemo'),
    props: [
      {
        name: 'title',
        type: 'string',
        default: 'required',
        description: 'Heading and accessible name.',
      },
      {
        name: 'titleHidden',
        type: 'boolean',
        default: 'false',
        description: 'Hides the title visually only.',
      },
      {
        name: 'description',
        type: 'string',
        default: '—',
        description: 'Text under the title; becomes the accessible description.',
      },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Maximum width.' },
      {
        name: 'placement',
        type: "'center' | 'sheet' | 'side'",
        default: "'center'",
        description:
          '`sheet` slides up on phones; `side` is a full-height panel at the leading edge.',
      },
      {
        name: 'dismissible',
        type: 'boolean',
        default: 'true',
        description: 'Escape, the close button and a backdrop click close it.',
      },
      {
        name: 'alert',
        type: 'boolean',
        default: 'false',
        description: '`role="alertdialog"`: no close button and no backdrop dismissal.',
      },
      { name: 'closeLabel', type: 'string', default: "'Close'", description: 'Close button name.' },
      {
        name: 'open',
        type: 'boolean',
        default: 'false',
        description: 'Bound with `v-model:open`.',
      },
    ],
    events: [
      { name: 'close', payload: '—', description: 'Fired after every close, whatever caused it.' },
    ],
    slots: [
      { name: 'default', props: '—', description: 'Scrollable body.' },
      { name: 'footer', props: '—', description: 'Action buttons, aligned to the end.' },
    ],
    a11y: [
      '`showModal()` makes the rest of the page inert and keeps focus inside without a custom trap.',
      'Focus goes to an element marked `autofocus` or `data-autofocus`, otherwise to the dialog itself so its title is read first.',
      'Focus returns to the element that opened it when it closes.',
      'Named by the title (`aria-labelledby`) and described by `description` (`aria-describedby`).',
      'A drag that starts inside the panel and ends on the backdrop does not close it.',
    ],
  },
  {
    id: 'sheet',
    name: 'Sheet',
    category: 'Overlays',
    kind: 'component',
    summary:
      'A Dialog that slides up from the bottom edge on small screens and is centered on wide ones.',
    exports: ['Sheet'],
    demo: () => import('./demos/SheetDemo.vue'),
    code: code('SheetDemo'),
    props: [
      { name: 'title', type: 'string', default: 'required', description: 'Heading and name.' },
      {
        name: 'titleHidden',
        type: 'boolean',
        default: 'false',
        description: 'Hides the title visually.',
      },
      { name: 'description', type: 'string', default: '—', description: 'Accessible description.' },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'Width on wide screens.',
      },
      {
        name: 'dismissible',
        type: 'boolean',
        default: 'true',
        description: 'Escape, the close button and a backdrop click close it.',
      },
      { name: 'closeLabel', type: 'string', default: "'Close'", description: 'Close button name.' },
      {
        name: 'open',
        type: 'boolean',
        default: 'false',
        description: 'Bound with `v-model:open`.',
      },
    ],
    events: [{ name: 'close', payload: '—', description: 'Fired after every close.' }],
    slots: [
      { name: 'default', props: '—', description: 'Body.' },
      { name: 'footer', props: '—', description: 'Actions.' },
    ],
    a11y: [
      'Same behaviour as `Dialog`: native modal, focus moved in and restored, Escape closes.',
      'Respects the device safe area, so the bottom edge clears the home indicator on phones.',
    ],
  },
  {
    id: 'alert-dialog',
    name: 'AlertDialog & useConfirm',
    category: 'Overlays',
    kind: 'component',
    summary:
      'Asks for a decision before something consequential. Use the component directly, or `await confirm()` from `useConfirm` with one shared dialog in `ConfirmProvider`.',
    exports: ['AlertDialog', 'ConfirmProvider', 'useConfirm'],
    demo: () => import('./demos/AlertDialogDemo.vue'),
    code: code('AlertDialogDemo'),
    props: [
      { name: 'title', type: 'string', default: 'required', description: 'The question.' },
      {
        name: 'message',
        type: 'string',
        default: '—',
        description: 'The consequence; wired as the accessible description.',
      },
      {
        name: 'confirmLabel',
        type: 'string',
        default: "'Confirm'",
        description: 'Confirm button text.',
      },
      {
        name: 'cancelLabel',
        type: 'string',
        default: "'Cancel'",
        description: 'Cancel button text.',
      },
      {
        name: 'tone',
        type: "'accent' | 'danger'",
        default: "'accent'",
        description: '`danger` styles confirm as destructive and focuses Cancel first.',
      },
      {
        name: 'open',
        type: 'boolean',
        default: 'false',
        description: 'Bound with `v-model:open`.',
      },
    ],
    events: [
      { name: 'confirm', payload: '—', description: 'The confirm button was pressed.' },
      { name: 'cancel', payload: '—', description: 'Closed any other way: Cancel or Escape.' },
    ],
    slots: [{ name: 'default', props: '—', description: 'Extra content under the message.' }],
    parts: [
      {
        name: 'ConfirmProvider',
        kind: 'component',
        props: [],
        slots: [
          {
            name: 'default',
            props: '—',
            description: 'The app. Everything inside can call `useConfirm()`.',
          },
        ],
      },
      {
        name: 'useConfirm',
        kind: 'composable',
        props: [
          { name: 'title', type: 'string', default: 'required', description: 'The question.' },
          { name: 'message', type: 'string', default: '—', description: 'The consequence.' },
          {
            name: 'confirmLabel',
            type: 'string',
            default: "'Confirm'",
            description: 'Confirm text.',
          },
          { name: 'cancelLabel', type: 'string', default: "'Cancel'", description: 'Cancel text.' },
          {
            name: 'tone',
            type: "'accent' | 'danger'",
            default: "'accent'",
            description: 'Styling.',
          },
        ],
        returns: [
          {
            name: 'confirm(options)',
            type: 'Promise<boolean>',
            description:
              '`true` for confirm, `false` for cancel or Escape. A newer call cancels a pending one.',
          },
        ],
      },
    ],
    a11y: [
      '`role="alertdialog"` with the message as `aria-describedby`, so both are read when it opens.',
      'No close button and no backdrop dismissal: the user answers with a button, or Escape to cancel.',
      'With `tone="danger"` initial focus is on Cancel, so a stray Enter never destroys anything.',
      'Focus returns to the button that asked the question.',
    ],
  },
  {
    id: 'popover',
    name: 'Popover',
    category: 'Overlays',
    kind: 'component',
    summary:
      'A non-modal panel of related content behind a button, e.g. filters. For a list of actions use `Menu`.',
    exports: ['Popover'],
    demo: () => import('./demos/PopoverDemo.vue'),
    code: code('PopoverDemo'),
    props: [
      {
        name: 'label',
        type: 'string',
        default: 'required',
        description: 'Trigger text and accessible name.',
      },
      {
        name: 'labelHidden',
        type: 'boolean',
        default: 'false',
        description: 'Shows only the icon slot; the label stays as the name.',
      },
      {
        name: 'align',
        type: "'start' | 'end'",
        default: "'start'",
        description: 'Panel alignment.',
      },
      {
        name: 'variant',
        type: "'filled' | 'tinted' | 'gray' | 'plain'",
        default: "'gray'",
        description: 'Trigger button look.',
      },
      {
        name: 'open',
        type: 'boolean',
        default: 'false',
        description: 'Bound with `v-model:open`.',
      },
    ],
    slots: [
      {
        name: 'default',
        props: '{ close }',
        description: 'Panel content. `close({ returnFocus })` hides it.',
      },
      { name: 'icon', props: '—', description: 'Decorative trigger icon.' },
    ],
    a11y: [
      'A disclosure: the trigger has `aria-expanded` and `aria-controls` pointing at the panel.',
      'Escape closes it and returns focus to the trigger, without closing an enclosing dialog.',
      'A press outside closes it; focus is not trapped, so Tab moves on naturally.',
    ],
  },
  {
    id: 'menu',
    name: 'Menu',
    category: 'Overlays',
    kind: 'component',
    summary: 'A menu button with a list of actions, following the WAI-ARIA menu button pattern.',
    exports: ['Menu'],
    demo: () => import('./demos/MenuDemo.vue'),
    code: code('MenuDemo'),
    props: [
      {
        name: 'label',
        type: 'string',
        default: 'required',
        description: 'Trigger text and name of the menu.',
      },
      {
        name: 'labelHidden',
        type: 'boolean',
        default: 'false',
        description: 'Shows only the icon slot in the trigger.',
      },
      {
        name: 'items',
        type: "{ id, label, icon?, tone?: 'default' | 'danger', disabled? }[]",
        default: 'required',
        description: 'Actions. `id` is emitted with `select`.',
      },
      {
        name: 'align',
        type: "'start' | 'end'",
        default: "'start'",
        description: 'Panel alignment.',
      },
      {
        name: 'variant',
        type: "'filled' | 'tinted' | 'gray' | 'plain'",
        default: "'gray'",
        description: 'Trigger button look.',
      },
    ],
    events: [{ name: 'select', payload: 'string', description: 'Id of the chosen item.' }],
    slots: [{ name: 'icon', props: '—', description: 'Decorative trigger icon.' }],
    a11y: [
      'Trigger: `aria-haspopup="menu"` and `aria-expanded`. Enter, Space or ArrowDown open it on the first item; ArrowUp opens it on the last.',
      'Inside: ArrowUp/ArrowDown move (wrapping), Home/End jump, typing a letter jumps to the next matching item.',
      'Escape closes and returns focus to the trigger; Tab closes and moves on.',
      'Disabled items stay focusable with `aria-disabled` so they can still be discovered.',
    ],
  },

  // Data
  {
    id: 'data-table',
    name: 'DataTable',
    category: 'Data',
    kind: 'component',
    summary:
      'A sortable table with loading, empty and error states. Sorts locally or reports sort changes for the server.',
    exports: ['DataTable'],
    demo: () => import('./demos/DataTableDemo.vue'),
    code: code('DataTableDemo'),
    props: [
      {
        name: 'columns',
        type: "{ key, label, sortable?, align?: 'start' | 'end', width? }[]",
        default: 'required',
        description: 'Column definitions. `key` also names the `cell-<key>` slot.',
      },
      { name: 'rows', type: 'Record<string, any>[]', default: 'required', description: 'Data.' },
      {
        name: 'rowKey',
        type: 'string | (row) => string | number',
        default: 'required',
        description: 'Stable row identity, so focus survives sorting and paging.',
      },
      {
        name: 'caption',
        type: 'string',
        default: 'required',
        description: 'Names the table and its scroll region.',
      },
      {
        name: 'captionHidden',
        type: 'boolean',
        default: 'false',
        description: 'Hides the caption visually.',
      },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Shows skeleton rows.' },
      {
        name: 'loadingLabel',
        type: 'string',
        default: "'Loading'",
        description: 'Announced while loading.',
      },
      { name: 'skeletonRows', type: 'number', default: '5', description: 'Placeholder rows.' },
      {
        name: 'error',
        type: 'string',
        default: '—',
        description: 'Replaces the rows with an error state and a retry button.',
      },
      {
        name: 'errorTitle',
        type: 'string',
        default: "'Could not load data'",
        description: 'Error state heading.',
      },
      {
        name: 'emptyTitle',
        type: 'string',
        default: "'No results'",
        description: 'Empty state heading.',
      },
      { name: 'emptyDescription', type: 'string', default: '—', description: 'Empty state text.' },
      {
        name: 'stateHeadingLevel',
        type: '2 | 3 | 4 | 5 | 6',
        default: '3',
        description: 'Heading level of the empty and error states.',
      },
      {
        name: 'maxHeight',
        type: 'string',
        default: '—',
        description:
          'CSS height, e.g. `24rem`. Scrolls the rows inside the table with the header row pinned.',
      },
      {
        name: 'manualSort',
        type: 'boolean',
        default: 'false',
        description: 'Keep `rows` in order and only report sort changes (server-side sorting).',
      },
      {
        name: 'sort',
        type: "{ key: string, order: 'asc' | 'desc' } | null",
        default: 'null',
        description: 'Bound with `v-model:sort`.',
      },
    ],
    events: [
      { name: 'retry', payload: '—', description: 'The error state’s retry button was pressed.' },
    ],
    slots: [
      {
        name: 'cell-<key>',
        props: '{ row, value }',
        description: 'Custom cell content for a column.',
      },
      { name: 'empty', props: '—', description: 'Replaces the default empty state.' },
    ],
    a11y: [
      'A real `<table>` with `<caption>`, `<th scope="col">` and `aria-sort` on the sorted column.',
      'Sortable headers are buttons; the arrow icons are decorative.',
      'The scroll container is a focusable `role="region"` named by the caption, so keyboard users can scroll wide tables.',
      'While loading: `aria-busy` on the table plus a visually hidden status message.',
      'The error state uses `role="alert"`, because it replaces content the user was waiting for.',
    ],
  },
  {
    id: 'pagination',
    name: 'Pagination',
    category: 'Data',
    kind: 'component',
    summary: 'Page links with a range summary and an optional page-size select.',
    exports: ['Pagination'],
    demo: () => import('./demos/PaginationDemo.vue'),
    code: code('PaginationDemo'),
    props: [
      { name: 'total', type: 'number', default: 'required', description: 'Total number of items.' },
      {
        name: 'label',
        type: 'string',
        default: "'Pagination'",
        description: 'Name of the navigation landmark.',
      },
      { name: 'locale', type: 'string', default: '—', description: 'BCP 47 locale for numbers.' },
      {
        name: 'siblingCount',
        type: 'number',
        default: '1',
        description: 'Pages shown either side of the current one.',
      },
      {
        name: 'pageSizeOptions',
        type: 'number[]',
        default: '—',
        description: 'Offers a page-size select when given.',
      },
      {
        name: 'previousLabel',
        type: 'string',
        default: "'Previous'",
        description: 'Previous button text.',
      },
      { name: 'nextLabel', type: 'string', default: "'Next'", description: 'Next button text.' },
      {
        name: 'pageSizeLabel',
        type: 'string',
        default: "'Rows per page'",
        description: 'Label of the page-size select.',
      },
      {
        name: 'pageLabel',
        type: '(page: string) => string',
        default: '`Page ${page}`',
        description: 'Accessible name of each page button.',
      },
      {
        name: 'summary',
        type: '({ from, to, total }) => string',
        default: '`Showing ${from}–${to} of ${total}`',
        description: 'Range summary line. Receives formatted numbers.',
      },
      { name: 'page', type: 'number', default: '1', description: 'Bound with `v-model:page`.' },
      {
        name: 'pageSize',
        type: 'number',
        default: '10',
        description: 'Bound with `v-model:page-size`. Changing it returns to page 1.',
      },
    ],
    a11y: [
      'A `<nav>` landmark named by `label`; give it a specific name when a page has more than one.',
      'The current page has `aria-current="page"`; each page button is named “Page N”.',
      'The summary is `aria-live="polite"`, so the new range is announced after a page change.',
      'Previous and Next keep their text for screen readers even when it is hidden on narrow screens.',
    ],
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'Data',
    kind: 'component',
    summary: 'A small status label such as “Active” or a count.',
    exports: ['Badge'],
    demo: () => import('./demos/BadgeDemo.vue'),
    code: code('BadgeDemo'),
    props: [
      {
        name: 'tone',
        type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger'",
        default: "'neutral'",
        description: 'Color of the badge.',
      },
    ],
    slots: [{ name: 'default', props: '—', description: 'Short text.' }],
    a11y: [
      'Plain text: the meaning is always in the words, never only in the color.',
      'Tones use tinted backgrounds with text colors that keep contrast in light and dark mode.',
    ],
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'Data',
    kind: 'component',
    summary: 'A photo, or initials on a color derived from the name when there is no photo.',
    exports: ['Avatar'],
    demo: () => import('./demos/AvatarDemo.vue'),
    code: code('AvatarDemo'),
    props: [
      {
        name: 'name',
        type: 'string',
        default: 'required',
        description: 'Full name: the accessible name, the initials and the color come from it.',
      },
      {
        name: 'src',
        type: 'string',
        default: '—',
        description: 'Photo URL. Falls back to initials if it fails to load.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg' | 'xl'",
        default: "'md'",
        description: 'Diameter.',
      },
    ],
    a11y: [
      'Exposed as an image named by `name` (`<img alt>` or `role="img"` with `aria-label`).',
      'Initials are computed per grapheme, so combining marks and emoji are never cut in half. Japanese, Chinese and Korean names show the family name instead (山田 太郎 → 山田).',
      'When the person’s name is already visible next to it, the avatar repeats it; that is usually acceptable, or hide the visible text from assistive technology as this demo does.',
    ],
  },

  // Feedback
  {
    id: 'spinner',
    name: 'Spinner',
    category: 'Feedback',
    kind: 'component',
    summary: 'An indeterminate activity indicator with an announced label.',
    exports: ['Spinner'],
    demo: () => import('./demos/SpinnerDemo.vue'),
    code: code('SpinnerDemo'),
    props: [
      {
        name: 'label',
        type: 'string',
        default: "'Loading'",
        description: 'Announced to assistive technology; never shown.',
      },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Diameter.' },
      {
        name: 'color',
        type: "'muted' | 'inherit'",
        default: "'muted'",
        description: '`inherit` takes the surrounding text color, e.g. inside a filled button.',
      },
    ],
    a11y: [
      '`role="status"` with a visually hidden label, so the activity is announced politely.',
      'The animated SVG is `aria-hidden`; reduced-motion settings stop the animation.',
      'Prefer `ProgressBar` when the amount of work is known.',
    ],
  },
  {
    id: 'progress-bar',
    name: 'ProgressBar',
    category: 'Feedback',
    kind: 'component',
    summary: 'Shows how much of a task is done, or that work is happening when it is unknown.',
    exports: ['ProgressBar'],
    demo: () => import('./demos/ProgressBarDemo.vue'),
    code: code('ProgressBarDemo'),
    props: [
      {
        name: 'label',
        type: 'string',
        default: 'required',
        description: 'Visible label and accessible name.',
      },
      {
        name: 'labelHidden',
        type: 'boolean',
        default: 'false',
        description: 'Hides the label visually.',
      },
      {
        name: 'value',
        type: 'number | null',
        default: 'null',
        description: 'Current value. `null` shows indeterminate activity.',
      },
      { name: 'min', type: 'number', default: '0', description: 'Start of the range.' },
      { name: 'max', type: 'number', default: '100', description: 'End of the range.' },
      {
        name: 'indeterminate',
        type: 'boolean',
        default: 'false',
        description: 'Activity without a known amount.',
      },
      {
        name: 'valueText',
        type: 'string',
        default: '—',
        description: 'Human-readable value such as “3 of 8 files”. Defaults to the percentage.',
      },
    ],
    a11y: [
      '`role="progressbar"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`.',
      'Indeterminate bars omit `aria-valuenow`, which is how assistive technology knows the amount is unknown.',
      'Named by the visible label through `aria-labelledby`.',
    ],
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    category: 'Feedback',
    kind: 'component',
    summary: 'A shimmering placeholder in the shape of content that is still loading.',
    exports: ['Skeleton'],
    demo: () => import('./demos/SkeletonDemo.vue'),
    code: code('SkeletonDemo'),
    props: [
      {
        name: 'shape',
        type: "'text' | 'rect' | 'circle'",
        default: "'text'",
        description: 'One line of text, a block, or an avatar circle. Size it with classes.',
      },
    ],
    a11y: [
      'Decorative and `aria-hidden`: put `aria-busy` and a status message on the region being loaded instead.',
      'The shimmer runs once and stops when the user prefers reduced motion.',
    ],
  },
  {
    id: 'empty-state',
    name: 'EmptyState',
    category: 'Feedback',
    kind: 'component',
    summary: 'Explains why there is nothing to show and what to do next.',
    exports: ['EmptyState'],
    demo: () => import('./demos/EmptyStateDemo.vue'),
    code: code('EmptyStateDemo'),
    props: [
      { name: 'title', type: 'string', default: 'required', description: 'Short heading.' },
      { name: 'description', type: 'string', default: '—', description: 'Explanation.' },
      {
        name: 'headingLevel',
        type: '1 | 2 | 3 | 4 | 5 | 6',
        default: '2',
        description: 'Level of the title heading.',
      },
    ],
    slots: [
      { name: 'icon', props: '—', description: 'Decorative illustration.' },
      { name: 'actions', props: '—', description: 'Buttons that resolve the empty state.' },
    ],
    a11y: [
      'The title is a real heading, so users scanning by headings find it.',
      'The icon is `aria-hidden`; the text carries the message.',
    ],
  },
  {
    id: 'error-state',
    name: 'ErrorState',
    category: 'Feedback',
    kind: 'component',
    summary: 'Tells the user something failed and offers a retry.',
    exports: ['ErrorState'],
    demo: () => import('./demos/ErrorStateDemo.vue'),
    code: code('ErrorStateDemo'),
    props: [
      { name: 'title', type: 'string', default: "'Something went wrong'", description: 'Heading.' },
      {
        name: 'message',
        type: 'string',
        default: '—',
        description: 'What happened, in plain words.',
      },
      {
        name: 'retryLabel',
        type: 'string',
        default: "'Try again'",
        description: 'Retry button text. An empty string hides the button.',
      },
      {
        name: 'retrying',
        type: 'boolean',
        default: 'false',
        description: 'Shows a spinner on the retry button.',
      },
      {
        name: 'alert',
        type: 'boolean',
        default: 'false',
        description: '`role="alert"`: announce at once. Use when it replaces awaited content.',
      },
      {
        name: 'headingLevel',
        type: '1 | 2 | 3 | 4 | 5 | 6',
        default: '2',
        description: 'Level of the title heading.',
      },
    ],
    events: [{ name: 'retry', payload: '—', description: 'The retry button was pressed.' }],
    a11y: [
      'With `alert` the whole state is a `role="alert"` live region.',
      'The retry button keeps its name while `retrying` and reports `aria-busy`.',
    ],
  },
  {
    id: 'toast',
    name: 'Toast',
    category: 'Feedback',
    kind: 'component',
    summary:
      'Short, non-blocking notifications. Call `useToast().show()` anywhere inside a `ToastProvider`.',
    exports: ['ToastProvider', 'useToast'],
    demo: () => import('./demos/ToastDemo.vue'),
    code: code('ToastDemo'),
    props: [
      {
        name: 'max',
        type: 'number',
        default: '3',
        description: 'Most toasts on screen at once; the oldest goes first.',
      },
      {
        name: 'dismissLabel',
        type: 'string',
        default: "'Dismiss notification'",
        description: 'Name of each toast’s close button.',
      },
    ],
    slots: [
      {
        name: 'default',
        props: '—',
        description: 'The app. Everything inside can call `useToast()`.',
      },
    ],
    parts: [
      {
        name: 'useToast',
        kind: 'composable',
        props: [
          { name: 'title', type: 'string', default: 'required', description: 'Main line.' },
          { name: 'description', type: 'string', default: '—', description: 'Second line.' },
          {
            name: 'tone',
            type: "'neutral' | 'success' | 'danger'",
            default: "'neutral'",
            description: '`danger` is announced assertively.',
          },
          {
            name: 'duration',
            type: 'number',
            default: '5000 (danger: 8000)',
            description: 'Milliseconds on screen. `0` or `Infinity` keeps it until dismissed.',
          },
        ],
        returns: [
          {
            name: 'show(options)',
            type: 'string',
            description: 'Shows a toast and returns its id.',
          },
          { name: 'dismiss(id)', type: 'void', description: 'Removes a toast early.' },
        ],
      },
    ],
    a11y: [
      'Two always-mounted live regions: `role="status"` for neutral and success, `role="alert"` for errors.',
      'Each new toast is announced on its own (`aria-atomic="false"`), not the whole stack again.',
      'The timer pauses while the pointer or keyboard focus is on a toast (WCAG 2.2.1 Timing adjustable).',
      'Never put the only way to do something in a toast: it disappears.',
    ],
  },
  {
    id: 'error-boundary',
    name: 'ErrorBoundary',
    category: 'Feedback',
    kind: 'component',
    summary:
      'Contains errors thrown by the components inside it and shows a fallback with “Try again”. Every demo on this page is wrapped in one.',
    exports: ['ErrorBoundary'],
    demo: () => import('./demos/ErrorBoundaryDemo.vue'),
    code: code('ErrorBoundaryDemo'),
    props: [
      {
        name: 'fallbackTitle',
        type: 'string',
        default: "'Something went wrong'",
        description: 'Fallback heading.',
      },
      {
        name: 'fallbackMessage',
        type: 'string',
        default: "'This part of the page could not be shown.'",
        description: 'Fallback text. The raw error is never shown to users.',
      },
      {
        name: 'retryLabel',
        type: 'string',
        default: "'Try again'",
        description: 'Retry button text.',
      },
      {
        name: 'headingLevel',
        type: '1 | 2 | 3 | 4 | 5 | 6',
        default: '2',
        description: 'Level of the fallback heading.',
      },
    ],
    events: [
      {
        name: 'error',
        payload: '(error: unknown, info: string)',
        description: 'Report the error here; `info` says where Vue caught it.',
      },
    ],
    slots: [
      { name: 'default', props: '—', description: 'The protected content.' },
      { name: 'fallback', props: '{ error, reset }', description: 'Custom fallback.' },
    ],
    a11y: [
      'The default fallback is an `ErrorState` with `role="alert"`, so the failure is announced.',
      '“Try again” remounts the content from scratch with fresh state.',
      'Errors stop at the boundary (`onErrorCaptured` returns false), so the rest of the page keeps working.',
    ],
  },

  // Navigation
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'Navigation',
    kind: 'component',
    summary:
      'Switches between panels of related content. The Usage / Props / Accessibility switcher on this page is this component.',
    exports: ['Tabs'],
    demo: () => import('./demos/TabsDemo.vue'),
    code: code('TabsDemo'),
    props: [
      {
        name: 'tabs',
        type: '{ id: string, label: string, disabled?: boolean }[]',
        default: 'required',
        description: 'Tabs in order. `id` names the `panel-<id>` slot.',
      },
      { name: 'label', type: 'string', default: 'required', description: 'Name of the tab list.' },
      model(
        'string',
        '—',
        'Id of the selected tab, bound with `v-model`. Falls back to the first enabled tab.',
      ),
    ],
    slots: [{ name: 'panel-<id>', props: '—', description: 'Content of each panel.' }],
    a11y: [
      'WAI-ARIA tabs with automatic activation: `role="tablist"`, `tab` and `tabpanel`, linked with `aria-controls` and `aria-labelledby`.',
      'ArrowLeft / ArrowRight move and select (wrapping, skipping disabled tabs); Home / End jump to the ends.',
      'Only the selected tab is in the Tab order (roving `tabindex`); the panel itself is focusable next.',
      'Every panel stays rendered (inactive ones `hidden`), so `aria-controls` always points at an element.',
    ],
  },
  {
    id: 'app-shell',
    name: 'App shell',
    category: 'Navigation',
    kind: 'component',
    summary:
      '`SplitView` lays out a sidebar column and the main content, turning the sidebar into an off-canvas dialog on narrow screens. It already frames this whole app, so the example shows the pieces that go inside it: `Sidebar`, `Toolbar` and `SkipLink`.',
    exports: ['SplitView', 'Sidebar', 'Toolbar', 'SkipLink'],
    demo: () => import('./demos/AppShellDemo.vue'),
    code: code('AppShellDemo'),
    props: [
      {
        name: 'sidebarLabel',
        type: 'string',
        default: "'Sidebar'",
        description: 'Title of the off-canvas dialog (visually hidden).',
      },
      {
        name: 'openLabel',
        type: 'string',
        default: "'Show sidebar'",
        description: 'Name of the button a Toolbar adds on narrow screens.',
      },
      {
        name: 'closeLabel',
        type: 'string',
        default: "'Close sidebar'",
        description: 'Close button name.',
      },
      {
        name: 'mainId',
        type: 'string',
        default: "'main'",
        description: 'Id of the `<main>` element, the target of `SkipLink`.',
      },
      {
        name: 'sidebarOpen',
        type: 'boolean',
        default: 'false',
        description: 'Off-canvas state on narrow screens, bound with `v-model:sidebar-open`.',
      },
    ],
    slots: [
      {
        name: 'sidebar',
        props: '{ openSidebar }',
        description: 'Navigation, usually a `Sidebar`.',
      },
      { name: 'toolbar', props: '{ openSidebar }', description: 'Usually a `Toolbar`.' },
      {
        name: 'default',
        props: '{ openSidebar }',
        description: 'Page content, rendered in `<main>`.',
      },
    ],
    parts: [
      {
        name: 'Sidebar',
        kind: 'component',
        props: [
          {
            name: 'label',
            type: 'string',
            default: 'required',
            description: 'Name of the navigation landmark.',
          },
          {
            name: 'sections',
            type: '{ id, heading?, items: { id, label, icon?, badge?, to?, href? }[] }[]',
            default: 'required',
            description: 'Grouped links.',
          },
          {
            name: 'activeId',
            type: 'string',
            default: '—',
            description: 'Item marked `aria-current="page"`. Leave unset to let RouterLink decide.',
          },
          {
            name: 'headingLevel',
            type: '2 | 3 | 4 | 5 | 6',
            default: '2',
            description: 'Level of the section headings.',
          },
        ],
      },
      {
        name: 'Toolbar',
        kind: 'component',
        props: [
          { name: 'title', type: 'string', default: '—', description: 'Heading text.' },
          {
            name: 'headingLevel',
            type: '1 | 2 | 3 | 4 | 5 | 6',
            default: '1',
            description: 'Level of the title heading.',
          },
          {
            name: 'sidebarToggle',
            type: 'boolean',
            default: 'true',
            description: 'Adds the “show sidebar” button inside a SplitView on narrow screens.',
          },
        ],
        slots: [
          { name: 'leading', props: '—', description: 'Controls before the title.' },
          { name: 'title', props: '—', description: 'Rich title.' },
          { name: 'trailing', props: '—', description: 'Controls after the title.' },
          { name: 'default', props: '—', description: 'A second row, e.g. a search field.' },
        ],
      },
      {
        name: 'SkipLink',
        kind: 'component',
        props: [
          {
            name: 'target',
            type: 'string',
            default: "'main'",
            description: 'Id of the element to skip to.',
          },
          {
            name: 'label',
            type: 'string',
            default: "'Skip to main content'",
            description: 'Link text.',
          },
        ],
      },
    ],
    a11y: [
      '`SkipLink` is the first focusable element, visible only when focused, and moves focus (not just the scroll position) to `<main>`.',
      '`Sidebar` is a `<nav>` landmark with headed lists; the current page has `aria-current="page"`.',
      'On narrow screens the sidebar opens as a modal `Dialog` from a Toolbar button with `aria-haspopup="dialog"`; following a link closes it.',
      'The sidebar is mounted in the dialog only while it is open, so its landmarks never exist twice for long.',
      '`Toolbar` is a `<header>` with the page heading; its `headingLevel` defaults to 1.',
    ],
  },

  // Composables
  {
    id: 'use-form',
    name: 'useForm',
    category: 'Composables',
    kind: 'composable',
    summary:
      'Form state with Standard Schema validation (Zod, Valibot, ArkType), async field checks, server errors and submit locking.',
    exports: ['useForm'],
    demo: () => import('./demos/UseFormDemo.vue'),
    code: code('UseFormDemo'),
    props: [
      {
        name: 'initialValues',
        type: 'V',
        default: 'required',
        description: 'Starting values and baseline for `isDirty`.',
      },
      {
        name: 'schema',
        type: 'StandardSchema<V>',
        default: '—',
        description: 'Validates the whole form.',
      },
      {
        name: 'asyncValidators',
        type: '{ [field]: (value, values) => Promise<string | undefined> }',
        default: '—',
        description: 'Extra per-field checks, e.g. a uniqueness check on the server.',
      },
      {
        name: 'onSubmit',
        type: '(values: V) => unknown',
        default: 'required',
        description: 'Runs only when valid; the form stays locked until it settles.',
      },
    ],
    returns: [
      {
        name: 'field(name)',
        type: 'object',
        description:
          'Props to spread on a field: `modelValue`, listeners, `name` and the visible `error`.',
      },
      {
        name: 'handleSubmit(event)',
        type: 'Promise<void>',
        description: 'Use as `@submit`. Prevents double submits.',
      },
      { name: 'values', type: 'reactive V', description: 'Current values.' },
      { name: 'errors', type: 'Record<string, string>', description: 'All current messages.' },
      { name: 'isSubmitting', type: 'Ref<boolean>', description: 'True while `onSubmit` runs.' },
      {
        name: 'isDirty',
        type: 'ComputedRef<boolean>',
        description: 'Values differ from the baseline.',
      },
      {
        name: 'formError',
        type: 'ComputedRef<string | undefined>',
        description: 'Message for the whole form (`_form`).',
      },
      {
        name: 'setErrors(map)',
        type: 'void',
        description: 'Map server errors (e.g. a 422) onto fields.',
      },
      {
        name: 'reset(values?)',
        type: 'void',
        description: 'Back to the baseline, or to a new one.',
      },
      {
        name: 'validate() / validateField(name)',
        type: 'Promise<boolean>',
        description: 'Run validation on demand.',
      },
      {
        name: 'touched, submitCount, isValidating, isErrorVisible(name)',
        type: '—',
        description: 'Lower-level state.',
      },
    ],
    a11y: [
      'Errors appear after a field is blurred or after the first submit, so users are not interrupted while typing.',
      'A failed submit moves focus to the first control with `aria-invalid="true"`.',
      'Fields receive the message through their `error` prop, which wires `aria-invalid` and `aria-describedby`.',
    ],
  },
  {
    id: 'use-async',
    name: 'useAsync',
    category: 'Composables',
    kind: 'composable',
    summary:
      'Runs an async function with its own status, data and error. Each call aborts the previous one, and unmounting aborts the last.',
    exports: ['useAsync'],
    demo: () => import('./demos/UseAsyncDemo.vue'),
    code: code('UseAsyncDemo'),
    props: [
      {
        name: 'fn',
        type: '({ signal }, ...args) => Promise<T>',
        default: 'required',
        description: 'The work. Pass `signal` to `fetch` so aborts cancel the request.',
      },
      {
        name: 'options.immediate',
        type: 'boolean',
        default: 'false',
        description: 'Run once right away.',
      },
      {
        name: 'options.initialArgs',
        type: 'A',
        default: '[]',
        description: 'Arguments for the immediate run.',
      },
      {
        name: 'options.initialData',
        type: 'T',
        default: '—',
        description: 'Value of `data` before the first success.',
      },
      {
        name: 'options.onError',
        type: '(error) => void',
        default: '—',
        description: 'Called on failures (not on aborts).',
      },
    ],
    returns: [
      {
        name: 'execute(...args)',
        type: 'Promise<T | undefined>',
        description: 'Runs `fn`, aborting any call in flight.',
      },
      { name: 'data', type: 'ShallowRef<T | undefined>', description: 'Last successful result.' },
      {
        name: 'error',
        type: 'ShallowRef<unknown>',
        description: 'Last failure; aborts are not errors.',
      },
      {
        name: 'status',
        type: "'idle' | 'pending' | 'success' | 'error'",
        description: 'Current state.',
      },
      {
        name: 'isPending',
        type: 'ComputedRef<boolean>',
        description: 'Shorthand for `status === "pending"`.',
      },
      { name: 'abort()', type: 'void', description: 'Aborts the call in flight.' },
    ],
    a11y: [
      'Render the result in a `role="status"` region, as the demo does, so loading and results are announced.',
      'Because stale responses are dropped, what is announced always matches what is on screen.',
    ],
  },
  {
    id: 'use-polling',
    name: 'usePolling',
    category: 'Composables',
    kind: 'composable',
    summary:
      'Refreshes data on a timer that never overlaps, backs off after failures, pauses in background tabs and refreshes when the network returns.',
    exports: ['usePolling'],
    demo: () => import('./demos/UsePollingDemo.vue'),
    code: code('UsePollingDemo'),
    props: [
      {
        name: 'fn',
        type: '({ signal }) => Promise<T>',
        default: 'required',
        description: 'One fetch.',
      },
      {
        name: 'options.interval',
        type: 'number',
        default: '10000',
        description: 'Milliseconds between successful fetches.',
      },
      {
        name: 'options.maxInterval',
        type: 'number',
        default: '300000',
        description: 'Upper bound for the back-off delay.',
      },
      {
        name: 'options.backoffFactor',
        type: 'number',
        default: '2',
        description: 'Delay multiplier per failure in a row.',
      },
      {
        name: 'options.immediate',
        type: 'boolean',
        default: 'true',
        description: 'Start polling right away.',
      },
      {
        name: 'options.pauseWhenHidden',
        type: 'boolean',
        default: 'true',
        description: 'Stop while the tab is hidden.',
      },
    ],
    returns: [
      {
        name: 'data / error',
        type: 'ShallowRef',
        description: 'Latest result and latest failure.',
      },
      { name: 'lastUpdated', type: 'Ref<Date | null>', description: 'Time of the last success.' },
      {
        name: 'isFetching / isActive',
        type: 'Ref<boolean>',
        description: 'Request in flight / polling running.',
      },
      { name: 'failures', type: 'Ref<number>', description: 'Failures in a row.' },
      {
        name: 'pause() / resume() / refresh()',
        type: 'void',
        description: 'Control the timer; `refresh` fetches now.',
      },
    ],
    a11y: [
      'Do not announce every refresh. Show “Updated 10 s ago” in a polite region at most, as the Dashboard does.',
      'Offer Pause: content that updates on its own must be stoppable (WCAG 2.2.2 Pause, stop, hide).',
    ],
  },
  {
    id: 'use-theme',
    name: 'useTheme',
    category: 'Composables',
    kind: 'composable',
    summary:
      'App-wide light, dark or automatic appearance, saved across visits and shared by every caller.',
    exports: ['useTheme'],
    demo: () => import('./demos/UseThemeDemo.vue'),
    code: code('UseThemeDemo'),
    props: [],
    returns: [
      {
        name: 'mode',
        type: "Readonly<Ref<'system' | 'light' | 'dark'>>",
        description: 'The saved choice.',
      },
      {
        name: 'isDark',
        type: 'ComputedRef<boolean>',
        description: 'Whether dark colors are showing, whatever the reason.',
      },
      {
        name: 'modes',
        type: 'string[]',
        description: '`system`, `light`, `dark`, in display order.',
      },
      { name: 'setMode(mode)', type: 'void', description: 'Applies and saves a mode.' },
    ],
    a11y: [
      '`system` follows `prefers-color-scheme`, so the operating system setting is respected by default.',
      'Both themes are built from the same semantic tokens, which are contrast-checked in light and dark.',
    ],
  },
  {
    id: 'use-focus-trap',
    name: 'useFocusTrap',
    category: 'Composables',
    kind: 'composable',
    summary:
      'Keeps Tab inside an element while active and returns focus afterwards. For custom overlays; `Dialog` does not need it.',
    exports: ['useFocusTrap', 'getFocusable'],
    demo: () => import('./demos/UseFocusTrapDemo.vue'),
    code: code('UseFocusTrapDemo'),
    props: [
      {
        name: 'target',
        type: 'MaybeRefOrGetter<HTMLElement | null>',
        default: 'required',
        description: 'The container.',
      },
      {
        name: 'active',
        type: 'MaybeRefOrGetter<boolean>',
        default: 'required',
        description: 'Trap while true.',
      },
      {
        name: 'options.initialFocus',
        type: 'MaybeRefOrGetter<HTMLElement | null>',
        default: '—',
        description: 'Element to focus on activation. Defaults to the first focusable one.',
      },
    ],
    returns: [
      {
        name: 'activate() / deactivate()',
        type: 'void',
        description: 'Manual control; normally driven by `active`.',
      },
      {
        name: 'getFocusable(container)',
        type: 'HTMLElement[]',
        description:
          'Separate export: the focusable elements inside a container, skipping `inert` ones.',
      },
    ],
    a11y: [
      'Tab from the last element goes to the first, Shift+Tab from the first goes to the last.',
      'On deactivation focus returns to the element that had it before, if it is still in the page.',
      'Always pair a trap with a visible way out (a Done button) and Escape.',
    ],
  },
  {
    id: 'use-click-outside',
    name: 'useClickOutside',
    category: 'Composables',
    kind: 'composable',
    summary:
      'Calls a handler when the pointer is pressed outside some elements. Used by Popover and Menu to close.',
    exports: ['useClickOutside'],
    demo: () => import('./demos/UseClickOutsideDemo.vue'),
    code: code('UseClickOutsideDemo'),
    props: [
      {
        name: 'targets',
        type: 'MaybeRefOrGetter<Element | null>[]',
        default: 'required',
        description: 'Presses inside any of these are ignored.',
      },
      {
        name: 'handler',
        type: '(event: PointerEvent) => void',
        default: 'required',
        description: 'Called for presses outside.',
      },
      {
        name: 'active',
        type: 'MaybeRefOrGetter<boolean>',
        default: 'true',
        description: 'Listens only while true.',
      },
    ],
    returns: [{ name: 'stop()', type: 'void', description: 'Removes the listener now.' }],
    a11y: [
      'Pointer-only by nature: always provide a keyboard way to close too (Escape, a button, or Tab moving away).',
      'Listens in the capture phase, so a child that stops propagation cannot keep a panel open by accident.',
    ],
  },
]
