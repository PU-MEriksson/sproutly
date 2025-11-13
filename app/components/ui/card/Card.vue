<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-white text-calm-900 flex flex-col gap-6 rounded-xl border border-calm-200 py-6 shadow-sm',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
