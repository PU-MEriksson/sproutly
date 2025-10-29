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
import type { Database } from "~/types/database.types";

// Import task circle here later when the component is ready

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{
  "update:completed": [completed: boolean];
}>();

const { fetchSubtasks, toggleSubtaskCompleted, deleteSubtask, addSubtasks } =
  useSubtasks();
// const { updateTask } = useTasks();
const subtasks = ref<Subtask[]>([]);
const loadingSubtasks = ref(false);
const subtasksError = ref<string | null>(null);
const newSubtaskTitle = ref("");
const isAddingSubtask = ref(false);
const showAddInput = ref(false);
const addInputRef = ref<HTMLInputElement | null>(null);

// const handleTaskToggle = async (completed: boolean) => {
//   try {
//     await updateTask(props.task.id, { completed });
//     emit("update:completed", completed);
//   } catch (error) {
//     console.error("Failed to toggle task:", error);
//   }
// };

const loadSubtasks = async () => {
  loadingSubtasks.value = true;
  subtasksError.value = null;
  try {
    subtasks.value = await fetchSubtasks(props.task.id);
  } catch (error) {
    console.error("Failed to load subtasks:", error);
    subtasksError.value = "Failed to load subtasks";
  } finally {
    loadingSubtasks.value = false;
  }
};

const handleSubtaskToggle = async (subtaskId: number, completed: boolean) => {
  try {
    await toggleSubtaskCompleted(subtaskId, completed);
    // Update local state
    const subtask = subtasks.value.find((st) => st.id === subtaskId);
    if (subtask) {
      subtask.completed = completed;
    }
  } catch (error) {
    console.error("Failed to toggle subtask:", error);
  }
};

const handleDeleteSubtask = async (subtaskId: number) => {
  try {
    await deleteSubtask(subtaskId);
    // Remove from local state
    subtasks.value = subtasks.value.filter((st) => st.id !== subtaskId);
  } catch (error) {
    console.error("Failed to delete subtask:", error);
  }
};

const handleAddSubtask = async () => {
  if (!newSubtaskTitle.value.trim()) return;

  isAddingSubtask.value = true;
  try {
    const newSubtasks = await addSubtasks(props.task.id, [
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

// Load subtasks when accordion is expanded
const onAccordionChange = (value: string | string[] | undefined) => {
  if (value && subtasks.value.length === 0 && !loadingSubtasks.value) {
    loadSubtasks();
  }
};
</script>

<template>
  <Accordion
    type="single"
    collapsible
    class="bg-white rounded-xl"
    @update:model-value="onAccordionChange"
  >
    <AccordionItem value="item-1">
      <AccordionTrigger class="h-14 p-4">
        <ClientOnly>
          <Checkbox />
        </ClientOnly>
        {{ props.task.title }}
      </AccordionTrigger>
      <AccordionContent class="px-4 pb-4">
        <p class="text-sm text-gray-600 whitespace-pre-line mb-4">
          {{ props.task.description || "No description" }}
        </p>

        <!-- Subtasks section -->
        <ClientOnly>
          <div class="space-y-2">
            <h4 class="text-sm font-semibold text-gray-700">Subtasks</h4>

            <p v-if="loadingSubtasks" class="text-sm text-gray-500">
              Loading subtasks...
            </p>
            <p v-else-if="subtasksError" class="text-sm text-red-500">
              {{ subtasksError }}
            </p>

            <div v-else-if="subtasks.length > 0" class="space-y-2">
              <div
                v-for="subtask in subtasks"
                :key="subtask.id"
                class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
              >
                <Checkbox
                  :id="`subtask-${subtask.id}`"
                  :checked="subtask.completed"
                  @update:checked="(checked: boolean) => handleSubtaskToggle(subtask.id, checked)"
                />
                <label
                  :for="`subtask-${subtask.id}`"
                  class="flex-1 text-sm cursor-pointer"
                  :class="{ 'line-through text-gray-500': subtask.completed }"
                >
                  {{ subtask.title }}
                </label>
                <button
                  @click="handleDeleteSubtask(subtask.id)"
                  class="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                  title="Delete subtask"
                >
                  Delete
                </button>
              </div>
            </div>

            <p v-else-if="!showAddInput" class="text-sm text-gray-500">
              No subtasks
            </p>

            <!-- Add subtask inline input -->
            <div v-if="showAddInput" class="flex items-center gap-2 p-2">
              <Checkbox disabled class="opacity-50" />
              <Input
                ref="addInputRef"
                v-model="newSubtaskTitle"
                placeholder="Subtask title..."
                class="flex-1 h-8 text-sm"
                @keyup.enter="handleAddSubtask"
                @keyup.esc="cancelAddingSubtask"
                @blur="cancelAddingSubtask"
                :disabled="isAddingSubtask"
              />
            </div>

            <!-- Add subtask button -->
            <button
              v-else
              @click="startAddingSubtask"
              class="flex items-center gap-2 p-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded w-full"
            >
              <span class="text-lg">+</span>
              <span>Add subtask</span>
            </button>
          </div>
        </ClientOnly>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
