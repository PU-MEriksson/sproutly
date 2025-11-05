<script setup lang="ts">
const { tasks, loading, error, refresh } = useTasks();

const emit = defineEmits<{
  "task-completed": [taskTitle: string];
}>();

const handleTaskCompleted = (taskTitle: string) => {
  emit("task-completed", taskTitle);
};
</script>

<template>
  <ClientOnly fallback-tag="section" fallback="">
    <section class="bg-neutral-100 p-4">
      <p v-if="loading">Loading…</p>
      <p v-else-if="error">{{ error }}</p>
      <p v-else-if="tasks.length === 0">No tasks found</p>

      <div v-else class="space-y-2">
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
