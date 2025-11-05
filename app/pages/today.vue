<script setup lang="ts">
const { todaysTasks, loadingToday, errorToday, refreshToday } = useTasks();
const lastCompletedTask = ref<string | undefined>();

// Completed tasks today
const completedTasksToday = computed(() => {
  return todaysTasks.value.filter((task) => task.completed);
});

const timeOfDay = computed(() => {
  const hour = new Date().getHours();
  if (hour < 10) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
});

const handleTaskCompleted = (taskTitle: string) => {
  // Show celebration for 8 seconds
  lastCompletedTask.value = taskTitle;

  setTimeout(() => {
    lastCompletedTask.value = undefined;
  }, 8000);

  refreshToday();
};

const handleTaskAdded = () => {
  refreshToday();
};
</script>

<template>
  <div class="bg-neutral-100 h-screen">
    <FeedbackArea
      :total-tasks="todaysTasks.length"
      :completed-tasks-today="completedTasksToday.length"
      :last-completed-task="lastCompletedTask"
      :time-of-day="timeOfDay"
    />
    <QuickAddTask @task-added="handleTaskAdded" />
    <ViewTodaysTasks @task-completed="handleTaskCompleted" />
  </div>
  <Navbar />
</template>
