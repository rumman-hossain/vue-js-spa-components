/**
 * Classes for the bordered box around a text-like control. The control inside drops its own
 * outline; the box shows the focus ring instead so leading/trailing adornments sit inside it.
 *
 * @param {{ invalid?: boolean, disabled?: boolean }} state
 */
export function fieldBoxClass({ invalid = false, disabled = false }) {
  return [
    'flex min-h-11 items-center gap-2 rounded-field border px-3 text-body',
    'transition-colors duration-150 ease-standard',
    'focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-tint/55',
    invalid ? 'border-danger' : 'border-control-border',
    disabled ? 'bg-secondary-background text-secondary-label' : 'bg-background text-label',
  ]
}

export const fieldControlClass =
  'min-w-0 flex-1 bg-transparent py-2.5 outline-none placeholder:text-placeholder disabled:cursor-not-allowed'
