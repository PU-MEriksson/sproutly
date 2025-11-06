<script setup lang="ts">

import type { Database } from '~/types/database.types';

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const pros = defineProps<{
  todaysUncompleted: Task[]
  loadingTodaysUncompleted: boolean
  errorTodaysUncompleted: string | null
  refreshTodaysUncompleted: ()=>void
  todaysCompleted:Task[]
  loadingTodaysCompleted: boolean
  errorTodaysCompleted: string | null
  refreshTodaysCompleted: ()=>void
  todaysTotal: number
}>();

const emit = defineEmits<{
  "task-completed": [taskTitle: string];
}>();

const handleTaskCompleted = (taskTitle: string) => {
  emit("task-completed", taskTitle);
};

</script>

<template>
  <section class="bg-neutral-100 p-4">
    <p v-if="loadingTodaysUncompleted">Loading…</p>
    <p v-else-if="errorTodaysUncompleted">{{ errorTodaysUncompleted }}</p>

    <div v-else class="space-y-2">
        <h2 v-if="todaysUncompleted?.length">To do!</h2>
      <TaskAccordion
        v-for="t in todaysUncompleted"
        :key="t.id"
        :task="t"
        @task-completed="handleTaskCompleted"
      />

      <h2 v-if="todaysCompleted?.length">Done!</h2>
    <TaskAccordion
        v-for="t in todaysCompleted"
        :key="t.id"
        :task="t"
        @task-completed="handleTaskCompleted"
      />

      <p v-if="todaysTotal === 0">No tasks found</p>
    </div>
  </section>
</template>
