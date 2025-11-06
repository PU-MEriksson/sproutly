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
</script>

<template>
  <div class="pb-20 pt-16">
    <TopNavbar />
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
