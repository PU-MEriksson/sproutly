<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-white text-neutral-950 flex flex-col gap-6 rounded-xl border border-neutral-200 py-6 shadow-sm dark:bg-neutral-950 dark:text-neutral-50 dark:border-neutral-800',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
