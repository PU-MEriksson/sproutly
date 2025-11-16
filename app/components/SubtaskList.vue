<script setup lang="ts">
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Check, X } from "lucide-vue-next";
import { toast } from "vue-sonner";

import AITaskHelper from "./AITaskHelper.vue";
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

const subtasks = ref<Subtask[]>([]);
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
    // Sort: first steps at the top, then by creation order
    subtasks.value = fetchedSubtasks.sort((a, b) => {
      // If one is a first step and the other isn't, first step comes first
      if (a.is_first_step && !b.is_first_step) return -1;
      if (!a.is_first_step && b.is_first_step) return 1;
      // Otherwise maintain creation order
      return 0;
    });
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

// Handle events from AITaskHelper component
const handleSubtasksAdded = (newSubtasks: Subtask[]) => {
  subtasks.value.unshift(...newSubtasks);
  // Re-sort to ensure first steps stay at the top
  subtasks.value = subtasks.value.sort((a, b) => {
    if (a.is_first_step && !b.is_first_step) return -1;
    if (!a.is_first_step && b.is_first_step) return 1;
    return 0;
  });
  emit("subtasks-changed", subtasks.value);
};

// Load subtasks on component mount
onMounted(() => {
  loadSubtasks();
});

defineExpose({ loadSubtasks });
</script>

<template>
  <!-- Subtasks section -->
  <div class="space-y-3">
    <!-- AI Task Helper Component -->
    <AITaskHelper
      :task-id="taskId"
      :task-title="taskTitle"
      :task-description="taskDescription"
      :existing-subtasks="subtasks"
      @subtasks-added="handleSubtasksAdded"
    />

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

    <!-- Add subtask button -->
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
    </div>
  </div>
</template>
