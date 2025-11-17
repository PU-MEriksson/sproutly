<script setup lang="ts">
useHead({
  title: "Sproutly - Task Management for Everyone",
});

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
  <main
    v-if="showContent"
    class="min-h-screen bg-gradient-to-br from-calm-50 to-white"
  >
    <div class="max-w-4xl mx-auto px-6 py-16">
      <!-- Header -->
      <header class="text-center mb-16">
        <div class="flex justify-center">
          <img src="/logo512x512.svg" alt="Sproutly Logo" class="w-32 h-32" />
        </div>
        <h1 class="sr-only">Sproutly</h1>
        <p class="text-xl text-calm-700 mb-8">
          A gentle, supportive task manager designed for everyone
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Get Started
        </NuxtLink>
      </header>

      <!-- Features -->
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" class="sr-only">Features</h2>
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
      </section>

      <!-- CTA -->
      <footer class="text-center">
        <p class="text-calm-600 mb-4">
          Already have an account?
          <NuxtLink
            to="/login"
            class="text-calm-700 hover:text-calm-800 font-semibold underline"
          >
            Sign in
          </NuxtLink>
        </p>
      </footer>
    </div>
  </main>
</template>
