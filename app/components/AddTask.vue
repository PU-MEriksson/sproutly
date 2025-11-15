<script setup lang="ts">

import { useForm } from "vee-validate";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-vue-next";
import { ref, watch, onMounted } from "vue";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "vue-sonner";
import { df } from "../utils/dates";
import { getLocalTimeZone } from "@internationalized/date";
import { taskSchema } from "~/schemas/task";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const props = defineProps<{
  title?: string;
  defaultDate?: string;
}>();

const emit = defineEmits<{
  'update:title': [string];
  taskAdded: [];
}>();

const { addTask } = useTasks();

const { success: showSuccess, error: showError } = useAppToast();

const isSubmitting = ref(false);

const { isOnline } = useOnlineStatus();

const form = useForm({
  validationSchema: taskSchema,
  initialValues: {
    title: props.title ?? "",
    description: "",
    startdate: props.defaultDate ?? undefined,
    enddate: undefined,
    deadline: undefined,
    subtasks: [],
  },
});

const startDateValue = useDateField(
  form, 
  "startdate", 
  computed(() => props.defaultDate));

const onSubmit = form.handleSubmit(async (values) => {
  // Prevent submission when offline
  if (!isOnline.value) {
    toast.error("You're offline. Please reconnect to add a task.");
    return;
  }

  isSubmitting.value = true;

  try {
    await addTask(
      values.title,
      values.description,
      values.startdate,
      values.enddate,
      values.deadline,
      values.subtasks
    );

    showSuccess("Task added!");

    // Reset the form
    form.resetForm();

    // Reset date values
    startDateValue.value = undefined;

    emit("update:title", "");

    // Emit event to parent to refresh tasks
    emit("taskAdded");
  } catch (error) {
    console.error("Failed to add task:", error);
    showError("Failed to add task. Please try again.")
  } finally {
    isSubmitting.value = false;
  }
});

const titleModel = computed({
  get: () => form.values.title,
  set: (val) => {
    form.setFieldValue("title", val);
    emit("update:title", val ?? "")
  },
});

watch(
  () => props.title,
  (val) => {
    if (val !== form.values.title) {
      form.setFieldValue("title", val ?? "");
    }
  },
  { immediate: true }     // This ensures initial sync correctly
);

</script>

<template>
  <form @submit.prevent="onSubmit" class="max-w-2xl mx-auto space-y-8 p-6">
    <!-- Header -->
    <div class="space-y-2">
      <h2 class="text-2xl font-semibold text-calm-800">Add a New Task</h2>
      <p class="text-sm text-calm-600">
        Break it down into small, manageable steps
      </p>
    </div>

    <!-- Main Task Details -->
    <div
      class="space-y-6 p-6 bg-calm-50/30 rounded-xl border border-calm-200/50"
    >
      <FormField v-slot="{ componentField }" name="title">
        <FormItem class="flex-1">
          <FormLabel class="text-calm-800 font-medium"
            >What would you like to do?</FormLabel
          >
          <FormControl>
            <Input
              type="text"
              placeholder="I want to..."
              v-model="titleModel"
              class="bg-white w-full"
              :disabled="!isOnline"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="description">
        <FormItem>
          <FormLabel class="text-calm-800 font-medium"
            >More details (optional)</FormLabel
          >
          <FormControl>
            <Textarea
              placeholder="Add more details here..."
              class="resize-none bg-white min-h-24"
              v-bind="componentField"
              :disabled="!isOnline"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- Subtasks Section -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-calm-800 mb-1">Break it down</h3>
      <p class="text-sm text-calm-600">
        Add small steps to make this task easier
      </p>
    </div>

    <AddSubtask />

    <!-- Timeline Section -->
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium text-calm-800 mb-1">Timeline</h3>
        <p class="text-sm text-calm-600">When do you want to start?</p>
      </div>

      <FormField v-slot="{ componentField }" name="startdate">
        <FormItem>
          <FormLabel class="text-calm-700">Start date (optional)</FormLabel>
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

    <!-- Submit Button -->
    <div class="pt-4 border-t border-calm-200">
      <Button
        type="submit"
        :disabled="isSubmitting || !isOnline"
        class="min-w-32"
      >
        {{ isSubmitting ? "Adding..." : "Add Task" }}
      </Button>
    </div>
  </form>
</template>
