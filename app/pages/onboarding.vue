<script setup lang="ts">
import { Sprout } from "lucide-vue-next";
import Button from "~/components/ui/button/Button.vue";
import Input from "~/components/ui/input/Input.vue";

const { updateUsername } = useUserProfile();
const user = useSupabaseUser();
const username = ref("");
const loading = ref(false);

// Important: Only run auth-dependent checks on the client to avoid SSR timing issues
if (import.meta.client) {
  watch(
    user,
    (currentUser) => {
      // Don't spam console during initial hydration — only warn if user stays missing after mount
      if (!currentUser?.id) {
        // You can show a gentle inline message instead of an error if you prefer
        // console.warn("User not authenticated yet — waiting for session...");
      }
    },
    { immediate: true }
  );
}

const saveProfile = async () => {
  // Guard: ensure we are on client and have (or can resolve) a session
  if (!import.meta.client) return;

  loading.value = true;
  const success = await updateUsername(username.value);
  loading.value = false;

  if (!success) {
    console.error("Failed to save profile");
  } else {
    navigateTo("/today");
  }
};
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-calm-50 to-white"
  >
    <div class="w-full max-w-md space-y-8">
      <!-- Logo/Icon -->
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <div class="text-calm-600">
            <Sprout :size="48" :stroke-width="2" />
          </div>
        </div>
        <h1
          class="text-3xl font-bold bg-gradient-to-r from-calm-700 to-calm-600 bg-clip-text text-transparent"
        >
          Welcome!
        </h1>
        <p class="text-calm-600 mt-2">
          Let's get started by personalizing your experience
        </p>
      </div>

      <div
        class="bg-white/70 backdrop-blur-sm rounded-2xl border border-calm-200/40 shadow-lg p-8 space-y-6"
      >
        <div class="space-y-4">
          <div class="space-y-2">
            <label for="username" class="text-sm font-medium text-calm-800">
              What should we call you?
            </label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="Your name"
              :disabled="loading"
              @keyup.enter="saveProfile"
              class="h-12 border-calm-200/50 focus:border-calm-400"
            />
            <p class="text-xs text-calm-600">
              This will help us personalize your task experience
            </p>
          </div>

          <Button
            @click="saveProfile"
            size="lg"
            class="w-full h-12 bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white shadow-sm hover:shadow-md"
            :disabled="!username || loading"
          >
            {{ loading ? "Saving..." : "Continue" }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
