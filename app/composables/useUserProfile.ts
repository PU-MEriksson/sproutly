// composables/useUserProfile.ts

interface Profile {
  id: string;
  username: string | null;
  updated_at: string;
}

interface ProfileError {
  message: string;
  code?: string;
}

export const useUserProfile = () => {
  const supabase = useSupabaseClient<any>();
  const user = useSupabaseUser();

  // State
  const profile = ref<Profile | null>(null);
  const loading = ref(false);
  const error = ref<ProfileError | null>(null);

  // Helper: robustly get the authenticated user's id
  const getUserId = async (): Promise<string | null> => {
    if (user.value?.id) return user.value.id;
    // Fallback: query auth directly (handles cases where the ref hasn't populated yet)
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  };

  // Computed - check if user has a username
  const hasUsername = computed(() => {
    return (
      profile.value !== null &&
      profile.value.username !== null &&
      profile.value.username !== ""
    );
  });

  // Fetch user profile
  const fetchProfile = async () => {
    const userId = await getUserId();
    if (!userId) {
      error.value = { message: "No user is logged in" };
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      profile.value = data;
      return data;
    } catch (err: any) {
      error.value = {
        message: err.message || "Could not fetch profile",
        code: err.code,
      };
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Update username
  const updateUsername = async (username: string) => {
    const userId = await getUserId();
    if (!userId) {
      error.value = { message: "No user is logged in" };
      return false;
    }

    // Validation
    if (!username || username.trim() === "") {
      error.value = { message: "Your name cannot be empty" };
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ username: username.trim() })
        .eq("id", userId)
        .select()
        .single();

      // Update local profile state
      profile.value = data;
      return true;
    } catch (err: any) {
      error.value = {
        message: err.message || "Kunde inte uppdatera användarnamn",
        code: err.code,
      };
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Reset error
  const clearError = () => {
    error.value = null;
  };

  return {
    profile: readonly(profile),
    loading: readonly(loading),
    error: readonly(error),
    hasUsername,
    fetchProfile,
    updateUsername,
    clearError,
  };
};
