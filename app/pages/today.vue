<script setup lang="ts">
const { tasks, loading, error, refresh } = useTasks();

const handleTaskAdded = () => {
  refresh();
};
</script>

<template>
  <div>
    <ViewTasks
      card-title="Today's Tasks"
      card-description="Here are all your tasks for today."
    />
    <AddTask @task-added="handleTaskAdded" />
  </div>
</template>
