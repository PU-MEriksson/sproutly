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
import { WandSparkles } from "lucide-vue-next";
import type { Database } from "~/types/database.types";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];

const props = defineProps<{ task: Task }>();
const emit = defineEmits<{
  "update:completed": [completed: boolean];
  "task-completed": [taskTitle: string];
  delete: [id: number];
}>();

const { updateTask, deleteTask } = useTasks();
const { celebrateTask, celebrateSubtask } = useCelebration();

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
  loading: aiLoading,
  error: aiError,
  subtasks: aiSubtasks,
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

const updatingTask = ref(false);
const updateError = ref<string | null>(null);
const localCompleted = ref(props.task.completed ?? false);

let currentDate = new Date().toJSON().slice(0, 10);

// Sync local state with prop
watch(
  () => props.task.completed,
  (val) => {
    localCompleted.value = val ?? false;
  }
);

// Watch for checkbox changes and update DB
watch(localCompleted, async (checked) => {
  updatingTask.value = true;
  updateError.value = null;
  try {
    await updateTask(props.task.id, {
      completed: checked,
      completed_date: currentDate,
    });
    emit("update:completed", checked);

    // Emit task-completed event when a task is marked as completed
    if (checked) {
      emit("task-completed", props.task.title);
      celebrateTask();
    }
  } catch (error) {
    localCompleted.value = !checked; // rollback
    updateError.value = "Failed to update task";
    console.error("Failed to toggle task:", error);
  } finally {
    updatingTask.value = false;
  }
});

const editingTask = ref(false);
/* const editingError = ref<string | null>(null);
 */
const handleTaskUpdated = (updatedTask: Task) => {
  emit("update:completed", updatedTask.completed ?? false);
};

const deletingTask = ref(false);
const deleteError = ref<string | null>(null);

const handleDeleteTask = async () => {
  if (!confirm("Are you sure you want to delete this task?")) return;

  deletingTask.value = true;
  deleteError.value = null;
  try {
    await deleteTask(props.task.id);
    emit("delete", props.task.id);
  } catch (error) {
    console.error("Failed to delete task:", error);
    deleteError.value = "Failed to delete task";
  } finally {
    deletingTask.value = false;
  }
};

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

