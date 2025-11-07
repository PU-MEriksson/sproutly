<script setup lang="ts">
import { User } from "lucide-vue-next";
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-calm-100 z-50"
  >
    <div class="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10">
      <div class="flex justify-between items-center h-20">
        <!-- Logo/Brand -->
        <div class="flex items-center">
          <NuxtLink
            to="/"
            class="text-2xl font-light tracking-wide bg-gradient-to-r from-calm-700 to-calm-600 bg-clip-text text-transparent hover:from-calm-600 hover:to-calm-500 transition-all duration-200"
          >
            SupportiveToDo
          </NuxtLink>
        </div>

        <!-- Profile Icon -->
        <div class="flex items-center">
          <NuxtLink
            to="/settings"
            class="text-calm-700 hover:text-calm-800 p-2.5 rounded-full hover:bg-calm-100/70 transition-all duration-200"
            aria-label="Profile settings"
          >
            <User :size="22" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
