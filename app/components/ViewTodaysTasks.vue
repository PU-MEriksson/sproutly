<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Database } from "~/types/database.types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const pros = defineProps<{
  todaysUncompleted: Task[];
  loadingTodaysUncompleted: boolean;
  errorTodaysUncompleted: string | null;
  refreshTodaysUncompleted: () => void;
  todaysCompleted: Task[];
  loadingTodaysCompleted: boolean;
  errorTodaysCompleted: string | null;
  refreshTodaysCompleted: () => void;
  todaysTotal: number;
}>();

const emit = defineEmits<{
  "task-completed": [taskTitle: string];
}>();

const { success: showSuccess, error: showError } = useAppToast()

const handleTaskCompleted = (taskTitle: string) => {
  emit("task-completed", taskTitle);
};

const { updateTask } = useTasks();

const handleUncompleteTask = async (task: Task) => {
  try {
    await updateTask(task.id, {
      completed: false,
      completed_date: null,
    });
    pros.refreshTodaysUncompleted();
    pros.refreshTodaysCompleted();
    showSuccess("Task moved back to To-do", `"${task.title}" is now uncompleted.`)
  } catch (error) {
    console.error("Failed to uncomplete task:", error);
    showError("Couldn't update task", "Please try again later.")
  }
};

const isCollapsibleOpen = ref(false);
</script>

<template>
  <ClientOnly fallback-tag="section" fallback="">
    <section class="px-6 py-4">
      <p v-if="loadingTodaysUncompleted" class="text-calm-600">Loading…</p>
      <p v-else-if="errorTodaysUncompleted" class="text-red-600">
        {{ errorTodaysUncompleted }}
      </p>

      <div v-else class="space-y-6">
        <div v-if="todaysUncompleted?.length" class="space-y-3">
          <h2 class="text-lg font-semibold text-calm-700 px-2">To do</h2>
          <div class="space-y-3">
            <TaskAccordion
              v-for="t in todaysUncompleted"
              :key="t.id"
              :task="t"
              :showRemoveFromToday="true"
              @task-completed="handleTaskCompleted"
            />
          </div>
        </div>

        <!-- Completed tasks collapsible -->
        <Collapsible
          v-if="todaysCompleted?.length"
          v-model:open="isCollapsibleOpen"
        >
          <CollapsibleTrigger
            class="w-full flex items-center gap-2 text-sm text-calm-600 hover:text-calm-800 transition-colors px-2 py-2 rounded-lg hover:bg-calm-50"
          >
            <ChevronDown
              :size="16"
              class="transition-transform duration-200"
              :class="{ 'rotate-180': isCollapsibleOpen }"
            />
            <span>
              {{ todaysCompleted.length }}
              {{ todaysCompleted.length === 1 ? "task" : "tasks" }} completed
              today!</span
            >
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="mt-3 space-y-2">
              <div
                v-for="task in todaysCompleted"
                :key="task.id"
                class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-calm-50/50 transition-colors"
              >
                <Checkbox
                  :model-value="true"
                  @update:model-value="handleUncompleteTask(task)"
                  class="shrink-0 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-calm-500 data-[state=checked]:to-calm-600 data-[state=checked]:border-calm-500"
                />
                <span class="text-sm text-calm-600">{{ task.title }}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <p v-if="todaysTotal === 0" class="text-calm-500 text-center py-12">
          <NoTasks />
        </p>
      </div>
    </section>
  </ClientOnly>
</template>
