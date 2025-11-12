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

const updatingTask = ref(false);
const updateError = ref<string | null>(null);
const localCompleted = ref(props.task.completed ?? false);

const subtaskListRef = ref<InstanceType<typeof SubtaskList> | null>(null);


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


// Load subtasks when accordion is expanded
const onAccordionChange = (value: string | string[] | undefined) => {
  console.log("Accordion changed:", value);
  if (value) subtaskListRef.value?.loadSubtasks();
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



          <SubtaskList 
          ref="subtaskListRef"
          :task-id="props.task.id"
          :task-title="props.task.title"
          :task-description="props.task.description"
          @subtasks-changed="(updated) => console.log('Updated subtasks', updated)"
          @subtask-completed="celebrateSubtask()"
          />

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
              <SheetContent class="overflow-auto">
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
