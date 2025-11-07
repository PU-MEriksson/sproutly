<script setup lang="ts">
import type { Database } from "~/types/database.types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const pros = defineProps<{
  todaysUncompleted: Task[];
  loadingTodaysUncompleted: boolean;
  errorTodaysUncompleted: string | null;
  refreshTodaysUncompleted: () => void;
  todaysCompleted: Task[];
  loadingTodaysCompleted: boolean;
  errorTodaysCompleted: string | null;
  refreshTodaysCompleted: () => void;
  todaysTotal: number;
}>();

const emit = defineEmits<{
  "task-completed": [taskTitle: string];
}>();

const handleTaskCompleted = (taskTitle: string) => {
  emit("task-completed", taskTitle);
};
</script>

<template>
  <ClientOnly fallback-tag="section" fallback="">
    <section class="px-6 py-4">
      <p v-if="loadingTodaysUncompleted" class="text-calm-600">Loading…</p>
      <p v-else-if="errorTodaysUncompleted" class="text-red-600">
        {{ errorTodaysUncompleted }}
      </p>

      <div v-else class="space-y-6">
        <div v-if="todaysUncompleted?.length" class="space-y-3">
          <h2 class="text-lg font-semibold text-calm-700 px-2">To do</h2>
          <div class="space-y-3">
            <TaskAccordion
              v-for="t in todaysUncompleted"
              :key="t.id"
              :task="t"
              :showRemoveFromToday="true"
              @task-completed="handleTaskCompleted"
            />
          </div>
        </div>

        <div v-if="todaysCompleted?.length" class="space-y-3">
          <h2 class="text-lg font-semibold text-calm-700 px-2">Completed</h2>
          <div class="space-y-3">
            <TaskAccordion
              v-for="t in todaysCompleted"
              :key="t.id"
              :task="t"
              :showRemoveFromToday="true"
              @task-completed="handleTaskCompleted"
            />
          </div>
        </div>

        <p v-if="todaysTotal === 0" class="text-calm-500 text-center py-12">
          No tasks for today
        </p>
      </div>
    </section>
  </ClientOnly>
</template>
