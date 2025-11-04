<script setup lang="ts">
const { tasks, loading, error, refresh } = useTasks();
const lastCompletedTask = ref<string | undefined>();

// Total tasks assigned for today
const todaysTasks = computed(() => {
  const today = new Date().toISOString().split("T")[0]!; // Gets 'YYYY-MM-DD'

  return tasks.value.filter((task) => {
    // Only includes tasks that have a startdate AND it's today or earlier
    if (!task.startdate) return false;
    return task.startdate <= today;
  });
});

// Completed tasks today
const completedTasksToday = computed(() => {
  const today = new Date().toISOString().split("T")[0]!; // Gets 'YYYY-MM-DD'

  return tasks.value.filter((task) => {
    // Only includes tasks that have a startdate AND it's today
    if (!task.startdate) return false;
    return task.startdate === today && task.completed;
  });
});

const timeOfDay = computed(() => {
  const hour = new Date().getHours();
  if (hour < 10) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
});

const handleTaskCompleted = (taskTitle: string) => {
  // Visa celebration i 8 sekunder
  lastCompletedTask.value = taskTitle;

  setTimeout(() => {
    lastCompletedTask.value = undefined;
  }, 8000);

  refresh();
};

const handleTaskAdded = () => {
  refresh();
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
    <ViewTasks @task-completed="handleTaskCompleted" />
  </div>
  <Navbar />
</template>
