<script setup lang="ts">
import { toast } from "vue-sonner";
import { Separator } from "@/components/ui/separator";

const supabase = useSupabaseClient();
const { settings, dailyResetPreference, updateDailyResetPreference, loading } =
  useUserSettings();

type DailyResetPreference = "fresh_start" | "carry_over";

const handlePreferenceChange = async (value: string) => {
  const preference = value as DailyResetPreference;
  const success = await updateDailyResetPreference(preference);

  if (success) {
    toast.success("Preference saved! ✓", {
      description:
        preference === "fresh_start"
          ? "Your Today list will reset each morning."
          : "Incomplete tasks will stay on Today until done.",
    });
  } else {
    toast.error("Failed to save", {
      description: "Please try again.",
    });
  }
};

async function logout() {
  await supabase.auth.signOut();
  navigateTo("/login");
}
</script>

<template>
  <div class="min-h-screen bg-white pb-20 pt-20">
    <TopNavbar />
    <div class="max-w-2xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-calm-800 mb-6">Settings</h1>

      <div class="space-y-6">
        <Separator />
        <!-- Daily Reset Preference Section -->
        <section aria-labelledby="daily-reset-heading">
          <h2
            id="daily-reset-heading"
            class="text-lg font-semibold text-calm-900 mb-2"
          >
            Daily reset behavior
          </h2>
          <p class="text-sm text-calm-600 mb-4">
            How should we handle incomplete tasks at the end of each day?
          </p>

          <div
            v-if="settings"
            class="space-y-3"
            role="radiogroup"
            aria-labelledby="daily-reset-heading"
          >
            <!-- Fresh Start Option -->
            <label
              class="flex items-start gap-4 p-0 rounded-lg cursor-pointer transition-all"
            >
              <input
                type="radio"
                name="daily-reset"
                value="fresh_start"
                :checked="dailyResetPreference === 'fresh_start'"
                @change="handlePreferenceChange('fresh_start')"
                :disabled="loading"
                class="mt-0.5 w-4 h-4 accent-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 cursor-pointer"
              />
              <div class="flex-1 min-w-0">
                <div
                  class="mb-1 transition-colors"
                  :class="
                    dailyResetPreference === 'fresh_start'
                      ? 'font-bold text-calm-900'
                      : 'font-semibold text-calm-700'
                  "
                >
                  Fresh start each day ✨
                </div>
                <p
                  class="text-sm leading-relaxed transition-colors"
                  :class="
                    dailyResetPreference === 'fresh_start'
                      ? 'text-calm-700'
                      : 'text-calm-600'
                  "
                >
                  Incomplete tasks move to All Tasks automatically. Start each
                  morning with a clean slate.
                  <span class="font-medium"
                    >Recommended for reducing overwhelm.</span
                  >
                </p>
              </div>
            </label>

            <!-- Carry Over Option -->
            <label
              class="flex items-start gap-4 p-0 rounded-lg cursor-pointer transition-all"
            >
              <input
                type="radio"
                name="daily-reset"
                value="carry_over"
                :checked="dailyResetPreference === 'carry_over'"
                @change="handlePreferenceChange('carry_over')"
                :disabled="loading"
                class="mt-0.5 w-4 h-4 accent-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 cursor-pointer"
              />
              <div class="flex-1 min-w-0">
                <div
                  class="mb-1 transition-colors"
                  :class="
                    dailyResetPreference === 'carry_over'
                      ? 'font-bold text-calm-900'
                      : 'font-semibold text-calm-700'
                  "
                >
                  Keep incomplete tasks 📌
                </div>
                <p
                  class="text-sm leading-relaxed transition-colors"
                  :class="
                    dailyResetPreference === 'carry_over'
                      ? 'text-calm-700'
                      : 'text-calm-600'
                  "
                >
                  Incomplete tasks stay on Today until you complete them or move
                  them manually. Nothing gets forgotten.
                </p>
              </div>
            </label>
          </div>

          <div v-else class="text-calm-600">Loading preferences...</div>
        </section>

        <Separator />

        <!-- About Link -->
        <NuxtLink
          to="/about"
          class="block p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-calm-200/40 hover:border-calm-300 transition-all"
        >
          <span class="text-calm-700 font-medium">About SupportiveToDo</span>
          <p class="text-sm text-calm-600 mt-1">
            Learn more about our mission and features
          </p>
        </NuxtLink>

        <!-- Logout Button -->
        <button
          @click="logout"
          class="w-full p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 text-red-700 font-medium transition-all"
        >
          Log out
        </button>
      </div>
    </div>
  </div>
  <Navbar />
</template>
