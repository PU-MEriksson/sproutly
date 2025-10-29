<script setup lang="ts">
const { tasks, loading, error, refresh } = useTasks();
</script>

<template>
  <div>
    <h1>All tasks</h1>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error">{{ error }}</p>

    <div v-else>
      <TaskAccordion v-for="t in tasks" :key="t.id" :task="t" />
      <p v-if="tasks.length === 0">No tasks found</p>
    </div>
  </div>
</template>
