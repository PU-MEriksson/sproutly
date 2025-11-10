<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner";
import { Toaster as Sonner } from "vue-sonner";

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    class="toaster group !z-[100]"
    v-bind="props"
    :toastOptions="{
      classes: {
        toast: 'bg-white border border-calm-200 shadow-lg',
        title: 'text-calm-900',
        description: 'text-calm-600',
        success: 'bg-white border-green-200',
        error: 'bg-white border-red-200',
      },
    }"
  />
</template>
