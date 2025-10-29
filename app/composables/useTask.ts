import type { Database } from "~/types/database.types";
import { useSubtasks } from "~/composables/useSubtask";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type SubtaskInsert = Database["public"]["Tables"]["subtasks"]["Insert"];

export const useTasks = () => {
  const supabase = useSupabaseClient<Database>();
  const { profile, fetchProfile } = useUserProfile();
  const { addSubtasks } = useSubtasks();
  const tasks = ref<TaskRow[]>([]);

  const ensureUserProfile = async () => {
    if (!profile.value) await fetchProfile();
    return profile.value;
  };

  const {
    data: fetchedTasks,
    pending: loading,
    error,
    refresh,
  } = useLazyAsyncData<TaskRow[]>("user-tasks", async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  });

  const addTask = async (
    title: string,
    description?: string,
    startdate?: string,
    enddate?: string,
    deadline?: string,
    subtasks?: Omit<SubtaskInsert, "task_id">[]
  ) => {
    const userProfile = await ensureUserProfile();
    if (!userProfile) throw new Error("No user profile found");

    const newTask: TaskInsert = {
      title,
      description,
      startdate,
      enddate,
      deadline,
      profile_id: userProfile.id,
    };

    try {
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .insert(newTask)
        .select()
        .single();

      if (taskError) throw taskError;
      if (!taskData) throw new Error("Task insertion returned no data");

      if (subtasks && subtasks.length > 0) {
        await addSubtasks(taskData.id, subtasks);
      }

      tasks.value.unshift(taskData);
      console.debug("[useTasks] inserted task", taskData);

      return taskData;
    } catch (err) {
      console.error("[useTasks] addTask failed", err);
      throw err;
    }
  };

  return {
    tasks: computed<TaskRow[]>(() => fetchedTasks.value ?? []),
    loading,
    error,
    refresh,
    addTask,
  };
};
