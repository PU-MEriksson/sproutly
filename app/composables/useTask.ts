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
  } = useAsyncData<TaskRow[]>(
    "user-tasks",
    async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    {
      server: false, // Only fetch on client side since TaskAccordion is client-only
      lazy: false,
    }
  );

  let currentDate = new Date().toJSON().slice(0, 10);
  
  const {
    data: fetchedTodaysTasks,
    pending: loadingToday,
    error: errorToday,
    refresh: refreshToday, 
  } = useAsyncData<TaskRow[]>(
    "user-tasks-today",
    async () => {
      const {data, error} = await supabase
      .from("tasks")
      .select("*")
      .or(`startdate.eq.${currentDate},and(startdate.lt.${currentDate},completed.is.false)`)
      .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    {
      server: false,
      lazy: false
    }
  )

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

  const updateTask = async (id: number, updates: Partial<TaskInsert>) => {
    const userProfile = await ensureUserProfile();
    if (!userProfile) throw new Error("No user profile found");

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from("tasks")
        .select("profile_id")
        .eq("id", id)
        .single();

      if (fetchErr) throw fetchErr;
      if (!existing) throw new Error("Task not found");
      if (existing.profile_id !== userProfile.id) {
        throw new Error("Not allowed to update this task");
      }

      const { data: updated, error: updateErr } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      if (!updated) throw new Error("Update returned no data");

      if (fetchedTasks.value) {
        const idx = fetchedTasks.value.findIndex((t) => t.id === id);
        if (idx !== -1) {
          fetchedTasks.value.splice(idx, 1, updated);
        }
      }

      console.debug("[useTasks] updated task", updated);
      return updated;
    } catch (err) {
      console.error("[useTasks] updateTask failed", err);
      throw err;
    }
  };

  const deleteTask = async (id: number) => {
    const userProfile = await ensureUserProfile();
    if (!userProfile) throw new Error("No user profile found");

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from("tasks")
        .select("profile_id")
        .eq("id", id)
        .single();

      if (fetchErr) throw fetchErr;
      if (!existing) throw new Error("Task not found");
      if (existing.profile_id !== userProfile.id) {
        throw new Error("Not allowed to delete this task");
      }

      const { error: delErr } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (delErr) throw delErr;

      if (fetchedTasks.value) {
        const idx = fetchedTasks.value.findIndex((t) => t.id === id);
        if (idx !== -1) fetchedTasks.value.splice(idx, 1);
      }

      console.debug("[useTasks] deleted task", id);
      return true;
    } catch (err) {
      console.error("[useTasks] deleteTask failed", err);
      throw err;
    }
  };

  return {
    tasks: computed<TaskRow[]>(() => fetchedTasks.value ?? []),
    todaysTasks: computed<TaskRow[]>(()=>fetchedTodaysTasks.value ?? []),
    loading,
    loadingToday,
    error,
    errorToday,
    refresh,
    refreshToday,
    addTask,
    updateTask,
    deleteTask,
  };
};
