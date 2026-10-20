<script setup>
import { getCurrentInstance, useId } from 'vue'
import Badge from '../Badge/Badge.vue'

/**
 * @typedef {object} SidebarItem
 * @property {string} id
 * @property {string} label
 * @property {import('vue').Component} [icon] Decorative icon component.
 * @property {string | number} [badge] Short count or status shown at the trailing edge.
 * @property {string | Record<string, unknown>} [to] Router location (uses a global RouterLink).
 * @property {string} [href] Plain link target, used when there is no router.
 */
/**
 * @typedef {object} SidebarSection
 * @property {string} id
 * @property {string} [heading]
 * @property {SidebarItem[]} items
 */

const props = defineProps({
  /** Accessible name of the navigation landmark, e.g. "Main". */
  label: { type: String, required: true },
  sections: {
    type: /** @type {import('vue').PropType<SidebarSection[]>} */ (Array),
    required: true,
  },
  /**
   * Id of the current item, marked with `aria-current="page"`. Leave unset with RouterLink items
   * to let the router mark the exact-active link itself.
   */
  activeId: { type: String, default: undefined },
  headingLevel: {
    type: /** @type {import('vue').PropType<2 | 3 | 4 | 5 | 6>} */ (Number),
    default: 2,
  },
})

const routerLink = getCurrentInstance()?.appContext.components.RouterLink
const baseId = useId()

/** @param {SidebarItem} item */
function link(item) {
  /** @type {Record<string, unknown>} */
  const bindings =
    item.to !== undefined && routerLink
      ? { to: item.to }
      : { href: item.href ?? (typeof item.to === 'string' ? item.to : undefined) }
  // Only set when controlled here: an explicit undefined would hide RouterLink's own aria-current.
  if (props.activeId !== undefined) {
    bindings['aria-current'] = item.id === props.activeId ? 'page' : undefined
  }
  return { tag: item.to !== undefined && routerLink ? routerLink : 'a', bindings }
}
</script>

<template>
  <nav :aria-label="label" class="flex flex-col gap-4 px-2 py-3">
    <div v-for="section in sections" :key="section.id" class="flex flex-col gap-0.5">
      <component
        :is="`h${headingLevel}`"
        v-if="section.heading"
        :id="`${baseId}-${section.id}`"
        class="px-3 pt-2 pb-1 text-footnote font-semibold text-secondary-label"
      >
        {{ section.heading }}
      </component>
      <!-- role="list" is needed: some browsers drop list semantics once list-style is removed. -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
      <ul
        role="list"
        :aria-labelledby="section.heading ? `${baseId}-${section.id}` : undefined"
        class="m-0 flex list-none flex-col gap-0.5 p-0"
      >
        <li v-for="item in section.items" :key="item.id">
          <component
            :is="link(item).tag"
            v-bind="link(item).bindings"
            class="focus-ring flex min-h-11 items-center gap-3 rounded-control px-3 text-body text-label transition-colors duration-150 ease-standard hover:bg-tertiary-fill aria-[current=page]:bg-tint/12 aria-[current=page]:font-semibold aria-[current=page]:text-tint"
          >
            <span
              v-if="item.icon"
              aria-hidden="true"
              class="flex shrink-0 text-tint [&_svg]:size-5"
            >
              <component :is="item.icon" />
            </span>
            <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
            <!-- Keeps the badge a separate word in the link's accessible name. -->
            {{ item.badge !== undefined ? ' ' : '' }}
            <Badge v-if="item.badge !== undefined">{{ item.badge }}</Badge>
          </component>
        </li>
      </ul>
    </div>
  </nav>
</template>
