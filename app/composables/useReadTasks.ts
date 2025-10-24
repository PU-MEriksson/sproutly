export const useReadTasks = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const tasks = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getUserId = async () => {
    const id = user.value?.id ?? (await supabase.auth.getUser()).data.user?.id;
    return id ?? null;
  };

  const getTasks = async () => {
    const uid = await getUserId();
    if (!uid) {
      error.value = "No user/session";
      console.warn("useReadTasks:getTasks → no uid");
      return;
    }

    loading.value = true;
    error.value = null;

    const {
      data,
      error: err,
      count,
    } = await supabase
      .from("tasks")
      .select("*", { count: "exact" }) // RLS returns only the caller's rows
      .order("created_at", { ascending: false });

    if (err) {
      error.value = err.message;
      tasks.value = [];
      console.error("useReadTasks:getTasks error:", err);
    } else {
      tasks.value = data ?? [];
      console.log("useReadTasks:getTasks rows:", count, data);
    }

    loading.value = false;
  };

  return { tasks, loading, error, getTasks };
};
