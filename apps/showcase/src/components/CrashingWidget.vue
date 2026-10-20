<script setup>
const props = defineProps({
  crash: { type: Boolean, default: false },
})

if (props.crash) {
  throw new Error('CrashingWidget failed to render (intentional, from the Error lab)')
}
</script>

<template>
  <p class="text-subhead text-secondary-label">✓ Rendering normally</p>
</template>
