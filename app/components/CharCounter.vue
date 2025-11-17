<script setup lang="ts">
    defineProps<{
    current: number
    max: number
    }>()
</script>

<template>
  <p class="text-xs text-muted-foreground mt-1 text-right">
    {{ current }} / {{ max }}
  </p>
</template>

