<script setup lang="ts">
import { useReadTasks } from "~/composables/useReadTasks";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { tasks, loading, error, getTasks } = useReadTasks();

onMounted(async () => {
  const {
    data: { user: u },
  } = await supabase.auth.getUser();

  if (u?.id) {
    await getTasks();
  }
});
</script>

<template>
  <div>
    <h1>All tasks</h1>
    <pre v-if="error">{{ error }}</pre>
    <div v-else-if="loading">Loading...</div>
    <div v-else>
      <ul v-if="tasks.length > 0">
        <li v-for="t in tasks" :key="t.id">
          {{ t.title }}
        </li>
      </ul>
      <p v-else>No tasks found</p>
    </div>
  </div>
</template>
