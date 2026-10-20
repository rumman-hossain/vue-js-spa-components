import { computed, onScopeDispose, ref, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * "5 seconds ago" style text that keeps itself current, formatted for the active locale.
 * @param {import('vue').MaybeRefOrGetter<Date | null>} date
 */
export function useRelativeTime(date) {
  const { locale } = useI18n()
  const now = ref(Date.now())
  const timer = setInterval(() => (now.value = Date.now()), 1000)
  onScopeDispose(() => clearInterval(timer))

  return computed(() => {
    const value = toValue(date)
    if (!value) return ''
    const seconds = Math.round((value.getTime() - now.value) / 1000)
    const format = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
    return Math.abs(seconds) < 60
      ? format.format(seconds, 'second')
      : format.format(Math.round(seconds / 60), 'minute')
  })
}
