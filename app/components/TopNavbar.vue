<script setup lang="ts">
import { User, Sprout } from "lucide-vue-next";
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-calm-100 z-50"
  >
    <div class="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">
      <div class="flex justify-between items-center h-20">
        <!-- Logo/Brand Icon -->
        <div class="flex items-center">
          <NuxtLink
            to="/"
            class="text-calm-700 hover:text-calm-600 p-2 rounded-lg hover:bg-calm-50 transition-all duration-200"
            aria-label="Home"
          >
            <Sprout :size="28" :stroke-width="2" />
          </NuxtLink>
        </div>

        <!-- Profile Icon to add later -->
        <!-- <div class="flex items-center">
          <NuxtLink
            to="/settings"
            class="text-calm-700 hover:text-calm-800 p-2.5 rounded-full hover:bg-calm-100/70 transition-all duration-200"
            aria-label="Profile settings"
          >
            <User :size="22" />
          </NuxtLink>
        </div> -->
      </div>
    </div>
  </nav>
</template>
