<script setup lang="ts">
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
  <div>Waiting for login...</div>
</template>
