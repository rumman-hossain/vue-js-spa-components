/** @typedef {'filled' | 'tinted' | 'gray' | 'plain'} ButtonVariant */
/** @typedef {'accent' | 'danger'} ButtonTone */
/** @typedef {'sm' | 'md' | 'lg'} ButtonSize */

export const BUTTON_VARIANTS = /** @type {const} */ (['filled', 'tinted', 'gray', 'plain'])
export const BUTTON_TONES = /** @type {const} */ (['accent', 'danger'])
export const BUTTON_SIZES = /** @type {const} */ (['sm', 'md', 'lg'])

/** @type {Record<ButtonVariant, Record<ButtonTone, string>>} */
const VARIANT_CLASSES = {
  filled: {
    accent: 'bg-tint-fill text-on-tint hover:opacity-90 active:opacity-80',
    danger: 'bg-danger-fill text-on-tint hover:opacity-90 active:opacity-80',
  },
  tinted: {
    accent: 'bg-tint/15 text-tint hover:bg-tint/20 active:bg-tint/25',
    danger: 'bg-danger/15 text-danger hover:bg-danger/20 active:bg-danger/25',
  },
  gray: {
    accent: 'bg-fill text-tint hover:bg-secondary-fill active:bg-tertiary-fill',
    danger: 'bg-fill text-danger hover:bg-secondary-fill active:bg-tertiary-fill',
  },
  plain: {
    accent: 'text-tint hover:bg-tint/10 active:bg-tint/15',
    danger: 'text-danger hover:bg-danger/10 active:bg-danger/15',
  },
}

/**
 * Shared look for Button and IconButton. Loading buttons are disabled too, but keep full opacity
 * so the spinner stays readable.
 *
 * @param {ButtonVariant} variant
 * @param {ButtonTone} tone
 */
export function buttonVariantClass(variant, tone) {
  return [
    'focus-ring inline-flex shrink-0 items-center justify-center font-semibold select-none',
    'transition-[background-color,opacity] duration-150 ease-standard',
    'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed',
    'disabled:not-aria-busy:opacity-40 aria-disabled:opacity-40',
    VARIANT_CLASSES[variant][tone],
  ]
}
