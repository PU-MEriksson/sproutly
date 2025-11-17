<script setup lang="ts">
import { Sprout } from "lucide-vue-next";

useHead({
  title: "About - Supportive ToDo",
});

const user = useSupabaseUser();
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-calm-50 to-white pb-20">
    <TopNavbar />

    <div class="max-w-4xl mx-auto px-6 py-24">
      <!-- Header -->
      <div class="text-center mb-16">
        <div class="flex items-center justify-center gap-3 mb-4">
          <div class="text-calm-600">
            <Sprout :size="40" :stroke-width="2" />
          </div>
          <h1
            class="text-4xl font-bold bg-gradient-to-r from-calm-700 to-calm-600 bg-clip-text text-transparent"
          >
            About Sproutly
          </h1>
        </div>
        <p class="text-xl text-calm-700">
          A gentle, supportive task manager designed for everyone
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div
          class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-calm-200/40 shadow-sm"
        >
          <h3 class="text-lg font-semibold text-calm-800 mb-2">
            Simple & Clear
          </h3>
          <p class="text-calm-600">
            Clean, intuitive interface that helps you focus on what matters.
          </p>
        </div>
        <div
          class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-calm-200/40 shadow-sm"
        >
          <h3 class="text-lg font-semibold text-calm-800 mb-2">
            Break it Down
          </h3>
          <p class="text-calm-600">
            Turn overwhelming tasks into manageable steps with AI-powered
            suggestions.
          </p>
        </div>
        <div
          class="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-calm-200/40 shadow-sm"
        >
          <h3 class="text-lg font-semibold text-calm-800 mb-2">Your Pace</h3>
          <p class="text-calm-600">
            Designed with cognitive accessibility in mind. No pressure, just
            progress.
          </p>
        </div>
      </div>

      <!-- Mission -->
      <div
        class="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-calm-200/40 shadow-sm mb-8"
      >
        <h2 class="text-2xl font-bold text-calm-800 mb-4">Our Mission</h2>
        <p class="text-calm-700 leading-relaxed mb-4">
          Sproutly is designed specifically for people with executive
          dysfunction and cognitive disabilities. We believe task management
          should be supportive, not stressful.
        </p>
        <p class="text-calm-700 leading-relaxed">
          Every feature is carefully crafted to reduce cognitive load, provide
          clear feedback, and help you make progress at your own pace.
        </p>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          v-if="!user"
          to="/login"
          class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Get Started
        </NuxtLink>
        <NuxtLink
          v-else
          to="/today"
          class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Go to Today
        </NuxtLink>
      </div>
    </div>
  </div>
  <Navbar v-if="user" />
</template>
