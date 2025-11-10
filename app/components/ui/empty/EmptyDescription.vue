<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <p
    data-slot="empty-description"
    :class="cn(
      'text-neutral-500 [&>a:hover]:text-neutral-900 text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4 dark:text-neutral-400 dark:[&>a:hover]:text-neutral-50',
      $attrs.class ?? '',
    )"
  >
    <slot />
  </p>
</template>
