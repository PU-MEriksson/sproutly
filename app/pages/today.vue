<script setup lang="ts">
const {
  todaysCompletedTasks,
  todaysUncompletedTasks,
  loadingTodaysCompletedTasks,
  loadingTodaysUncompletedTasks,
  refreshTodaysCompletedTasks,
  refreshTodaysUncompletedTasks,
  errorTodaysCompletedTasks,
  errorTodaysUncompletedTasks,
} = useTasks();

const lastCompletedTask = ref<string | undefined>();

const completedTasksToday = todaysCompletedTasks;

const timeOfDay = computed(() => {
  const hour = new Date().getHours();
  if (hour < 10) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
});

const todaysDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

const handleTaskCompleted = (taskTitle: string) => {
  // Show celebration for 8 seconds
  lastCompletedTask.value = taskTitle;

  setTimeout(() => {
    lastCompletedTask.value = undefined;
  }, 8000);

  refreshTodaysCompletedTasks();
  refreshTodaysUncompletedTasks();
};

const handleTaskAdded = () => {
  refreshTodaysCompletedTasks();
  refreshTodaysUncompletedTasks();
};

const todaysTotalTasks = computed(
  () =>
    (todaysCompletedTasks.value?.length ?? 0) +
    (todaysUncompletedTasks.value?.length ?? 0)
);
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white">
    <TopNavbar />
    <div class="flex-1 pt-20 pb-20">
      <FeedbackArea
        :total-tasks="todaysTotalTasks"
        :completed-tasks-today="completedTasksToday.length"
        :last-completed-task="lastCompletedTask"
        :time-of-day="timeOfDay"
      />
      <QuickAddTask :default-date="todaysDate" @task-added="handleTaskAdded" />

      <ViewTodaysTasks
        @task-completed="handleTaskCompleted"
        :todays-uncompleted="todaysUncompletedTasks"
        :loading-todays-uncompleted="loadingTodaysUncompletedTasks"
        :error-todays-uncompleted="errorTodaysUncompletedTasks?.message || null"
        :refresh-todays-uncompleted="refreshTodaysUncompletedTasks"
        :todays-completed="todaysCompletedTasks"
        :loading-todays-completed="loadingTodaysCompletedTasks"
        :refresh-todays-completed="refreshTodaysCompletedTasks"
        :error-todays-completed="errorTodaysCompletedTasks?.message || null"
        :todays-total="todaysTotalTasks"
      />
    </div>
    <Navbar />
  </div>
</template>
