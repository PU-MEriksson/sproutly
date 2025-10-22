<script setup lang="ts">
const { updateUsername, fetchProfile } = useUserProfile();
const username = ref("");

const saveProfile = async () => {
  // Fetch profile first to ensure user data is loaded
  await fetchProfile();

  const success = await updateUsername(username.value);

  if (!success) {
    console.error("Failed to save profile");
  } else {
    navigateTo("/daily");
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
