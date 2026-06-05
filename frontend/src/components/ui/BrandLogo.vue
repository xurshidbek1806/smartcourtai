<script setup>
defineProps({
  size: { type: [Number, String], default: 32 }
});
</script>

<template>
  <svg
    class="brand-logo"
    :width="size"
    :height="size"
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    role="img"
    aria-label="SmartCourt AI"
  >
    <!-- fulcrum knob -->
    <circle cx="20" cy="8.6" r="1.7" fill="currentColor" stroke="none" />
    <!-- balance beam -->
    <path d="M6 11 H34" />
    <!-- left chains + pan -->
    <path d="M8 11 L5 18.5 M8 11 L11 18.5" stroke-width="1.3" />
    <path d="M3.5 18.5 Q8 24 12.5 18.5" stroke-width="1.7" />
    <!-- right chains + pan -->
    <path d="M32 11 L29 18.5 M32 11 L35 18.5" stroke-width="1.3" />
    <path d="M27.5 18.5 Q32 24 36.5 18.5" stroke-width="1.7" />
    <!-- central S pillar -->
    <path d="M20 11 c6 2 6 7 0 9 c-6 2 -6 7 0 9" stroke-width="2.6" />
    <!-- base foot -->
    <path d="M20 29 V33 M13.5 33.5 H26.5" stroke-width="2.2" />
  </svg>
</template>

<style scoped>
.brand-logo {
  display: block;
  flex-shrink: 0;
  color: inherit;
}
</style>
