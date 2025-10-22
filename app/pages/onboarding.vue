<script setup lang="ts">
const { updateUsername } = useUserProfile();
const user = useSupabaseUser();
const username = ref("");

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

  const success = await updateUsername(username.value);

  if (!success) {
    console.error("Failed to save profile");
  } else {
    navigateTo("/today");
  }
};
</script>

<template>
  <div>
    <h1>What should we call you</h1>
    <input v-model="username" type="text" placeholder="Your name" />
    <button @click="saveProfile">Save</button>
  </div>
</template>
