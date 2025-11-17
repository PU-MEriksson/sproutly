import type { Database } from "~/types/database.types";

type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];

export const useSubtaskProgress = (taskId: number) => {
  const { fetchSubtasks } = useSubtasks();
  const subtasks = ref<Subtask[]>([]);

  const subtaskProgress = computed(() => {
    if (subtasks.value.length === 0) return 0;
    const completed = subtasks.value.filter((st) => st.completed).length;
    return Math.round((completed / subtasks.value.length) * 100);
  });

  const hasSubtasks = computed(() => subtasks.value.length > 0);

  const loadSubtasks = async () => {
    try {
      const fetchedSubtasks = await fetchSubtasks(taskId);
      subtasks.value = fetchedSubtasks.sort((a, b) => {
        if (a.is_first_step && !b.is_first_step) return -1;
        if (!a.is_first_step && b.is_first_step) return 1;
        return 0;
      });
    } catch (error) {
      console.error("Failed to load subtasks:", error);
    }
  };

  const updateSubtasks = (updated: Subtask[]) => {
    subtasks.value = updated;
  };

  return {
    subtasks,
    subtaskProgress,
    hasSubtasks,
    loadSubtasks,
    updateSubtasks,
  };
};
