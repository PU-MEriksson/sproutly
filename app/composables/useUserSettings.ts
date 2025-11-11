type DailyResetPreference = "fresh_start" | "carry_over";

interface UserSettings {
  id: string;
  username: string | null;
  updated_at: string | null;
  daily_reset_preference: string | null;
}

export const useUserSettings = () => {
  const supabase = useSupabaseClient<any>();
  const user = useSupabaseUser();

  const settings = ref<UserSettings | null>(null);
  const loading = ref(false);

  // Helper: robustly get the authenticated user's id
  const getUserId = async (): Promise<string | null> => {
    if (user.value?.id) return user.value.id;
    // Fallback: query auth directly (handles cases where the ref hasn't populated yet)
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  };

  const fetchSettings = async () => {
    const userId = await getUserId();
    if (!userId) return;

    loading.value = true;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      settings.value = data;
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      loading.value = false;
    }
  };

  const updateDailyResetPreference = async (
    preference: DailyResetPreference
  ) => {
    const userId = await getUserId();
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          daily_reset_preference: preference,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      if (settings.value) {
        settings.value.daily_reset_preference = preference;
      }

      return true;
    } catch (error) {
      console.error("Failed to update preference:", error);
      return false;
    }
  };

  // Computed to get the current preference with a default
  const dailyResetPreference = computed<DailyResetPreference>(() => {
    if (settings.value?.daily_reset_preference === "carry_over") {
      return "carry_over";
    }
    return "fresh_start"; // default
  });

  // Fetch on mount
  watch(
    user,
    (newUser) => {
      if (newUser) {
        fetchSettings();
      }
    },
    { immediate: true }
  );

  return {
    settings,
    loading,
    dailyResetPreference,
    updateDailyResetPreference,
    fetchSettings,
  };
};
