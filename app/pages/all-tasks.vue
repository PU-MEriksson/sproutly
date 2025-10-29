<script setup lang="ts">
const { tasks, loading, error, refresh } = useTasks();
</script>

<template>
  <div>
    <ViewTasks
      card-title="All Tasks"
      card-description="Here are all your tasks."
    />
  </div>
</template>
