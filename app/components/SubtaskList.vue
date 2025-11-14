<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  WandSparkles,
  Pencil,
  Trash2,
  Plus,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
} from "lucide-vue-next";
import { toast } from "vue-sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import SubtaskList from "./SubtaskList.vue";
import type { Database } from "~/types/database.types";

const props = defineProps<{
  taskId: number;
  taskTitle: string;
  taskDescription?: string | null;
}>();

const emit = defineEmits<{
  (e: "subtasks-changed", subtasks: Subtask[]): void;
  (e: "subtask-completed", subtaskTitle: string): void;
}>();

type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];

const { celebrateTask, celebrateSubtask } = useCelebration();
const { isOnline } = useOnlineStatus();

const {
  fetchSubtasks,
  toggleSubtaskCompleted,
  deleteSubtask,
  addSubtasks,
  updateSubtask,
} = useSubtasks();

const aiComposable = useAI();
const {
  generateSubtasks,
  generateFirstStep,
  loading: aiLoading,
  error: aiError,
  subtasks: aiSubtasks,
  firstStep: aiFirstStep, // Add this to destructure firstStep
} = aiComposable;

const subtasks = ref<Subtask[]>([]);
const aiGenerationError = ref<string | null>(null);
const loadingSubtasks = ref(false);
const subtasksError = ref<string | null>(null);
const newSubtaskTitle = ref("");
const isAddingSubtask = ref(false);
const showAddInput = ref(false);
const addInputRef = ref<HTMLInputElement | null>(null);
const editingSubtaskId = ref<number | null>(null);
const editingSubtaskTitle = ref("");
const editInputRefs = ref<{ [key: number]: HTMLInputElement | null }>({});

const loadSubtasks = async () => {
  loadingSubtasks.value = true;
  subtasksError.value = null;
  try {
    const fetchedSubtasks = await fetchSubtasks(props.taskId);
    // Explicitly maintain creation order, don't sort by completion
    subtasks.value = fetchedSubtasks;
  } catch (error) {
    console.error("Failed to load subtasks:", error);
    subtasksError.value = "Failed to load subtasks";
  } finally {
    loadingSubtasks.value = false;
  }
};

const handleSubtaskToggle = async (
  subtaskId: number,
  completed: boolean | string
) => {
  if (!isOnline.value) {
    // Revert the checkbox immediately
    const subtask = subtasks.value.find((st) => st.id === subtaskId);
    if (subtask) {
      subtask.completed = !subtask.completed;
      subtasks.value = [...subtasks.value];
    }
    toast.error("You're offline. Please reconnect to make changes.");
    return;
  }

  // Convert to boolean in case the checkbox returns a string
  const isCompleted = completed === true || completed === "true";

  console.log("Toggling subtask:", subtaskId, "to:", isCompleted);

  // Find the current index to maintain order
  const currentIndex = subtasks.value.findIndex((st) => st.id === subtaskId);

  try {
    await toggleSubtaskCompleted(subtaskId, isCompleted);

    // Update local state while preserving array order
    const subtask = subtasks.value.find((st) => st.id === subtaskId);
    if (subtask) {
      // Update in place to maintain order
      subtask.completed = isCompleted;
      // Force reactivity update
      subtasks.value = [...subtasks.value];
    }

    // Celebrate if marking as complete
    if (isCompleted) {
      console.log("Celebrating subtask completion!");
      celebrateSubtask();
    }
  } catch (error) {
    console.error("Failed to toggle subtask:", error);
    // Revert local state on error
    const subtask = subtasks.value.find((st) => st.id === subtaskId);
    if (subtask) {
      subtask.completed = !isCompleted;
      subtasks.value = [...subtasks.value];
    }
  }
};

const handleDeleteSubtask = async (subtaskId: number) => {
  if (!isOnline.value) {
    toast.error("You're offline. Please reconnect to delete subtasks.");
    return;
  }

  try {
    await deleteSubtask(subtaskId);
    // Remove from local state
    subtasks.value = subtasks.value.filter((st) => st.id !== subtaskId);
  } catch (error) {
    console.error("Failed to delete subtask:", error);
  }
};

