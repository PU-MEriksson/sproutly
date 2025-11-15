<script setup lang="ts">

import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useFieldValue, useForm } from "vee-validate";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getLocalTimeZone } from "@internationalized/date";
import { ref, computed } from "vue";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import type { Database } from "~/types/database.types";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-vue-next";
import { Calendar } from "@/components/ui/calendar";
import { df } from "../utils/dates";
import { useDateField } from "@/composables/useDateField";
import { subtaskSchema, taskSchema } from "~/schemas/task";


import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const props = defineProps<{
  task: Database["public"]["Tables"]["tasks"]["Row"];
}>();

const emit = defineEmits<{
  updated: [task: Database["public"]["Tables"]["tasks"]["Row"]];
}>();

const { success: showSuccess, error: showError } = useAppToast()
const { fetchSubtasks, syncSubtasks } = useSubtasks();

const originalSubtasks = ref<{ id?: number; title: string }[]>([]);

const form = useForm({
  validationSchema: taskSchema,
  initialValues: {
    title: props.task.title ?? "",
    description: props.task.description ?? "",
    startdate: props.task.startdate ?? undefined,
    enddate: props.task.enddate ?? undefined,
    deadline: props.task.deadline ?? undefined,
    subtasks: [],
  },
});

const startDateValue = useDateField(
  form,
  "startdate",
  computed(() => props.task.startdate ?? undefined)
);

onMounted(async () => {
  const rows = await fetchSubtasks(props.task.id);
  const mapped = rows.map((r) => ({
    id: r.id,
    title: r.title,
    completed: r.completed ?? false,
  }));
  form.setFieldValue("subtasks", mapped);
  originalSubtasks.value = mapped.map(s => ({ ...s }));
});

const isSubmitting = ref(false);
const errorMsg = ref("");
const { updateTask } = useTasks();
const { isOnline } = useOnlineStatus();

const onSubmit = form.handleSubmit(async (values) => {
  // Prevent submission when offline
  if (!isOnline.value) {
    toast.error("You're offline. Please reconnect to save changes.");
    return;
  }

  isSubmitting.value = true;
  try {
    const updated = await updateTask(props.task.id, {
      title: values.title,
      description: values.description,
      startdate: values.startdate,
      enddate: values.enddate,
      deadline: values.deadline,
    });

    await syncSubtasks(updated.id, originalSubtasks.value, values.subtasks);
    originalSubtasks.value = JSON.parse(JSON.stringify(values.subtasks));
    showSuccess("Task updated!")
    emit("updated", updated);
  } catch (err) {
    showError("Failed to update task. Please try again!")
  } finally {
    isSubmitting.value = false;
  }
});

const titleValue = useFieldValue<string>("title");

const descValue = useFieldValue<string>("description");

</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-8">
    <!-- Header -->
    <div class="space-y-2">
      <h2 class="text-2xl font-semibold text-calm-800">Edit Task</h2>
      <p class="text-sm text-calm-600">Update your task details</p>
    </div>

    <!-- Main Task Details -->
    <div
      class="space-y-6 p-6 bg-calm-50/30 rounded-xl border border-calm-200/50"
    >
      <FormField v-slot="{ componentField }" name="title">
        <FormItem class="flex-1">
          <FormLabel class="text-calm-800 font-medium">Title</FormLabel>
          <FormControl>
            <Input
              type="text"
              maxlength="100"
              placeholder="Task title"
              v-bind="componentField"
              class="bg-white w-full"
              :disabled="!isOnline"
            />
          </FormControl>
          <CharCounter :current="(titleValue || '').length" :max="100"/>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="description">
        <FormItem>
          <FormLabel class="text-calm-800 font-medium">Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Add details..."
              maxlength="500"
              v-bind="componentField"
              class="bg-white min-h-24 resize-none"
              :disabled="!isOnline"
            />
          </FormControl>
          <CharCounter :current="(descValue || '').length" :max="500"
          v-if="descValue"
          />
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- Timeline Section -->
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-calm-800 mb-1">Timeline</h3>
        <p class="text-sm text-calm-600">When would you like to start?</p>
      </div>

      <FormField v-slot="{ componentField }" name="startdate">
        <FormItem>
          <FormLabel class="text-calm-700">Start date</FormLabel>
          <FormControl>
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  :class="
                    cn(
                      'w-full sm:w-[280px] justify-start text-left font-normal bg-white',
                      !startDateValue && 'text-calm-400'
                    )
                  "
                  :disabled="!isOnline"
                >
                  <CalendarIcon class="mr-2 h-4 w-4 text-calm-500" />
                  {{
                    startDateValue
                      ? df.format(startDateValue.toDate(getLocalTimeZone()))
                      : "Pick a date"
                  }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="startDateValue" initial-focus />
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- Subtasks Section -->
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-calm-800 mb-1">Subtasks</h3>
        <p class="text-sm text-calm-600">Break it down into smaller steps</p>
      </div>
      <EditSubtask />
    </div>

    <!-- Error Message -->
    <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-600 text-sm">{{ errorMsg }}</p>
    </div>

    <!-- Submit Button -->
    <div class="pt-4 border-t border-calm-200">
      <Button
        type="submit"
        :disabled="isSubmitting || !isOnline"
        class="min-w-32"
      >
        {{ isSubmitting ? "Saving..." : "Save Changes" }}
      </Button>
    </div>
  </form>
</template>
