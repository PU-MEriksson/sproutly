<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Check,
  ArrowRight,
  MoreVertical,
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import SubtaskList from "./SubtaskList.vue";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
/* type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];
 */
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
const { success: showSuccess, error: showError } = useAppToast()


const updatingTask = ref(false);
const localCompleted = ref(props.task.completed ?? false);

const subtaskListRef = ref<InstanceType<typeof SubtaskList> | null>(null);

// Track accordion open/closed state
const route = useRoute();
const accordionValue = ref<string | undefined>(undefined);

// Storage key based on route and task ID
const storageKey = computed(() => `accordion-${route.path}-${props.task.id}`);

// Load accordion state from sessionStorage on mount
onMounted(() => {
  if (import.meta.client) {
    const saved = sessionStorage.getItem(storageKey.value);
    if (saved === "open") {
      accordionValue.value = "item-1";
    }
  }
});

// Save accordion state to sessionStorage when it changes
watch(accordionValue, (newValue) => {
  if (import.meta.client) {
    if (newValue) {
      sessionStorage.setItem(storageKey.value, "open");
    } else {
      sessionStorage.removeItem(storageKey.value);
    }
  }
});

// Clear all accordion states when route changes
const currentPath = ref(route.path);
watch(
  () => route.path,
  (newPath) => {
    if (import.meta.client && newPath !== currentPath.value) {
      // Clear all accordion states for the old route
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(`accordion-${currentPath.value}-`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => sessionStorage.removeItem(key));
      currentPath.value = newPath;
    }
  }
);

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
      showSuccess("Task completed!", `"${props.task.title}" marked as done.`)

    }
  } catch (error) {
    localCompleted.value = !checked; // rollback
    console.error("Failed to toggle task:", error);
    showError("Failed to update task")
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

const handleDeleteTask = async () => {
  if (!confirm("Are you sure you want to delete this task?")) return;

  deletingTask.value = true;
  try {
    await deleteTask(props.task.id);
    showSuccess("Task deleted!");
    emit("delete", props.task.id);
  } catch (error) {
    console.error("Failed to delete task:", error);
    showError("Failed to delete task")
  } finally {
    deletingTask.value = false;
  }
};

const togglingToday = ref(false);

// Check if task is on Today's list
const isOnToday = computed(() => {
  if (!props.task.startdate || props.task.completed) return false;
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
      showSuccess("Task removed from Today");
      // Only emit delete if we're on the Today page
      if (props.showRemoveFromToday) {
        emit("delete", props.task.id);
      }
    } else {
      // Add to Today
      await addToToday(props.task.id);
      console.log("Task added to today");
      showSuccess("Task added to Today");
    }
  } catch (error) {
    console.error("Failed to toggle task today status:", error);
    showError(
      isOnToday.value ? "Failed to remove from today" : "Failed to add to today"
    );
  } finally {
    togglingToday.value = false;
  }
};

// Load subtasks when accordion is expanded
const onAccordionChange = (value: string | string[] | undefined) => {
  console.log("Accordion changed:", value);
  accordionValue.value = typeof value === "string" ? value : undefined;
  if (value) {
    subtaskListRef.value?.loadSubtasks();
  }
};
</script>

<template>
  <ClientOnly>
    <Accordion
      v-model="accordionValue"
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
              class="m-1 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div
                  class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <span
                    class="text-base text-calm-800 font-normal group-hover:text-calm-700 text-left break-words"
                  >
                    {{ props.task.title }}
                  </span>

                  <!-- Today badge - inline on tablet/desktop, own line on mobile -->
                  <Badge
                    v-if="isOnToday && !showRemoveFromToday"
                    variant="secondary"
                    class="text-xs w-fit"
                    title="On Today's list"
                  >
                    <Check :size="12" />
                    <span>Today</span>
                  </Badge>
                </div>

                <!-- More actions menu -->
                <DropdownMenu>
                  <DropdownMenuTrigger as-child @click.stop>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-8 w-8 p-0 hover:bg-calm-100 shrink-0"
                      aria-label="Task actions"
                    >
                      <MoreVertical :size="16" class="text-calm-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-48">
                    <DropdownMenuItem
                      @click.stop="handleToggleToday"
                      :disabled="togglingToday"
                    >
                      <Check v-if="isOnToday" :size="16" class="mr-2" />
                      <ArrowRight v-else :size="16" class="mr-2" />
                      {{
                        showRemoveFromToday
                          ? isOnToday
                            ? "Remove from Today"
                            : "Add to Today"
                          : isOnToday
                          ? "Remove from Today"
                          : "Add to Today"
                      }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click.stop="editingTask = true">
                      <Pencil :size="16" class="mr-2" />
                      Edit task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      @click.stop="handleDeleteTask"
                      class="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 :size="16" class="mr-2" />
                      Delete task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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

          <SubtaskList
            ref="subtaskListRef"
            :task-id="props.task.id"
            :task-title="props.task.title"
            :task-description="props.task.description"
            @subtasks-changed="
              (updated) => console.log('Updated subtasks', updated)
            "
            @subtask-completed="celebrateSubtask()"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <!-- Edit Task Sheet -->
    <Sheet v-model:open="editingTask">
      <SheetContent class="overflow-auto">
        <SheetHeader>
          <SheetTitle>Edit your task</SheetTitle>
          <SheetDescription>
            <EditTask :task="props.task" @updated="handleTaskUpdated" />
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  </ClientOnly>
</template>
