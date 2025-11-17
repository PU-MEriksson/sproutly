<script setup lang="ts">
import { Sprout, Loader2 } from "lucide-vue-next";

useHead({
  title: "Confirming - Supportive ToDo",
});

const { hasUsername, fetchProfile } = useUserProfile();
const user = useSupabaseUser();

watch(
  user,
  async (currentUser) => {
    if (currentUser) {
      // Fetch the profile
      await fetchProfile();

      // Check if user has a username
      if (hasUsername.value) {
        navigateTo("/today");
      } else {
        navigateTo("/onboarding");
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-calm-50 to-white"
  >
    <div class="text-center space-y-6">
      <!-- Logo/Icon -->
      <div class="flex justify-center">
        <div class="text-calm-600">
          <Sprout :size="48" :stroke-width="2" />
        </div>
      </div>

      <!-- Loading spinner -->
      <div class="flex justify-center">
        <Loader2 class="h-8 w-8 animate-spin text-calm-500" />
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-calm-800">Logging you in...</h1>
        <p class="text-calm-600">Please wait while we set up your account</p>
      </div>
    </div>
  </div>
</template>
