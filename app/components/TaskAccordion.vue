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
import type { Database } from "~/types/database.types";
import { toast } from "vue-sonner";

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

const props = defineProps<{
  task: Task;
  showRemoveFromToday?: boolean;
}>();
const emit = defineEmits<{
  "update:completed": [completed: boolean];
  "task-completed": [taskTitle: string];
  delete: [id: number];
}>();

const { updateTask, deleteTask, removeFromToday, addToToday } = useTasks();
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
    toast.success("Task removed!");
    emit("delete", props.task.id);
  } catch (error) {
    console.error("Failed to delete task:", error);
    deleteError.value = "Failed to delete task";
  } finally {
    deletingTask.value = false;
  }
};

const togglingToday = ref(false);

// Check if task is on Today's list
const isOnToday = computed(() => {
  if (!props.task.startdate) return false;
  const taskStartDate = new Date(props.task.startdate).toJSON().slice(0, 10);
  return taskStartDate <= currentDate;
});

const handleToggleToday = async () => {
  togglingToday.value = true;
  try {
    if (isOnToday.value) {
      // Remove from Today
      await removeFromToday(props.task.id);
      console.log("Task removed from today");
      toast.success("Task removed from Today");
      // Only emit delete if we're on the Today page
      if (props.showRemoveFromToday) {
        emit("delete", props.task.id);
      }
    } else {
      // Add to Today
      await addToToday(props.task.id);
      console.log("Task added to today");
      toast.success("Task added to Today");
    }
  } catch (error) {
    console.error("Failed to toggle task today status:", error);
    toast.error(
      isOnToday.value ? "Failed to remove from today" : "Failed to add to today"
    );
  } finally {
    togglingToday.value = false;
  }
};

const loadSubtasks = async () => {
  loadingSubtasks.value = true;
  subtasksError.value = null;
  try {
    const fetchedSubtasks = await fetchSubtasks(props.task.id);
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
      class="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md hover:border-gray-300/70 transition-all duration-200"
      @update:model-value="onAccordionChange"
    >
      <AccordionItem value="item-1" class="border-0">
        <AccordionTrigger class="min-h-16 px-6 py-4 hover:no-underline group">
          <div class="flex items-start gap-4 w-full">
            <Checkbox
              v-model="localCompleted"
              :disabled="updatingTask"
              @click.stop
              class="mt-0.5 shrink-0 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-calm-500 data-[state=checked]:to-calm-600 data-[state=checked]:border-calm-500"
            />
            <div class="flex-1 min-w-0 flex items-center justify-between gap-2">
              <span
                class="text-base text-calm-800 font-normal group-hover:text-calm-700 text-left break-words"
              >
                {{ props.task.title }}
              </span>
              <!-- Only show badge on All Tasks page, not on Today page where it's redundant -->
              <Badge
                v-if="isOnToday && !showRemoveFromToday"
                variant="secondary"
                class="bg-calm-100 text-calm-700 border-calm-300 hover:bg-calm-100"
                title="On Today's list"
              >
                <Check :size="12" />
                <span>Today</span>
              </Badge>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent class="px-6 pb-6 pt-2">
          <p
            v-if="props.task.description"
            class="text-sm text-calm-600 whitespace-pre-line mb-6 leading-relaxed"
          >
            {{ props.task.description }}
          </p>

          <!-- AI and Helper Tools -->
          <div class="mb-6 flex flex-wrap gap-2">
            <Button
              size="sm"
              @click="handleGenerateSubtasks"
              :disabled="aiLoading"
              class="gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg h-9 px-4 shadow-sm hover:shadow-md transition-all"
            >
              <Spinner v-if="aiLoading" class="h-4 w-4" />
              <WandSparkles v-else class="h-4 w-4" />
              <span>{{ aiLoading ? "Thinking..." : "Break down" }}</span>
            </Button>

            <!-- Placeholder for future buttons -->
            <!-- <Button size="sm" class="gap-2">Focus Mode</Button> -->
            <!-- <Button size="sm" class="gap-2">Get Started</Button> -->
          </div>

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
                class="group flex items-center gap-3 p-3 bg-white/40 hover:bg-calm-50 rounded-lg transition-all duration-150 border border-transparent hover:border-calm-200/40"
              >
                <Checkbox
                  :id="`subtask-${subtask.id}`"
                  :checked="subtask.completed ?? false"
                  @click.stop="
                    () =>
                      handleSubtaskToggle(
                        subtask.id,
                        !(subtask.completed ?? false)
                      )
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

            <p
              v-else-if="!showAddInput"
              class="text-sm text-calm-500 pl-3 italic"
            >
              No subtasks yet
            </p>

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
                :disabled="isAddingSubtask"
              />
              <button
                @click="handleAddSubtask"
                :disabled="isAddingSubtask || !newSubtaskTitle.trim()"
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
            <button
              v-else
              @click="startAddingSubtask"
              class="flex items-center justify-center gap-2 p-3 text-sm font-medium text-calm-600 hover:text-calm-700 bg-calm-50/30 hover:bg-calm-100/50 rounded-lg w-full transition-all duration-150 border border-dashed border-calm-300 hover:border-calm-400"
            >
              <Plus :size="18" />
              <span>Add a subtask</span>
            </button>
          </div>

          <!-- Task actions footer -->
          <div class="flex gap-3 mt-8 pt-6 border-t border-calm-200/60">
            <Sheet>
              <SheetTrigger as-child>
                <Button
                  variant="outline"
                  size="sm"
                  class="flex-1 gap-2 text-calm-700 border-calm-300 hover:bg-calm-50 hover:border-calm-400 rounded-lg h-10 font-medium"
                  :disabled="editingTask"
                >
                  <Pencil :size="16" />
                  <span>Edit</span>
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
              variant="outline"
              size="sm"
              class="flex-1 gap-2 text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400 rounded-lg h-10 font-medium"
              :disabled="deletingTask"
              @click.stop="handleDeleteTask"
            >
              <Trash2 :size="16" />
              <span>Delete</span>
            </Button>

            <!-- Toggle Today button - shows current state on both pages -->
            <Button
              variant="outline"
              size="sm"
              :class="[
                'flex-1 gap-2 rounded-lg h-10 font-medium transition-all',
                isOnToday
                  ? 'text-calm-700 bg-calm-100 border-calm-400 hover:bg-calm-50 hover:border-calm-300'
                  : 'text-calm-700 border-calm-300 hover:bg-calm-50 hover:border-calm-400',
              ]"
              :disabled="togglingToday"
              @click.stop="handleToggleToday"
              :title="isOnToday ? 'Remove from Today' : 'Do Today'"
            >
              <Check v-if="isOnToday" :size="16" class="text-calm-600" />
              <ArrowRight v-else :size="16" />
              <span>{{ isOnToday ? "Do Today" : "Do Today" }}</span>
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </ClientOnly>
</template>
