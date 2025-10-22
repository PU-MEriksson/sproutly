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
    if (!user.value?.id) {
      error.value = { message: "Ingen användare inloggad" };
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.value.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      profile.value = data;
      return data;
    } catch (err: any) {
      error.value = {
        message: err.message || "Kunde inte hämta profil",
        code: err.code,
      };
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Update username
  const updateUsername = async (username: string) => {
    if (!user.value) {
      error.value = { message: "Ingen användare inloggad" };
      return false;
    }

    // Validation
    if (!username || username.trim() === "") {
      error.value = { message: "Användarnamn kan inte vara tomt" };
      return false;
    }

    // Additional validation rules can be added here
    if (username.length < 3) {
      error.value = { message: "Användarnamn måste vara minst 3 tecken" };
      return false;
    }

    if (username.length > 30) {
      error.value = {
        message: "Användarnamn kan inte vara längre än 30 tecken",
      };
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ username: username.trim() })
        .eq("id", user.value.id)
        .select()
        .single();

      if (updateError) {
        // Kolla om det är en unique constraint-fel
        if (updateError.code === "23505") {
          throw new Error("Användarnamnet är redan taget");
        }
        throw updateError;
      }

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