const handleAddSubtask = async () => {
  if (!isOnline.value) {
    toast.error("You're offline. Please reconnect to add subtasks.");
    return;
  }

  if (!newSubtaskTitle.value.trim()) return;

  isAddingSubtask.value = true;
  try {
    const newSubtasks = await addSubtasks(props.taskId, [
      { title: newSubtaskTitle.value.trim() },
    ]);

    // Add to local state
    if (newSubtasks.length > 0 && newSubtasks[0]) {
      subtasks.value.push(newSubtasks[0]);
    }

    // Clear input and hide
    newSubtaskTitle.value = "";
    showAddInput.value = false;
  } catch (error) {
    console.error("Failed to add subtask:", error);
  } finally {
    isAddingSubtask.value = false;
  }
};

const startAddingSubtask = () => {
  showAddInput.value = true;
  nextTick(() => {
    addInputRef.value?.focus();
  });
};

const cancelAddingSubtask = () => {
  newSubtaskTitle.value = "";
  showAddInput.value = false;
};

const startEditingSubtask = (subtask: Subtask) => {
  editingSubtaskId.value = subtask.id;
  editingSubtaskTitle.value = subtask.title;
  nextTick(() => {
    editInputRefs.value[subtask.id]?.focus();
  });
};

const handleEditSubtask = async (subtaskId: number) => {
  if (!editingSubtaskTitle.value.trim()) {
    cancelEditingSubtask();
    return;
  }

  try {
    await updateSubtask(subtaskId, { title: editingSubtaskTitle.value.trim() });

    // Update local state
    const subtask = subtasks.value.find((st) => st.id === subtaskId);
    if (subtask) {
      subtask.title = editingSubtaskTitle.value.trim();
    }

    cancelEditingSubtask();
  } catch (error) {
    console.error("Failed to update subtask:", error);
  }
};

const cancelEditingSubtask = () => {
  editingSubtaskId.value = null;
  editingSubtaskTitle.value = "";
};

// Load subtasks on component mount
onMounted(() => {
  loadSubtasks();
});

