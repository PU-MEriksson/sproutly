<script setup lang="ts">

const { 
  todaysCompletedTasks, 
  todaysUncompletedTasks, 
  loadingTodaysCompletedTasks, 
  loadingTodaysUncompletedTasks, 
  refreshTodaysCompletedTasks, 
  refreshTodaysUncompletedTasks, 
  errorTodaysCompletedTasks, 
  errorTodaysUncompletedTasks
        } = useTasks();

  const lastCompletedTask = ref<string | undefined>();

  const completedTasksToday = todaysCompletedTasks;

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

  refreshTodaysCompletedTasks();
  refreshTodaysUncompletedTasks();
};

const handleTaskAdded = () => {
  refreshTodaysCompletedTasks();
  refreshTodaysUncompletedTasks();
}

const todaysTotalTasks = computed(() => 
  (todaysCompletedTasks.value?.length ?? 0) +
  (todaysUncompletedTasks.value?.length ?? 0)
);

</script>

<template>
  <div class="bg-neutral-100 h-screen">
    <FeedbackArea
      :total-tasks="todaysTotalTasks"
      :completed-tasks-today="completedTasksToday.length"
      :last-completed-task="lastCompletedTask"
      :time-of-day="timeOfDay"
    />
    <QuickAddTask @task-added="handleTaskAdded" />

    <ViewTodaysTasks @task-completed="handleTaskCompleted" 
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
</template>
