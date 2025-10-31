<script setup lang="ts">
const { tasks, loading, error, refresh } = useTasks();

const handleTaskAdded = () => {
  refresh();
};
</script>

<template>

  <div class="bg-neutral-100 h-screen">
    <QuickAddTask @task-added="handleTaskAdded" />
    <ViewTasks />

  </div>
  <Navbar />
</template>
