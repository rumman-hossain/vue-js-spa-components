<script setup>
import { ErrorBoundary, Toggle } from '@vue-js-spa-components/ui'
import { defineComponent, h, ref } from 'vue'

/** A widget that throws while rendering when its data is bad. */
const RevenueChart = defineComponent({
  props: { broken: { type: Boolean, default: false } },
  setup(props) {
    return () => {
      if (props.broken) throw new Error('Revenue data is malformed')
      return h('p', { class: 'text-subhead text-label' }, 'Revenue: ¥4.2M this quarter, up 12%.')
    }
  },
})

const badData = ref(false)
const reported = ref('nothing yet')
</script>

<template>
  <div class="flex max-w-lg flex-col gap-4">
    <Toggle
      v-model="badData"
      label="Feed the widget bad data"
      description="Turn it off again, then press “Try again” to remount the widget."
    />
    <div class="rounded-card bg-grouped p-4">
      <ErrorBoundary
        fallback-title="Chart unavailable"
        fallback-message="The rest of the dashboard still works."
        :heading-level="3"
        @error="(error) => (reported = String(error))"
      >
        <RevenueChart :broken="badData" />
      </ErrorBoundary>
    </div>
    <p class="text-footnote text-secondary-label">Reported: {{ reported }}</p>
  </div>
</template>
