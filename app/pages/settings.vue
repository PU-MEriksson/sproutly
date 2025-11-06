<script setup lang="ts">
const supabase = useSupabaseClient();

async function logout() {
  await supabase.auth.signOut();
  navigateTo("/login");
}
</script>

<template>
  <div class="settings-page pb-20 pt-16">
    <TopNavbar />
    <h1>Settings Page</h1>
    <p>This is where users can adjust their settings.</p>
    <button @click="logout">Log out</button>
  </div>
  <Navbar />
</template>
