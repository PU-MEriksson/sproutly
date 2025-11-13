<script setup lang="ts">
import { WifiOff } from "lucide-vue-next";

const { isOnline } = useOnlineStatus();
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-full"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-full"
  >
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 bg-calm-100 border-b-2 border-calm-400 z-[90] shadow-lg"
    >
      <div class="max-w-2xl mx-auto px-6 py-4">
        <div class="flex items-center gap-3">
          <WifiOff :size="24" class="text-calm-700 shrink-0" />
          <div class="flex-1">
            <p class="text-base font-semibold text-calm-900">You're offline</p>
            <p class="text-sm text-calm-700">
              Please reconnect to the internet to use the app
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
