/**
 * Pure helpers behind FileUpload, kept separate so the rules are easy to test.
 */

/**
 * Whether a file matches an `accept` string such as `"image/*,.csv,application/pdf"`.
 * Mirrors the browser's rules: `.ext` matches the name, `type/*` the MIME group, anything else the
 * exact MIME type. An empty `accept` allows everything.
 *
 * @param {{ name: string, type: string }} file
 * @param {string | undefined} accept
 */
export function matchesAccept(file, accept) {
  if (!accept?.trim()) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith('.')) return name.endsWith(token)
      if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
      return type === token
    })
}

const UNITS = /** @type {const} */ (['byte', 'kilobyte', 'megabyte', 'gigabyte'])

/**
 * Human-readable size in the user's locale, e.g. `1.4 MB` or `1,4 MB`.
 * @param {number} bytes
 * @param {string} [locale]
 */
export function formatBytes(bytes, locale) {
  let value = Math.max(0, bytes)
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: UNITS[unit],
    unitDisplay: 'short',
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(value)
}

/**
 * Splits picked files into accepted and rejected ones, in order, respecting the remaining slots.
 *
 * @param {File[]} files
 * @param {{ accept?: string, maxSize?: number, maxFiles?: number, current: number }} rules
 * @returns {{ accepted: File[], rejected: Array<{ file: File, reason: 'type' | 'size' | 'count' }> }}
 */
export function partitionFiles(files, rules) {
  /** @type {File[]} */
  const accepted = []
  /** @type {Array<{ file: File, reason: 'type' | 'size' | 'count' }>} */
  const rejected = []
  for (const file of files) {
    if (!matchesAccept(file, rules.accept)) rejected.push({ file, reason: 'type' })
    else if (rules.maxSize !== undefined && file.size > rules.maxSize)
      rejected.push({ file, reason: 'size' })
    else if (rules.maxFiles !== undefined && rules.current + accepted.length >= rules.maxFiles) {
      rejected.push({ file, reason: 'count' })
    } else accepted.push(file)
  }
  return { accepted, rejected }
}
