<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { WandSparkles, Rocket } from "lucide-vue-next";
import { toast } from "vue-sonner";
import type { Database } from "~/types/database.types";

type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];

const props = defineProps<{
  taskId: number;
  taskTitle: string;
  taskDescription?: string | null;
  existingSubtasks: Subtask[];
}>();

const emit = defineEmits<{
  (e: "subtasks-added", subtasks: Subtask[]): void;
  (e: "first-step-generated", firstStep: string): void;
}>();

const { isOnline } = useOnlineStatus();
const { addSubtasks } = useSubtasks();

const aiComposable = useAI();
const {
  generateSubtasks,
  generateFirstStep,
  error: aiError,
  subtasks: aiSubtasks,
  firstStep: aiFirstStep,
} = aiComposable;

// Local state
const aiGenerationError = ref<string | null>(null);
const isGeneratingSubtasks = ref(false);
const isGeneratingFirstStep = ref(false);
const showHint = ref(false);
const hint = ref("");

// Generate first step with AI
const handleGenerateFirstStep = async () => {
  if (!isOnline.value) {
    aiGenerationError.value =
      "You're offline. AI features require an internet connection.";
    return;
  }

  isGeneratingFirstStep.value = true;
  aiGenerationError.value = null;

  try {
    // Prepare existing subtasks to send to AI
    const existingSubtasksForAI = props.existingSubtasks.map((st) => ({
      title: st.title,
      completed: st.completed ?? false,
    }));

    // Call AI to generate first step, passing existing subtasks
    await generateFirstStep(
      props.taskTitle,
      props.taskDescription || undefined,
      existingSubtasksForAI
    );

    // Check if AI generation failed
    if (aiError.value) {
      aiGenerationError.value =
        "Failed to generate a first step to get started. Please try again.";
      return;
    }

    // Check if we got a first step
    if (!aiFirstStep.value) {
      aiGenerationError.value =
        "No first step was generated. Please try again.";
      return;
    }

    // Show the hint
    if (aiFirstStep.value) {
      hint.value = aiFirstStep.value.title;
      showHint.value = true;
      emit("first-step-generated", aiFirstStep.value.title);
    }
  } catch (error) {
    console.error("Failed to generate a first step with AI:", error);
    aiGenerationError.value = "An unexpected error occurred. Please try again.";
  } finally {
    isGeneratingFirstStep.value = false;
  }
};

// Generate subtasks with AI
const handleGenerateSubtasks = async () => {
  if (!isOnline.value) {
    aiGenerationError.value =
      "You're offline. AI features require an internet connection.";
    return;
  }

  isGeneratingSubtasks.value = true;
  aiGenerationError.value = null;

  try {
    // Prepare existing subtasks to send to AI
    const existingSubtasksForAI = props.existingSubtasks.map((st) => ({
      title: st.title,
      completed: st.completed ?? false,
    }));

    // Call AI to generate subtasks, passing existing ones
    await generateSubtasks(
      props.taskTitle,
      props.taskDescription || undefined,
      existingSubtasksForAI
    );

    // Check if AI generation failed
    if (aiError.value) {
      aiGenerationError.value =
        "Failed to generate subtasks. Please try again.";
      return;
    }

    // Check if we got any subtasks
    if (!aiSubtasks.value || aiSubtasks.value.length === 0) {
      aiGenerationError.value =
        "No subtasks were generated. The task might already be simple enough!";
      return;
    }

    // Try to save them to the database
    try {
      const newSubtasks = await addSubtasks(props.taskId, aiSubtasks.value);
      console.log("AI subtasks generated and saved!", newSubtasks);
      emit("subtasks-added", newSubtasks);
    } catch (dbError) {
      console.error("Failed to save subtasks to database:", dbError);
      aiGenerationError.value = "Failed to save subtasks. Please try again.";
    }
  } catch (error) {
    console.error("Failed to generate subtasks with AI:", error);
    aiGenerationError.value = "An unexpected error occurred. Please try again.";
  } finally {
    isGeneratingSubtasks.value = false;
  }
};

