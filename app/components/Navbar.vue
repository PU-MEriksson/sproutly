<script setup lang="ts">
import { ListTodo, CalendarCheck, Settings } from "lucide-vue-next";
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-calm-100 z-50"
  >
    <div class="max-w-2xl mx-auto px-6">
      <div class="flex justify-between h-20">
        <div class="flex space-x-2 items-center w-full justify-between">
          <!-- Navigation Links -->
          <NuxtLink
            to="/all-tasks"
            class="text-calm-700 hover:text-calm-800 px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5 whitespace-nowrap transition-all duration-200 hover:bg-calm-50/70"
            active-class="text-white bg-gradient-to-r from-calm-500 to-calm-600 shadow-sm"
          >
            <ListTodo :size="20" />
            <span>All Tasks</span>
          </NuxtLink>

          <NuxtLink
            to="/today"
            class="text-calm-700 hover:text-calm-800 px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5 whitespace-nowrap transition-all duration-200 hover:bg-calm-50/70"
            active-class="text-white bg-gradient-to-r from-calm-500 to-calm-600 shadow-sm"
          >
            <CalendarCheck :size="20" />
            <span>Today</span>
          </NuxtLink>

          <NuxtLink
            to="/settings"
            class="text-calm-700 hover:text-calm-800 px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5 whitespace-nowrap transition-all duration-200 hover:bg-calm-50/70"
            active-class="text-white bg-gradient-to-r from-calm-500 to-calm-600 shadow-sm"
          >
            <Settings :size="20" />
            <span>Settings</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
