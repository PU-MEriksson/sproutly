type Task = {
  id: number;
  title: string | null;
  description: string | null;
  profile_id: string;
  created_at: string;
  completed: boolean;
  startdate: string | null;
};

export const useReadTasks = () => {
  const supabase = useSupabaseClient();

  const {
    data: tasks,
    pending: loading,
    error,
    refresh,
  } = useLazyAsyncData<Task[]>("user-tasks", async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, description, profile_id, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  });

  return {
    tasks: computed<Task[]>(() => tasks.value ?? []),
    loading,
    error,
    refresh,
  };
};