// Hint handling
const handleDismissHint = () => {
  showHint.value = false;
  setTimeout(() => {
    hint.value = "";
  }, 200);
};

const handleAddFirstStepAsSubtask = async () => {
  if (!isOnline.value) {
    toast.error("You're offline. Please reconnect to add subtasks.");
    return;
  }

  if (!hint.value.trim()) return;

  try {
    const newSubtasks = await addSubtasks(props.taskId, [
      {
        title: hint.value.trim(),
        is_first_step: true,
      },
    ]);

    if (newSubtasks.length > 0 && newSubtasks[0]) {
      toast.success("First step added as subtask!");
      emit("subtasks-added", newSubtasks);
    }

    // Close hint with animation
    showHint.value = false;
    setTimeout(() => {
      hint.value = "";
    }, 200);
  } catch (error) {
    console.error("Failed to add first step as subtask:", error);
    toast.error("Failed to add first step as subtask");
  }
};
</script>

<template>
  <div class="space-y-3">
    <!-- Error message -->
    <div
      v-if="aiGenerationError || aiError"
      class="p-4 bg-red-50 border border-red-200 rounded-xl"
    >
      <p class="text-sm text-red-700 font-medium">
        {{ aiGenerationError || aiError }}
      </p>
      <button
        @click="handleGenerateSubtasks"
        class="mt-2 text-sm text-red-700 hover:text-red-800 underline underline-offset-2"
      >
        Try again
      </button>
    </div>

    <!-- First Step Hint Card -->
    <Transition
      name="hint"
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <Card
        v-if="showHint"
        class="bg-gradient-to-br from-calm-100 via-calm-50 to-blue-50 border border-calm-200/50 shadow-sm"
      >
        <CardContent class="pt-4">
          <div class="flex items-start gap-3">
            <Rocket class="h-5 w-5 text-calm-600 mt-0.5" />
            <div class="flex-1">
              <p class="font-medium text-sm text-calm-900 mb-1">
                To get started:
              </p>
              <p class="text-sm text-calm-700 leading-relaxed">
                {{ hint }}
              </p>
            </div>
          </div>

          <div class="flex flex-col items-start gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              @click="handleDismissHint"
              class="text-calm-600 hover:text-calm-700 hover:bg-calm-100/70 w-auto px-3 py-1 text-sm h-auto"
            >
              ✓ Got it, thanks
            </Button>
            <Button
              variant="outline"
              size="sm"
              @click="handleAddFirstStepAsSubtask"
              class="border-calm-300 text-calm-700 hover:bg-calm-50 w-auto px-3 py-1 text-sm h-auto"
            >
              + Add as subtask
            </Button>
          </div>
        </CardContent>
      </Card>
    </Transition>

    <div class="space-y-2">
      <!-- AI Generation Buttons -->
      <div class="grid grid-cols-2 gap-2">
        <Button
          @click="handleGenerateSubtasks"
          :disabled="isGeneratingSubtasks || !isOnline"
          size="lg"
          class="flex items-center justify-center gap-2"
        >
          <Spinner v-if="isGeneratingSubtasks" class="h-4 w-4" />
          <WandSparkles v-else class="h-4 w-4" />
          <span>{{
            isGeneratingSubtasks ? "Thinking..." : "Break down task"
          }}</span>
        </Button>
        <Button
          @click="handleGenerateFirstStep"
          :disabled="isGeneratingFirstStep || !isOnline"
          variant="outline"
          size="lg"
          class="flex items-center justify-center gap-2"
        >
          <Spinner v-if="isGeneratingFirstStep" class="h-4 w-4" />
          <Rocket v-else class="h-4 w-4" />
          <span>{{
            isGeneratingFirstStep ? "Thinking..." : "Help me start"
          }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>
