import { normalizeQuery } from './text.js'

/**
 * @typedef {'Actions' | 'Inputs' | 'Selection' | 'Containers' | 'Overlays' | 'Data' | 'Feedback'
 *   | 'Navigation' | 'Composables'} Category
 */

/**
 * A prop of a component, or an option/argument of a composable.
 * @typedef {object} PropDoc
 * @property {string} name
 * @property {string} type
 * @property {string} default Display form of the default: `'md'`, `false`, `required` or `—`.
 * @property {string} description
 */

/**
 * @typedef {object} EventDoc
 * @property {string} name
 * @property {string} payload
 * @property {string} description
 */

/**
 * @typedef {object} SlotDoc
 * @property {string} name
 * @property {string} props Slot props, or `—`.
 * @property {string} description
 */

/**
 * @typedef {object} ReturnDoc
 * @property {string} name
 * @property {string} type
 * @property {string} description
 */

/**
 * Documentation of one exported component or composable.
 * @typedef {object} ApiPart
 * @property {string} name Export name, e.g. `ListRow` or `useConfirm`.
 * @property {'component' | 'composable'} kind
 * @property {PropDoc[]} props Props of a component; options and arguments of a composable.
 * @property {EventDoc[]} [events]
 * @property {SlotDoc[]} [slots]
 * @property {ReturnDoc[]} [returns]
 */

/**
 * @typedef {object} GalleryEntry
 * @property {string} id Anchor id of the section; also used in links from the category index.
 * @property {string} name
 * @property {Category} category
 * @property {'component' | 'composable'} kind Kind of the primary export (`exports[0]`).
 * @property {string} summary
 * @property {string[]} exports Every library export this entry documents; the first is primary.
 * @property {() => Promise<{ default: import('vue').Component }>} demo
 * @property {string} code Source of the demo, shown in the Usage tab.
 * @property {PropDoc[]} props Props of the primary component (options for a composable).
 * @property {EventDoc[]} [events]
 * @property {SlotDoc[]} [slots]
 * @property {ReturnDoc[]} [returns]
 * @property {ApiPart[]} [parts] Further exports documented together with the primary one.
 * @property {string[]} a11y
 */

/** @type {Category[]} */
export const CATEGORIES = [
  'Actions',
  'Inputs',
  'Selection',
  'Containers',
  'Overlays',
  'Data',
  'Feedback',
  'Navigation',
  'Composables',
]

/**
 * The primary export followed by the parts, in one shape, for the API tables.
 *
 * @param {GalleryEntry} entry
 * @returns {ApiPart[]}
 */
export function apiParts(entry) {
  return [
    {
      name: entry.exports[0],
      kind: entry.kind,
      props: entry.props,
      events: entry.events,
      slots: entry.slots,
      returns: entry.returns,
    },
    ...(entry.parts ?? []),
  ]
}

/**
 * Entries whose name, exports or summary contain the query (case- and width-insensitive).
 *
 * @param {GalleryEntry[]} entries
 * @param {string} query
 */
export function filterEntries(entries, query) {
  const needle = normalizeQuery(query)
  if (!needle) return entries
  return entries.filter((entry) =>
    [entry.name, entry.summary, ...entry.exports].some((text) =>
      normalizeQuery(text).includes(needle),
    ),
  )
}
