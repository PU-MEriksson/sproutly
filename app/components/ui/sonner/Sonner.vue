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
        toast:
          '!bg-white/95 backdrop-blur-sm !border !border-calm-200/80 shadow-lg',
        title: '!text-calm-800 !font-medium',
        description: '!text-calm-600',
        success: '!bg-calm-50/95 !border-calm-200/80',
        error: '!bg-red-50/95 !border-red-300/80',
        actionButton: '!bg-calm-600 !text-white hover:!bg-calm-700',
        cancelButton: '!bg-calm-100 !text-calm-700 hover:!bg-calm-200',
      },
    }"
  />
</template>

<style scoped>
:deep([data-sonner-toast]) {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(220, 235, 231, 0.8) !important;
  backdrop-filter: blur(8px);
}

:deep([data-sonner-toast][data-type="success"]) {
  background: rgba(245, 248, 248, 0.95) !important;
  border-color: rgba(185, 214, 205, 0.8) !important;
}

:deep([data-sonner-toast][data-type="error"]) {
  background: rgba(254, 242, 242, 0.95) !important;
  border-color: rgba(252, 165, 165, 0.8) !important;
}

:deep([data-sonner-toast] [data-title]) {
  color: #2c4340 !important;
  font-weight: 500 !important;
}

:deep([data-sonner-toast] [data-description]) {
  color: #679a8f !important;
}
</style>
