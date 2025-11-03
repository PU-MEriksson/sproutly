interface Subtask {
  title: string;
}

interface ExistingSubtask {
  title: string;
  completed: boolean;
}

export function useAI() {
  const subtasks = ref<Subtask[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const generateSubtasks = async (
    taskTitle: string,
    taskDescription?: string,
    existingSubtasks?: ExistingSubtask[]
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<Subtask[]>("/api/generate-subtasks", {
        method: "POST",
        body: {
          title: taskTitle,
          description: taskDescription,
          existingSubtasks: existingSubtasks || [],
        },
      });

      // Save response in state
      subtasks.value = response;
    } catch (err: any) {
      error.value =
        err.message || "An error occurred while generating subtasks.";
      console.error("[useAI] Error generating subtasks:", err);
    } finally {
      loading.value = false;
    }
  };

  return {
    subtasks,
    loading,
    error,
    generateSubtasks,
  };
}
