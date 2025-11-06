<script setup lang="ts">
import { User } from "lucide-vue-next";
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Brand -->
        <div class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900">
            SupportiveToDo
          </NuxtLink>
        </div>

        <!-- Profile Icon -->
        <div class="flex items-center">
          <NuxtLink
            to="/settings"
            class="text-gray-700 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Profile settings"
          >
            <User :size="24" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
