import { describe, expect, it } from 'vitest'
import { entries } from './entries.js'
import { CATEGORIES, apiParts, filterEntries } from './model.js'

/** Exports documented together in the "App shell" entry instead of one entry each. */
const APP_SHELL = ['SplitView', 'Sidebar', 'Toolbar', 'SkipLink']

/**
 * Public exports that need no entry of their own, with the reason. Lower-case helpers that do not
 * start with "use" are not required to be documented at all.
 * @type {Record<string, string>}
 */
const EXCEPTIONS = {}

/** @returns {Promise<Record<string, any>>} */
async function loadLibrary() {
  return /** @type {Record<string, any>} */ (await import('@vue-js-spa-components/ui'))
}

/** @param {unknown} definition Runtime `props` or `emits` option: an array or an object. */
function optionKeys(definition) {
  if (!definition) return []
  return Array.isArray(definition) ? definition : Object.keys(definition)
}

/**
 * How a runtime default is written in the docs: `'md'`, `false`, `null`, `required` or `—`.
 * Returns undefined for function defaults, which the docs describe in words.
 *
 * @param {any} definition
 */
function displayDefault(definition) {
  if (definition?.required) return 'required'
  const value = definition?.default
  if (typeof value === 'function') return undefined
  if (value === undefined) return '—'
  return typeof value === 'string' ? `'${value}'` : String(value)
}

describe('gallery entries', () => {
  it('documents every public component and composable of the library', async () => {
    const library = await loadLibrary()
    const documented = new Set(entries.flatMap((entry) => entry.exports))
    const required = Object.keys(library).filter(
      (name) => /^[A-Z]/.test(name) || name.startsWith('use'),
    )
    const missing = required.filter((name) => !documented.has(name) && !(name in EXCEPTIONS))
    expect(missing).toEqual([])
  })

  it('only documents names the library really exports', async () => {
    const library = await loadLibrary()
    const unknown = entries.flatMap((entry) => entry.exports).filter((name) => !(name in library))
    expect(unknown).toEqual([])
  })

  it('groups the app shell components in one entry', () => {
    const shell = entries.find((entry) => entry.id === 'app-shell')
    expect(shell?.exports).toEqual(APP_SHELL)
  })

  it('has unique ids and names, and known categories', () => {
    const ids = entries.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(entries.map((entry) => entry.name)).size).toBe(entries.length)
    for (const entry of entries) {
      expect(entry.id, entry.id).toMatch(/^[a-z][a-z0-9-]*$/)
      expect(CATEGORIES, entry.id).toContain(entry.category)
    }
  })

  it.each(entries.map((entry) => [entry.id, entry]))(
    '%s documents the real props, defaults and events',
    async (_id, entry) => {
      const library = await loadLibrary()
      for (const part of apiParts(entry).filter((item) => item.kind === 'component')) {
        const component = library[part.name]
        const props = /** @type {Record<string, any>} */ (component.props ?? {})

        const actualProps = optionKeys(props).filter((name) => !name.endsWith('Modifiers'))
        const documentedProps = part.props.map((prop) => prop.name)
        expect(documentedProps.toSorted(), `${part.name} props`).toEqual(actualProps.toSorted())

        for (const prop of part.props) {
          const expected = displayDefault(props[prop.name])
          if (expected !== undefined) {
            expect(prop.default, `${part.name}.${prop.name} default`).toBe(expected)
          }
        }

        const actualEvents = optionKeys(component.emits).filter(
          (name) => !name.startsWith('update:'),
        )
        const documentedEvents = (part.events ?? []).map((event) => event.name)
        expect(documentedEvents.toSorted(), `${part.name} events`).toEqual(actualEvents.toSorted())
      }
    },
  )

  it.each(entries.map((entry) => [entry.id, entry]))(
    '%s has a loadable demo, matching code and accessibility notes',
    async (_id, entry) => {
      const module = await entry.demo()
      expect(module.default).toBeTruthy()
      expect(entry.code).toContain('<template>')
      // The snippet is the demo's source, so it must use what the entry documents.
      expect(entry.exports.some((name) => entry.code.includes(name))).toBe(true)
      expect(entry.summary.length).toBeGreaterThan(0)
      expect(entry.a11y.length).toBeGreaterThan(0)
    },
  )
})

describe('filterEntries', () => {
  it('matches names, exports and summaries, ignoring case and width', () => {
    expect(filterEntries(entries, 'NUMBERFIELD').map((entry) => entry.id)).toEqual(['number-field'])
    // Full-width letters, as typed with a Japanese IME.
    expect(filterEntries(entries, 'ｓｋｅｌｅｔｏｎ').map((entry) => entry.id)).toContain(
      'skeleton',
    )
    expect(filterEntries(entries, 'useConfirm').map((entry) => entry.id)).toEqual(['alert-dialog'])
    expect(filterEntries(entries, '  ')).toBe(entries)
    expect(filterEntries(entries, 'zzzz-no-match')).toEqual([])
  })
})
