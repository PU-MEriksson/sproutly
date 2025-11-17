import type { Database } from "~/types/database.types";
import { toast } from "vue-sonner";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export const useTaskActions = (task: Ref<Task>) => {
  const { updateTask, deleteTask, removeFromToday, addToToday } = useTasks();
  const { isOnline } = useOnlineStatus();
  const { success: showSuccess, error: showError } = useAppToast();

  const updatingTask = ref(false);
  const deletingTask = ref(false);
  const togglingToday = ref(false);

  const currentDate = new Date().toJSON().slice(0, 10);

  const isOnToday = computed(() => {
    if (!task.value.startdate || task.value.completed) return false;
    const taskStartDate = new Date(task.value.startdate).toJSON().slice(0, 10);
    return taskStartDate <= currentDate;
  });

  const toggleCompletion = async (checked: boolean) => {
    if (!isOnline.value) {
      toast.error("You're offline. Please reconnect to make changes.");
      return { success: false, rollback: true };
    }

    updatingTask.value = true;
    try {
      await updateTask(task.value.id, {
        completed: checked,
        completed_date: currentDate,
      });

      if (checked) {
        showSuccess("Task completed!", `"${task.value.title}" marked as done.`);
      }

      return { success: true, rollback: false };
    } catch (error) {
      console.error("Failed to toggle task:", error);
      showError("Failed to update task");
      return { success: false, rollback: true };
    } finally {
      updatingTask.value = false;
    }
  };

  const deleteTaskAction = async () => {
    if (!isOnline.value) {
      toast.error("You're offline. Please reconnect to delete tasks.");
      return false;
    }

    if (!confirm("Are you sure you want to delete this task?")) return false;

    deletingTask.value = true;
    try {
      await deleteTask(task.value.id);
      showSuccess("Task deleted!");
      return true;
    } catch (error) {
      console.error("Failed to delete task:", error);
      showError("Failed to delete task");
      return false;
    } finally {
      deletingTask.value = false;
    }
  };

  const toggleToday = async () => {
    if (!isOnline.value) {
      toast.error("You're offline. Please reconnect to manage your tasks.");
      return false;
    }

    togglingToday.value = true;
    try {
      if (isOnToday.value) {
        await removeFromToday(task.value.id);
        showSuccess("Task removed from Today");
      } else {
        await addToToday(task.value.id);
        showSuccess("Task added to Today");
      }
      return true;
    } catch (error) {
      console.error("Failed to toggle task today status:", error);
      showError(
        isOnToday.value
          ? "Failed to remove from today"
          : "Failed to add to today"
      );
      return false;
    } finally {
      togglingToday.value = false;
    }
  };

  return {
    updatingTask,
    deletingTask,
    togglingToday,
    isOnToday,
    toggleCompletion,
    deleteTaskAction,
    toggleToday,
  };
};
