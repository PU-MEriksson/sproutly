<script setup lang="ts">
const {
  allUncompletedTasks,
  loadingAllUncompletedTasks,
  errorAllUncompletedTasks,
  refreshAllUncompletedTasks,
  allCompletedTasks,
  loadingAllCompletedTasks,
  errorAllCompletedTasks,
  refreshAllCompletedTasks,
} = useTasks();
const handleTaskAdded = () => {
  refreshAllCompletedTasks();
  refreshAllUncompletedTasks();
};
</script>

<template>
  <div class="bg-white min-h-screen pb-20 pt-20">
    <TopNavbar />
    <QuickAddTask @task-added="handleTaskAdded" />

    <section class="space-y-6 px-6 py-4">
      <div class="space-y-3">
        <h2 class="text-lg font-semibold text-calm-700 px-2">To do</h2>
        <ViewTasks
          :tasks="allUncompletedTasks"
          :loading="loadingAllUncompletedTasks"
          :error="
            errorAllUncompletedTasks ? errorAllUncompletedTasks.message : null
          "
          :refresh="refreshAllUncompletedTasks"
        />
      </div>

      <div class="space-y-3">
        <h2 class="text-lg font-semibold text-calm-700 px-2">Completed</h2>
        <ViewTasks
          :tasks="allCompletedTasks"
          :loading="loadingAllCompletedTasks"
          :error="
            errorAllCompletedTasks ? errorAllCompletedTasks.message : null
          "
          :refresh="refreshAllCompletedTasks"
        />
      </div>
    </section>
  </div>
  <Navbar />
</template>
