<script setup lang="ts">
import { Archive } from "lucide-vue-next";

useHead({
  title: "All Tasks - Sproutly",
});

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

    <div class="max-w-2xl mx-auto">
      <!-- Page heading -->
      <div class="px-6 pt-6 pb-2">
        <h1 class="text-2xl font-bold text-calm-800">All Tasks</h1>
      </div>

      <QuickAddTask @task-added="handleTaskAdded" />

      <section
        v-if="
          allUncompletedTasks?.length === 0
        "
      >
        <NoTasks />
      </section>

      <section class="space-y-6 px-6 py-4">
        <div v-if="allUncompletedTasks?.length > 0" class="space-y-3">
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
      </section>

      <!-- Archive link -->
      <div v-if="allCompletedTasks?.length > 0" class="px-6 py-8">
        <NuxtLink
          to="/archive"
          class="inline-flex items-center gap-1.5 text-sm text-calm-500 hover:text-calm-700 transition-colors pl-2"
        >
          <Archive :size="16" />
          View completed tasks
        </NuxtLink>
      </div>
    </div>
  </div>
  <Navbar />
</template>
