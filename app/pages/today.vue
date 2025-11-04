<script setup lang="ts">
const { todaysTasks, loadingToday, errorToday, refreshToday } = useTasks();

const handleTaskAdded = () => {
  refreshToday();
};
</script>

<template>

  <div class="bg-neutral-100 h-screen">
    <QuickAddTask @task-added="handleTaskAdded" />
    <ViewTodaysTasks />

  </div>
  <Navbar />
</template>
