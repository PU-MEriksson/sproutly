<script setup lang="ts">
const { tasks, loading, error, refresh } = useReadTasks();
</script>

<template>
  <div>
    <h1>All tasks</h1>

    <pre v-if="error">{{ error }}</pre>

    <div v-else-if="loading">Loading...</div>

    <div v-else>
      <ul v-if="tasks.length > 0">
        <li v-for="t in tasks" :key="t.id">
          {{ t.title }} - {{ t.description }}
        </li>
      </ul>
      <p v-else>No tasks found</p>
    </div>
  </div>
</template>
