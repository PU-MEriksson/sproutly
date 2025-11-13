<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { Database } from "~/types/database.types";
import { cn } from "~/lib/utils";
import { CalendarIcon } from "lucide-vue-next";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getLocalTimeZone, DateFormatter } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import { CalendarDate } from "@internationalized/date";
import { ref, watch } from "vue";
import { toast } from "vue-sonner";

// Helper to convert date string (YYYY-MM-DD) to CalendarDate (DateValue)
function toCalendarDate(dateString?: string | null): DateValue | undefined {
  if (!dateString) return undefined;
  // Expecting YYYY-MM-DD
  const parts = dateString.split("-");
  if (parts.length !== 3) return undefined;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return undefined;
  return new CalendarDate(year, month, day);
}

const df = new DateFormatter("en-US", {
  dateStyle: "long",
});

const props = defineProps<{
  task: Database["public"]["Tables"]["tasks"]["Row"];
}>();
const emit = defineEmits<{
  updated: [task: Database["public"]["Tables"]["tasks"]["Row"]];
}>();

// Calendar value for start date
const startDateValue = ref<DateValue | undefined>(
  toCalendarDate(props.task.startdate ?? undefined)
) as Ref<DateValue | undefined>;

watch(startDateValue, (val) => {
  if (val) {
    const ymd = `${val.year.toString().padStart(4, "0")}-${val.month
      .toString()
      .padStart(2, "0")}-${val.day.toString().padStart(2, "0")}`;
    form.setFieldValue("startdate", ymd);
  } else {
    form.setFieldValue("startdate", undefined);
  }
});

watch(
  () => props.task.startdate,
  (val) => {
    startDateValue.value = toCalendarDate(val ?? undefined);
  }
);

const subtaskSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Subtask title is required"),
  completed: z.boolean().default(false),
});

const taskSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    startdate: z.string().date().optional(),
    enddate: z.string().date().optional(),
    deadline: z.string().date().optional(),
    subtasks: z.array(subtaskSchema).default([]),
  })
);

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

const { fetchSubtasks, syncSubtasks } = useSubtasks();

const originalSubtasks = ref<{ id?: number; title: string }[]>([]);

onMounted(async () => {
  const rows = await fetchSubtasks(props.task.id);
  const mapped = rows.map((r) => ({
    id: r.id,
    title: r.title,
    completed: r.completed ?? false,
  }));
  form.setFieldValue("subtasks", mapped);
  originalSubtasks.value = JSON.parse(JSON.stringify(mapped));
});

const isSubmitting = ref(false);
const errorMsg = ref("");
const { updateTask } = useTasks();
const { addSubtasks } = useSubtasks();
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

    emit("updated", updated);
  } catch (err) {
    console.error("Failed to update", err);
  } finally {
    isSubmitting.value = false;
  }
});

const handleSubtaskCompleted = (title: string) => {
  console.log(`Subtask completed: ${title}`);
  // Optional: Celebrate or update progress here
};
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
              placeholder="Task title"
              v-bind="componentField"
              class="bg-white w-full"
              :disabled="!isOnline"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="description">
        <FormItem>
          <FormLabel class="text-calm-800 font-medium">Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Add details..."
              v-bind="componentField"
              class="bg-white min-h-24 resize-none"
              :disabled="!isOnline"
            />
          </FormControl>
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
