<script setup lang="ts">
import { toast } from "vue-sonner";

const props = defineProps<{
  showToast?: boolean;
  compact?: boolean;
  showHint?: boolean;
}>();

const { settings, dailyResetPreference, updateDailyResetPreference, loading } =
  useUserSettings();

type DailyResetPreference = "fresh_start" | "carry_over";

const handlePreferenceChange = async (value: string) => {
  const preference = value as DailyResetPreference;
  const success = await updateDailyResetPreference(preference);

  if (props.showToast !== false) {
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
  }
};
</script>

<template>
  <section aria-labelledby="daily-reset-heading">
    <h2
      v-if="!compact"
      id="daily-reset-heading"
      class="text-lg font-semibold text-calm-900 mb-2"
    >
      Daily reset behavior
    </h2>
    <h3
      v-else
      id="daily-reset-heading"
      class="text-base font-semibold text-calm-900 mb-2"
    >
      Daily reset behavior
    </h3>
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
            Incomplete tasks move to All Tasks automatically. Start each morning
            with a clean slate.
            <span class="font-medium">Recommended for reducing overwhelm.</span>
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
            Incomplete tasks stay on Today until you complete them or move them
            manually. Nothing gets forgotten.
          </p>
        </div>
      </label>
    </div>

    <div v-else class="text-calm-600 text-sm">Loading preferences...</div>

    <!-- Optional hint text -->
    <p v-if="showHint" class="text-xs text-calm-600 mt-3 italic">
      You can always change this later in Settings.
    </p>
  </section>
</template>
