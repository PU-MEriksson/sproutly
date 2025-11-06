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

  let currentDate = new Date().toJSON().slice(0, 10);

  type TaskFilter = {
  completed?: boolean;
  completed_date?: string;
  startdate_lte?: string;
};

function useTasksData(key: string, filters: TaskFilter) {
  return useAsyncData<TaskRow[]>(
    key,
    async () => {
      let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });

      if (filters.completed !== undefined) query = query.eq("completed", filters.completed);
      if (filters.completed_date) query = query.eq("completed_date", filters.completed_date);
      if (filters.startdate_lte) query = query.lte("startdate", filters.startdate_lte);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    { server: false, lazy: false }
  );
}

const {
  data: fetchedAllUncompletedTasks,
  pending: loadingAllUncompletedTasks,
  error: errorAllUncompletedTasks,
  refresh: refreshAllUncompletedTasks,
} = useTasksData("user-tasks-all-uncompleted", { completed: false });

const {
  data: fetchedAllCompletedTasks,
  pending: loadingAllCompletedTasks,
  error: errorAllCompletedTasks,
  refresh: refreshAllCompletedTasks,
} = useTasksData("user-tasks-all-completed", { completed: true });

const {
  data: fetchedTodaysUncompletedTasks,
  pending: loadingTodaysUncompletedTasks,
  error: errorTodaysUncompletedTasks,
  refresh: refreshTodaysUncompletedTasks,
} = useTasksData("user-tasks-today-uncompleted", { completed: false, startdate_lte: currentDate });

const {
  data: fetchedTodaysCompletedTasks,
  pending: loadingTodaysCompletedTasks,
  error: errorTodaysCompletedTasks,
  refresh: refreshTodaysCompletedTasks,
} = useTasksData("user-tasks-today-completed", { completed: true, completed_date: currentDate });



  /* const {
    data: fetchedAllUncompletedTasks,
    pending: loadingAllUncompletedTasks,
    error: errorAllUncompletedTasks,
    refresh: refreshAllUncompletedTasks,

  } = useAsyncData<TaskRow[]>(
    "user-tasks-all-uncompleted",
    async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("completed", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    {
      server: false, // Only fetch on client side since TaskAccordion is client-only
      lazy: false,
    }
  );

    const {
    data: fetchedAllCompletedTasks,
    pending: loadingAllCompletedTasks,
    error: errorAllCompletedTasks,
    refresh: refreshAllCompletedTasks,

  } = useAsyncData<TaskRow[]>(
    "user-tasks-all-completed",
    async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("completed", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    {
      server: false, // Only fetch on client side since TaskAccordion is client-only
      lazy: false,
    }
  );

  const {
    data: fetchedTodaysUncompletedTasks,
    pending: loadingTodaysUncompletedTasks,
    error: errorTodaysUncompletedTasks,
    refresh: refreshTodaysUncompletedTasks, 

  } = useAsyncData<TaskRow[]>(
    "user-tasks-today-uncompleted",
    async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .lte("startdate", currentDate)
        .eq("completed", false)       
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    {
      server: false,
      lazy: false
    }
  )

    const {
    data: fetchedTodaysCompletedTasks,
    pending: loadingTodaysCompletedTasks,
    error: errorTodaysCompletedTasks,
    refresh: refreshTodaysCompletedTasks, 
  } = useAsyncData<TaskRow[]>(
    "user-tasks-today-completed",
    async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("completed", true)       
        .eq("completed_date", currentDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    {
      server: false,
      lazy: false
    }
  ) */

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
/* 
      if (fetchedAllUncompletedTasks.value) {
        const idx = fetchedAllUncompletedTasks.value.findIndex((t) => t.id === id);
        if (idx !== -1) {
          fetchedAllUncompletedTasks.value.splice(idx, 1, updated);
        }
      } */

    await Promise.allSettled([
      refreshTodaysCompletedTasks(),
      refreshTodaysUncompletedTasks(),
      refreshAllCompletedTasks(),
      refreshAllUncompletedTasks(),
    ]);

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

      if (fetchedAllUncompletedTasks.value) {
        const idx = fetchedAllUncompletedTasks.value.findIndex((t) => t.id === id);
        if (idx !== -1) fetchedAllUncompletedTasks.value.splice(idx, 1);
      }

      console.debug("[useTasks] deleted task", id);
      return true;
    } catch (err) {
      console.error("[useTasks] deleteTask failed", err);
      throw err;
    }
  };

  return {
    allUncompletedTasks: computed<TaskRow[]>(() => fetchedAllUncompletedTasks.value ?? []),
    allCompletedTasks: computed<TaskRow[]>(() => fetchedAllCompletedTasks.value ?? []),
    todaysUncompletedTasks: computed<TaskRow[]>(()=>fetchedTodaysUncompletedTasks.value ?? []),
    todaysCompletedTasks: computed<TaskRow[]>(()=>fetchedTodaysCompletedTasks.value ?? []),
    loadingAllUncompletedTasks,
    loadingAllCompletedTasks,
    loadingTodaysUncompletedTasks,
    loadingTodaysCompletedTasks,
    errorAllUncompletedTasks,
    errorAllCompletedTasks,
    errorTodaysUncompletedTasks,
    errorTodaysCompletedTasks,
    refreshAllUncompletedTasks,
    refreshAllCompletedTasks,
    refreshTodaysUncompletedTasks,
    refreshTodaysCompletedTasks,
    addTask,
    updateTask,
    deleteTask,
  };
};