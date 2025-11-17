<script setup lang="ts">
import { Sprout } from "lucide-vue-next";

const user = useSupabaseUser();
const { hasUsername, fetchProfile } = useUserProfile();

// Only show content to non-authenticated users
const showContent = ref(false);

// Handle authenticated user redirect
if (process.client) {
  watch(
    user,
    async (currentUser) => {
      if (currentUser) {
        await fetchProfile();
        if (hasUsername.value) {
          navigateTo("/today", { replace: true });
        } else {
          navigateTo("/onboarding", { replace: true });
        }
      } else {
        // User is not authenticated, show the landing page
        showContent.value = true;
      }
    },
    { immediate: true }
  );
}
</script>

<template>
  <!-- Landing page for non-authenticated users only -->
  <div
    v-if="showContent"
    class="min-h-screen bg-gradient-to-br from-calm-50 to-white"
  >
    <div class="max-w-4xl mx-auto px-6 py-16">
      <!-- Header -->
      <div class="text-center mb-16">
        <div class="flex items-center justify-center gap-3 mb-4">
          <div class="text-calm-600">
            <Sprout :size="40" :stroke-width="2" />
          </div>
          <h1
            class="text-4xl font-bold bg-gradient-to-r from-calm-700 to-calm-600 bg-clip-text text-transparent"
          >
            Sproutly
          </h1>
        </div>
        <p class="text-xl text-calm-700 mb-8">
          A gentle, supportive task manager designed for everyone
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Get Started
        </NuxtLink>
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

      <!-- CTA -->
      <div class="text-center">
        <p class="text-calm-600 mb-4">
          Already have an account?
          <NuxtLink
            to="/login"
            class="text-calm-700 hover:text-calm-800 font-semibold underline"
          >
            Sign in
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
