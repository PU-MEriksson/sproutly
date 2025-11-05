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
  title: z.string().min(1, "Subtask title is required"),
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

const isSubmitting = ref(false);
const errorMsg = ref("");
const { updateTask } = useTasks();

const onSubmit = form.handleSubmit(async (values) => {
  isSubmitting.value = true;
  errorMsg.value = "";
  try {
    const updated = await updateTask(props.task.id, {
      title: values.title,
      description: values.description,
      startdate: values.startdate,
      enddate: values.enddate,
      deadline: values.deadline,
    });
    emit("updated", updated);
  } catch (error) {
    errorMsg.value = "Failed to update task.";
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <FormField v-slot="{ componentField }" name="title">
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Task title" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea placeholder="Add details..." v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="startdate">
      <FormItem>
        <FormLabel>Start date</FormLabel>
        <FormControl>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="
                  cn(
                    'w-[280px] justify-start text-left font-normal',
                    !startDateValue && 'text-muted-foreground'
                  )
                "
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
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

    <div v-if="errorMsg" class="text-red-500 text-sm">{{ errorMsg }}</div>

    <Button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? "Saving..." : "Save" }}
    </Button>
  </form>
</template>
