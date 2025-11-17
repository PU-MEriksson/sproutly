<script setup lang="ts"></script>

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
            class="flex flex-col items-center gap-1 text-calm-700 hover:text-calm-600 p-2 rounded-lg hover:bg-calm-50 transition-all duration-200"
            aria-label="Home"
          >
            <img src="/pwa-192x192.svg" alt="" class="w-7 h-7" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
