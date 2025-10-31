<script setup lang="ts"></script>

<template>
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex space-x-8 items-center">
          <!-- Navigation Links -->
          <NuxtLink
            to="/all-tasks"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            active-class="text-blue-600 bg-blue-50"
          >
            All Tasks
          </NuxtLink>

          <NuxtLink
            to="/today"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            active-class="text-blue-600 bg-blue-50"
          >
            Today
          </NuxtLink>

          <NuxtLink
            to="/settings"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            active-class="text-blue-600 bg-blue-50"
          >
            Settings
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
