<script setup lang="ts">
const { tasks, loading, error, refresh } = useTasks();
</script>

<template>
  <section class="bg-neutral-100 p-4">
    <p v-if="loading">Loading…</p>
    <p v-else-if="error">{{ error }}</p>

    <div v-else class="space-y-2">
      <TaskAccordion v-for="t in tasks" :key="t.id" :task="t" />
      <p v-if="tasks.length === 0">No tasks found</p>
    </div>
  </section>
</template>
