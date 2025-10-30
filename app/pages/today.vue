<script setup lang="ts">
const { tasks, loading, error, refresh } = useTasks();
// Add logic for filtering today's tasks here later
</script>

<template>
  <div>
    <ViewTasks
      card-title="Today's Tasks"
      card-description="Here are all your tasks for today."
    />
    <AddTask/>
  </div>
</template>
