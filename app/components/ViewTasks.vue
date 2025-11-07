<script setup lang="ts">
import type { Database } from "~/types/database.types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const props = defineProps<{
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
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
    <section>
      <p v-if="loading" class="text-calm-600 px-2">Loading…</p>
      <p v-else-if="error" class="text-red-600 px-2">{{ error }}</p>
      <p v-else-if="tasks.length === 0" class="text-calm-500 text-center py-12">
        No tasks found
      </p>

      <div v-else class="space-y-3">
        <TaskAccordion
          v-for="t in tasks"
          :key="t.id"
          :task="t"
          @task-completed="handleTaskCompleted"
        />
      </div>
    </section>
  </ClientOnly>
</template>
