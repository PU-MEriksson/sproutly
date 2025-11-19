<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-vue-next";
import type { Database } from "~/types/database.types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import SubtaskList from "./SubtaskList.vue";
import TaskActionsMenu from "./TaskActionsMenu.vue";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const props = defineProps<{
  task: Task;
  showRemoveFromToday?: boolean;
}>();

const emit = defineEmits<{
  "update:completed": [completed: boolean];
  "task-completed": [taskTitle: string];
  delete: [id: number];
}>();

const taskRef = toRef(props, "task");
const { celebrateTask, celebrateSubtask } = useCelebration();

const {
  updatingTask,
  isOnToday,
  togglingToday,
  toggleCompletion,
  deleteTaskAction,
  toggleToday,
} = useTaskActions(taskRef);

const { subtaskProgress, loadSubtasks, updateSubtasks } = useSubtaskProgress(
  props.task.id
);

// Local state
const localCompleted = ref(props.task.completed ?? false);
const isRollingBack = ref(false);
const editingTask = ref(false);
const accordionValue = ref<string | undefined>(undefined);
const subtaskListRef = ref<InstanceType<typeof SubtaskList> | null>(null);
const lastClickPosition = ref<{ x: number; y: number } | null>(null);

// Sync local state with prop
watch(
  () => props.task.completed,
  (val) => {
    localCompleted.value = val ?? false;
  }
);

// Capture click position on checkbox
const handleCheckboxClick = (event: MouseEvent) => {
  lastClickPosition.value = { x: event.clientX, y: event.clientY };
};

// Handle checkbox changes
watch(localCompleted, async (checked) => {
  if (isRollingBack.value) {
    isRollingBack.value = false;
    return;
  }

  const result = await toggleCompletion(checked);

  if (result.rollback) {
    isRollingBack.value = true;
    localCompleted.value = !checked;
    return;
  }

  if (result.success) {
    emit("update:completed", checked);
    if (checked) {
      emit("task-completed", props.task.title);
      celebrateTask(
        props.task.title,
        lastClickPosition.value?.x,
        lastClickPosition.value?.y
      );
    }
  }
});

// Event handlers
const handleTaskUpdated = (updatedTask: Task) => {
  emit("update:completed", updatedTask.completed ?? false);
};

const handleDeleteTask = async () => {
  const deleted = await deleteTaskAction();
  if (deleted) {
    emit("delete", props.task.id);
  }
};

const handleToggleToday = async () => {
  const toggled = await toggleToday();
  if (toggled && isOnToday.value && props.showRemoveFromToday) {
    emit("delete", props.task.id);
  }
};

const handleSubtasksChanged = (
  updated: Database["public"]["Tables"]["subtasks"]["Row"][]
) => {
  updateSubtasks(updated);
};

const onAccordionChange = (value: string | string[] | undefined) => {
  accordionValue.value = typeof value === "string" ? value : undefined;
  if (value) {
    subtaskListRef.value?.loadSubtasks();
  }
};

onMounted(() => {
  loadSubtasks();
});
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
        <AccordionTrigger
          class="min-h-16 px-6 py-4 hover:no-underline group"
          :aria-label="`Expand task: ${task.title}`"
        >
          <div class="flex items-start gap-4 w-full">
            <Checkbox
              v-model="localCompleted"
              :disabled="updatingTask"
              @click.stop="handleCheckboxClick"
              class="m-1 h-5 w-5 shrink-0 rounded-full"
              :aria-label="`Mark task as ${
                localCompleted ? 'incomplete' : 'complete'
              }: ${task.title}`"
            />
            <div class="flex-1 min-w-0">
              <div
                class="flex items-start justify-between gap-2 flex-1 min-w-0"
              >
                <div
                  class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 justify-center align-middle"
                >
                  <span
                    class="text-base text-calm-800 font-normal group-hover:text-calm-700 text-left break-word leading-snug"
                  >
                    {{ task.title }}
                  </span>

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

                <div class="flex items-center shrink-0">
                  <TaskActionsMenu
                    :is-on-today="isOnToday"
                    :toggling-today="togglingToday"
                    :show-remove-from-today="showRemoveFromToday"
                    @edit="editingTask = true"
                    @delete="handleDeleteTask"
                    @toggle-today="handleToggleToday"
                  />
                </div>
              </div>

              <div v-if="subtaskProgress > 0" class="mt-3" @click.stop>
                <Progress
                  :model-value="Number(subtaskProgress)"
                  class="h-1.5"
                />
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent class="px-6 pb-6 pt-2">
          <p
            v-if="task.description"
            class="text-sm text-calm-600 whitespace-pre-line mb-6 leading-relaxed break-word"
          >
            {{ task.description }}
          </p>

          <SubtaskList
            ref="subtaskListRef"
            :task-id="task.id"
            :task-title="task.title"
            :task-description="task.description"
            @subtasks-changed="handleSubtasksChanged"
            @subtask-completed="celebrateSubtask()"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <Sheet v-model:open="editingTask">
      <SheetContent class="overflow-auto">
        <SheetHeader>
          <SheetTitle>Edit your task</SheetTitle>
          <SheetDescription>
            <EditTask :task="task" @updated="handleTaskUpdated" />
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  </ClientOnly>
</template>
