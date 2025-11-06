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
  <div class="bg-neutral-100 min-h-screen pb-20 pt-16">
    <TopNavbar />
    <QuickAddTask @task-added="handleTaskAdded" />

    <Section>
      <h2>To do</h2>
      <ViewTasks
        :tasks="allUncompletedTasks"
        :loading="loadingAllUncompletedTasks"
        :error="
          errorAllUncompletedTasks ? errorAllUncompletedTasks.message : null
        "
        :refresh="refreshAllUncompletedTasks"
      />
    </Section>
    <Section>
      <h2>Done</h2>
      <ViewTasks
        :tasks="allCompletedTasks"
        :loading="loadingAllCompletedTasks"
        :error="errorAllCompletedTasks ? errorAllCompletedTasks.message : null"
        :refresh="refreshAllCompletedTasks"
      />
    </Section>
  </div>
  <Navbar />
</template>
