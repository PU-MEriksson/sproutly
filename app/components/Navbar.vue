<script setup lang="ts">
import { ListTodo, CalendarCheck, Settings } from "lucide-vue-next";
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-center h-16">
        <div class="flex space-x-8 items-center">
          <!-- Navigation Links -->
          <NuxtLink
            to="/all-tasks"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap"
            active-class="text-blue-600 bg-blue-50"
          >
            <ListTodo :size="20" />
            <span>All Tasks</span>
          </NuxtLink>

          <NuxtLink
            to="/today"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap"
            active-class="text-blue-600 bg-blue-50"
          >
            <CalendarCheck :size="20" />
            <span>Today</span>
          </NuxtLink>

          <NuxtLink
            to="/settings"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap"
            active-class="text-blue-600 bg-blue-50"
          >
            <Settings :size="20" />
            <span>Settings</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
