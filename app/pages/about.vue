<script setup>
const user = useSupabaseUser();
</script>

<template>
  <div>
    <h1>About</h1>
    <div v-if="user">
      <p>Logged in as: {{ user.email }}</p>
    </div>
    <div v-else>
      <p>Not logged in</p>
    </div>
  </div>
</template>