// Generate first step with AI
const handleGenerateFirstStep = async () => {
  if (!isOnline.value) {
    aiGenerationError.value =
      "You're offline. AI features require an internet connection.";
    return;
  }

  aiGenerationError.value = null; // Clear previous errors

  try {
    // Prepare existing subtasks to send to AI
    const existingSubtasksForAI = subtasks.value.map((st) => ({
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

    // Log the first step to console (not saving to database)
    console.log("AI first step generated:", aiFirstStep.value);

    toast.success(`First step: ${aiFirstStep.value.title}`);
  } catch (error) {
    console.error("Failed to generate a first step with AI:", error);
    aiGenerationError.value = "An unexpected error occurred. Please try again.";
  }
};

// Generate subtasks with AI
const handleGenerateSubtasks = async () => {
  if (!isOnline.value) {
    aiGenerationError.value =
      "You're offline. AI features require an internet connection.";
    return;
  }

  aiGenerationError.value = null; // Clear previous errors

  try {
    // Prepare existing subtasks to send to AI
    const existingSubtasksForAI = subtasks.value.map((st) => ({
      title: st.title,
      completed: st.completed ?? false,
    }));

    // Call AI to generate subtasks, passing existing ones
    await generateSubtasks(
      props.taskTitle,
      props.taskDescription || undefined,
      existingSubtasksForAI
    ); // Check if AI generation failed
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

      // Add to local state to display them
      subtasks.value.push(...newSubtasks);

      console.log("AI subtasks generated and saved!", newSubtasks);
    } catch (dbError) {
      console.error("Failed to save subtasks to database:", dbError);
      aiGenerationError.value = "Failed to save subtasks. Please try again.";
    }
  } catch (error) {
    console.error("Failed to generate subtasks with AI:", error);
    aiGenerationError.value = "An unexpected error occurred. Please try again.";
  }
};

defineExpose({ loadSubtasks });
</script>

<template>
  <!-- Error message -->
  <div
    v-if="aiGenerationError || aiError"
    class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
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

  <!-- Subtasks section -->
  <div class="space-y-3">
    <!-- <h4 class="text-sm font-semibold text-calm-700">Subtasks</h4> -->

    <p v-if="loadingSubtasks" class="text-sm text-calm-500">
      Loading subtasks...
    </p>
    <p v-else-if="subtasksError" class="text-sm text-red-600">
      {{ subtasksError }}
    </p>

    <div v-else-if="subtasks.length > 0" class="space-y-2">
      <div
        v-for="subtask in subtasks"
        :key="subtask.id"
        class="group flex items-center gap-3 p-3 bg-white/40 hover:bg-calm-50 rounded-lg transition-all duration-150 border border-transparent hover:border-calm-200/40"
      >
        <Checkbox
          :id="`subtask-${subtask.id}`"
          :checked="subtask.completed ?? false"
          @click.stop="
            () => handleSubtaskToggle(subtask.id, !(subtask.completed ?? false))
          "
          class="data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-calm-500 data-[state=checked]:to-calm-600 data-[state=checked]:border-calm-500"
        />

        <!-- Editing mode -->
        <div
          v-if="editingSubtaskId === subtask.id"
          class="flex-1 flex items-center gap-2"
        >
          <Input
            :ref="(el) => editInputRefs[subtask.id] = el as HTMLInputElement"
            v-model="editingSubtaskTitle"
            class="flex-1 h-9 text-sm border-calm-300 focus:border-calm-500"
            placeholder="Update subtask..."
            @keyup.enter="handleEditSubtask(subtask.id)"
            @keyup.esc="cancelEditingSubtask"
          />
          <button
            @click="handleEditSubtask(subtask.id)"
            class="p-1.5 text-calm-600 hover:text-calm-700 hover:bg-calm-100 rounded-md transition-colors"
            title="Save"
          >
            <Check :size="16" />
          </button>
          <button
            @click="cancelEditingSubtask"
            class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Cancel"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Display mode -->
        <label
          v-else
          :for="`subtask-${subtask.id}`"
          class="flex-1 text-sm cursor-pointer text-calm-800 transition-colors select-none"
          :class="{ 'line-through text-calm-400': subtask.completed }"
        >
          {{ subtask.title }}
        </label>

        <!-- Action buttons - visible on hover (desktop) or always (mobile/touch) -->
        <div
          v-if="editingSubtaskId !== subtask.id"
          class="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <button
            @click="startEditingSubtask(subtask)"
            class="p-2 text-calm-600 hover:text-calm-700 hover:bg-calm-100 rounded-md transition-all"
            title="Edit subtask"
          >
            <Pencil :size="14" />
          </button>
          <button
            @click="handleDeleteSubtask(subtask.id)"
            class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all"
            title="Delete subtask"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>
    <!-- 
    <p v-else-if="!showAddInput" class="text-sm text-calm-500 pl-3 italic">
      No subtasks yet
    </p> -->

    <!-- Add subtask inline input -->
    <div
      v-if="showAddInput"
      class="flex items-center gap-2 p-3 bg-calm-50/50 rounded-lg border border-calm-200/50"
    >
      <Input
        ref="addInputRef"
        v-model="newSubtaskTitle"
        placeholder="What needs to be done?"
        class="flex-1 h-9 text-sm border-calm-300 focus:border-calm-500 bg-white"
        @keyup.enter="handleAddSubtask"
        @keyup.esc="cancelAddingSubtask"
        :disabled="isAddingSubtask || !isOnline"
      />
      <button
        @click="handleAddSubtask"
        :disabled="isAddingSubtask || !newSubtaskTitle.trim() || !isOnline"
        class="p-2 text-calm-600 hover:text-calm-700 hover:bg-calm-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Add subtask"
      >
        <Check :size="16" />
      </button>
      <button
        @click="cancelAddingSubtask"
        class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        title="Cancel"
      >
        <X :size="16" />
      </button>
    </div>

    <!-- Add subtask buttons -->
    <div v-else class="space-y-2">
      <Button
        @click="startAddingSubtask"
        size="lg"
        :disabled="!isOnline"
        variant="outline"
        class="w-full flex items-center justify-center gap-2 border-dashed"
      >
        <Plus :size="18" />
        <span>Add a subtask</span>
      </Button>

      <div class="grid grid-cols-2 gap-2">
        <Button
          @click="handleGenerateSubtasks"
          :disabled="aiLoading || !isOnline"
          variant="outline"
          size="lg"
          class="flex items-center justify-center gap-2"
        >
          <Spinner v-if="aiLoading" class="h-4 w-4" />
          <WandSparkles v-else class="h-4 w-4" />
          <span>{{ aiLoading ? "Thinking..." : "Break down task" }}</span>
        </Button>
        <Button
          @click="handleGenerateFirstStep"
          :disabled="aiLoading || !isOnline"
          variant="outline"
          size="lg"
          class="flex items-center justify-center gap-2"
        >
          <Spinner v-if="aiLoading" class="h-4 w-4" />
          <WandSparkles v-else class="h-4 w-4" />
          <span>{{ aiLoading ? "Thinking..." : "Help me start" }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>
