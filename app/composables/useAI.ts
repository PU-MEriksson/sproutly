interface Subtask {
  title: string;
}

interface ExistingSubtask {
  title: string;
  completed: boolean;
}

export function useAI() {
  const subtasks = ref<Subtask[]>([]);
  const firstStep = ref<Subtask | null>(null);
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
    } finally {
      loading.value = false;
    }
  };

  const generateFirstStep = async (
    taskTitle: string,
    taskDescription?: string,
    existingSubtasks?: ExistingSubtask[]
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<Subtask[]>("/api/generate-first-step", {
        method: "POST",
        body: {
          title: taskTitle,
          description: taskDescription,
          existingSubtasks: existingSubtasks || [],
        },
      });

      // Save first step in separate state
      firstStep.value = response[0] || null;
    } catch (err: any) {
      error.value =
        err.message ||
        "An error occurred while generating a first step to get started.";
    } finally {
      loading.value = false;
    }
  };

  return {
    subtasks,
    firstStep,
    loading,
    error,
    generateSubtasks,
    generateFirstStep,
  };
}
