import type { Database } from "~/types/database.types";
import { useSubtasks } from "~/composables/useSubtask";
import { useSanitize } from "./useSanitize";
import { z } from "zod";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type SubtaskInsert = Database["public"]["Tables"]["subtasks"]["Insert"];

export const useTasks = () => {
  const taskInsertSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(2000).nullable().optional(),
    startdate: z.string().nullable().optional(),
    enddate: z.string().nullable().optional(),
    deadline: z.string().nullable().optional(),
    completed: z.boolean().optional(),
    completed_date: z.string().nullable().optional(),
    subtasks: z
      .array(z.object({ title: z.string().min(1).max(255) }))
      .optional()
      .default([]),
  });
  const { sanitizeTask } = useSanitize();
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
        let query = supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (filters.completed !== undefined)
          query = query.eq("completed", filters.completed);
        if (filters.completed_date)
          query = query.eq("completed_date", filters.completed_date);
        if (filters.startdate_lte)
          query = query.lte("startdate", filters.startdate_lte);

        const { data, error } = await query;
        if (error) throw error;
        return data ?? [];
      },
      {
        server: false,
        lazy: false,
        immediate: true,
      }
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
  } = useTasksData("user-tasks-today-uncompleted", {
    completed: false,
    startdate_lte: currentDate,
  });

  const {
    data: fetchedTodaysCompletedTasks,
    pending: loadingTodaysCompletedTasks,
    error: errorTodaysCompletedTasks,
    refresh: refreshTodaysCompletedTasks,
  } = useTasksData("user-tasks-today-completed", {
    completed: true,
    completed_date: currentDate,
  });

  const refreshAll = async () => {
    await Promise.allSettled([
      refreshTodaysCompletedTasks(),
      refreshTodaysUncompletedTasks(),
      refreshAllCompletedTasks(),
      refreshAllUncompletedTasks(),
    ]);
  };

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

    const clean = sanitizeTask({ title, description, subtasks });
    const parsed = taskInsertSchema.safeParse(clean);
    if (!parsed.success) throw new Error("Invalid task data");

    const newTask: TaskInsert = {
      title: parsed.data.title,
      description: parsed.data.description,
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

      if (parsed.data.subtasks && parsed.data.subtasks.length > 0) {
        await addSubtasks(taskData.id, parsed.data.subtasks);
      }

      tasks.value.unshift(taskData);

      return taskData;
    } catch (err) {
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

      const clean = sanitizeTask(updates);
      const parsed = taskInsertSchema.partial().safeParse(clean);
      if (!parsed.success) throw new Error("Invalid task data");

      const { data: updated, error: updateErr } = await supabase
        .from("tasks")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      if (!updated) throw new Error("Update returned no data");

      await refreshAll();

      return updated;
    } catch (err) {
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
        const idx = fetchedAllUncompletedTasks.value.findIndex(
          (t) => t.id === id
        );
        if (idx !== -1) fetchedAllUncompletedTasks.value.splice(idx, 1);
      }
      await refreshAll();

      return true;
    } catch (err) {
      throw err;
    }
  };

  const removeFromToday = async (id: number) => {
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
        .update({ startdate: null })
        .eq("id", id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      if (!updated) throw new Error("Update returned no data");

      await refreshAll();

      return updated;
    } catch (err) {
      throw err;
    }
  };

  const addToToday = async (id: number) => {
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
        .update({ startdate: currentDate })
        .eq("id", id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      if (!updated) throw new Error("Update returned no data");

      await refreshAll();

      return updated;
    } catch (err) {
      throw err;
    }
  };

  const checkAndResetDailyTasks = async () => {
    const userProfile = await ensureUserProfile();
    if (!userProfile) return;

    // Only run on client-side
    if (typeof window === "undefined") return;

    const { dailyResetPreference } = useUserSettings();

    // Check if it's a new day
    const lastCheckDate = localStorage.getItem("lastDailyCheck");
    const today = new Date().toISOString().split("T")[0] as string;

    if (lastCheckDate === today) {
      // Already checked today, skip
      return;
    }

    // Save that we checked today
    localStorage.setItem("lastDailyCheck", today);

    // If user chose "fresh start"
    if (dailyResetPreference.value === "fresh_start") {
      await performFreshStart(userProfile.id);
    }

    // If "carry_over" - do nothing, tasks remain automatically
  };

  const performFreshStart = async (profileId: string) => {
    // Find all incomplete tasks from yesterday or earlier
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ startdate: null })
        .eq("profile_id", profileId)
        .eq("completed", false)
        .lte("startdate", yesterdayStr);

      if (error) {
        return;
      }

      await refreshAll();
    } catch (err) {
      throw err;
    }
  };

  // Run check when composable is initialized (only on client)
  // Note: This should be called from a component's setup or onMounted, not here
  const initializeDailyCheck = () => {
    if (typeof window !== "undefined") {
      checkAndResetDailyTasks();
    }
  };

  return {
    allUncompletedTasks: computed<TaskRow[]>(
      () => fetchedAllUncompletedTasks.value ?? []
    ),
    allCompletedTasks: computed<TaskRow[]>(
      () => fetchedAllCompletedTasks.value ?? []
    ),
    todaysUncompletedTasks: computed<TaskRow[]>(
      () => fetchedTodaysUncompletedTasks.value ?? []
    ),
    todaysCompletedTasks: computed<TaskRow[]>(
      () => fetchedTodaysCompletedTasks.value ?? []
    ),
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
    removeFromToday,
    addToToday,
    checkAndResetDailyTasks,
    initializeDailyCheck,
  };
};