const handleSubtaskToggle = async (
  subtaskId: number,
  completed: boolean | string
) => {
  // Convert to boolean in case the checkbox returns a string
  const isCompleted = completed === true || completed === "true";

  try {
    await toggleSubtaskCompleted(subtaskId, isCompleted);
    // Update local state
    const subtask = subtasks.value.find((st) => st.id === subtaskId);
    if (subtask) {
      subtask.completed = isCompleted;
    }

    // Celebrate if marking as complete
    if (isCompleted) {
      celebrateSubtask();
    }
  } catch (error) {
    console.error("Failed to toggle subtask:", error);
    // Revert local state on error
    const subtask = subtasks.value.find((st) => st.id === subtaskId);
    if (subtask) {
      subtask.completed = !isCompleted;
    }
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

// Load subtasks when accordion is expanded
const onAccordionChange = (value: string | string[] | undefined) => {
  if (value && subtasks.value.length === 0 && !loadingSubtasks.value) {
    loadSubtasks();
  }
};

// Generate subtasks with AI
const handleGenerateSubtasks = async () => {
  aiGenerationError.value = null; // Clear previous errors

  try {
    // Prepare existing subtasks to send to AI
    const existingSubtasksForAI = subtasks.value.map((st) => ({
      title: st.title,
      completed: st.completed ?? false,
    }));

    // Call AI to generate subtasks, passing existing ones
    await generateSubtasks(
      props.task.title,
      props.task.description || undefined,
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
      const newSubtasks = await addSubtasks(props.task.id, aiSubtasks.value);

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
</script>

<template>
  <ClientOnly>
    <Accordion
      type="single"
      collapsible
      class="bg-white/70 backdrop-blur-sm rounded-2xl border-l-4 border-l-calm-400 border border-calm-200/40 shadow-sm hover:shadow-md hover:border-l-calm-500 hover:border-calm-300/50 transition-all duration-200"
      @update:model-value="onAccordionChange"
    >
      <AccordionItem value="item-1" class="border-0">
        <AccordionTrigger class="h-16 px-6 py-4 hover:no-underline group">
          <div class="flex items-center gap-4 w-full">
            <Checkbox
              v-model="localCompleted"
              :disabled="updatingTask"
              @click.stop
              class="data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-calm-500 data-[state=checked]:to-calm-600 data-[state=checked]:border-calm-500"
            />
            <span
              class="text-base text-calm-800 font-normal group-hover:text-calm-700"
            >
              {{ props.task.title }}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent class="px-6 pb-6 pt-2">
          <p
            v-if="props.task.description"
            class="text-sm text-calm-600 whitespace-pre-line mb-6 leading-relaxed"
          >
            {{ props.task.description }}
          </p>
          <div class="mb-6">
            <Button
              size="sm"
              @click="handleGenerateSubtasks"
              :disabled="aiLoading"
              class="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg h-9 px-4 shadow-sm hover:shadow-md transition-all"
            >
              <Spinner v-if="aiLoading" />
              <WandSparkles v-else class="h-4 w-4" />
              {{ aiLoading ? "Generating..." : "Break down task" }}
            </Button>

            <!-- Error message -->
            <div
              v-if="aiGenerationError || aiError"
              class="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl"
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
          </div>

          <!-- Subtasks section -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-calm-700">Subtasks</h4>

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
                class="flex items-center gap-3 p-3 hover:bg-calm-50/50 rounded-lg transition-colors duration-150"
              >
                <Checkbox
                  :id="`subtask-${subtask.id}`"
                  :checked="subtask.completed ?? false"
                  @click="
                    () =>
                      handleSubtaskToggle(
                        subtask.id,
                        !(subtask.completed ?? false)
                      )
                  "
                  class="data-[state=checked]:bg-calm-500 data-[state=checked]:border-calm-500"
                />

                <!-- Editing mode -->
                <Input
                  v-if="editingSubtaskId === subtask.id"
                  :ref="(el) => editInputRefs[subtask.id] = el as HTMLInputElement"
                  v-model="editingSubtaskTitle"
                  class="flex-1 h-9 text-sm border-calm-200"
                  @keyup.enter="handleEditSubtask(subtask.id)"
                  @keyup.esc="cancelEditingSubtask"
                  @blur="handleEditSubtask(subtask.id)"
                />

                <!-- Display mode -->
                <label
                  v-else
                  :for="`subtask-${subtask.id}`"
                  class="flex-1 text-sm cursor-pointer text-calm-700 transition-colors"
                  :class="{ 'line-through text-calm-400': subtask.completed }"
                >
                  {{ subtask.title }}
                </label>

                <!-- Action buttons -->
                <div v-if="editingSubtaskId !== subtask.id" class="flex gap-1">
                  <button
                    @click="startEditingSubtask(subtask)"
                    class="text-xs text-calm-600 hover:text-calm-700 px-3 py-1.5 rounded-lg hover:bg-calm-50 transition-colors"
                    title="Edit subtask"
                  >
                    Edit
                  </button>
                  <button
                    @click="handleDeleteSubtask(subtask.id)"
                    class="text-xs text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete subtask"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <p v-else-if="!showAddInput" class="text-sm text-calm-500 pl-3">
              No subtasks yet
            </p>

            <!-- Add subtask inline input -->
            <div v-if="showAddInput" class="flex items-center gap-3 p-3">
              <Input
                ref="addInputRef"
                v-model="newSubtaskTitle"
                placeholder="Subtask title..."
                class="flex-1 h-9 text-sm border-calm-200"
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
              class="flex items-center gap-2.5 p-3 text-sm text-calm-600 hover:text-calm-700 hover:bg-calm-50 rounded-lg w-full transition-colors duration-150"
            >
              <span class="text-xl font-light">+</span>
              <span>Add subtask</span>
            </button>
          </div>

          <div class="flex gap-2 mt-6 pt-4 border-t border-calm-100">
            <Sheet>
              <SheetTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-calm-600 hover:text-calm-700 hover:bg-calm-50 rounded-lg"
                  :disabled="editingTask"
                >
                  Edit task
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit your task</SheetTitle>
                  <SheetDescription>
                    <EditTask :task="props.task" @updated="handleTaskUpdated" />
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="sm"
              class="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
              :disabled="deletingTask"
              @click.stop="handleDeleteTask"
            >
              Delete task
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ClientOnly>
</template>
