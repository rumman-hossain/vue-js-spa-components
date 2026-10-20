/** @typedef {'start' | 'end'} PopoverAlign */

/**
 * Panel anchored below its trigger with plain CSS (no positioning library): the wrapper is
 * `relative`, the panel `absolute top-full` and aligned to the trigger's start or end edge.
 *
 * @param {PopoverAlign} align
 */
export function popoverPanelClass(align) {
  return [
    'material absolute top-full z-40 mt-2 min-w-56 animate-sheet-in rounded-card border border-separator p-1.5 shadow-card',
    align === 'end' ? 'right-0' : 'left-0',
  ]
}

/** Size classes for a medium trigger button, matching `Button size="md"`. */
export const TRIGGER_SIZE_CLASS = 'min-h-11 gap-1.5 rounded-field px-4 text-body'
