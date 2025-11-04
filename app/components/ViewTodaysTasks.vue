<script setup lang="ts">
const { todaysTasks, loadingToday, errorToday, refreshToday } = useTasks();

const emit = defineEmits<{
  "task-completed": [taskTitle: string];
}>();

const handleTaskCompleted = (taskTitle: string) => {
  emit("task-completed", taskTitle);
};
</script>

<template>
  <section class="bg-neutral-100 p-4">
    <p v-if="loadingToday">Loading…</p>
    <p v-else-if="errorToday">{{ errorToday }}</p>

    <div v-else class="space-y-2">
      <TaskAccordion
        v-for="t in todaysTasks"
        :key="t.id"
        :task="t"
        @task-completed="handleTaskCompleted"
      />
      <p v-if="todaysTasks.length === 0">No tasks found</p>
    </div>
  </section>
</template>
