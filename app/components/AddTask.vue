<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm, useFieldArray } from "vee-validate";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateValue } from "@internationalized/date";
import {
  DateFormatter,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";
import { ref, watch, onMounted } from "vue";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const props = defineProps<{
  defaultDate?: string;
}>();

const df = new DateFormatter("sv-SE", {
  dateStyle: "long",
});

const startDateValue = ref<DateValue | undefined>();
const endDateValue = ref<DateValue | undefined>();
const deadlineValue = ref<DateValue | undefined>();
const isSubmitting = ref(false);

const emit = defineEmits<{
  taskAdded: [];
}>();

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
    subtasks: [],
  },
});

const { addTask } = useTasks();

watch(endDateValue, (val) => {
  if (val) {
    const ymd = `${val.year.toString().padStart(4, "0")}-${val.month
      .toString()
      .padStart(2, "0")}-${val.day.toString().padStart(2, "0")}`;
    form.setFieldValue("enddate", ymd);
  } else {
    form.setFieldValue("enddate", undefined);
  }
});

watch(deadlineValue, (val) => {
  if (val) {
    const ymd = `${val.year.toString().padStart(4, "0")}-${val.month
      .toString()
      .padStart(2, "0")}-${val.day.toString().padStart(2, "0")}`;
    form.setFieldValue("deadline", ymd);
  } else {
    form.setFieldValue("deadline", undefined);
  }
});

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

// Set default date if provided
onMounted(() => {
  if (props.defaultDate) {
    try {
      startDateValue.value = parseDate(props.defaultDate);
      form.setFieldValue("startdate", props.defaultDate);
    } catch (error) {
      console.error("Failed to parse default date:", error);
    }
  }
});

const onSubmit = form.handleSubmit(async (values) => {
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

    // Reset the form
    form.resetForm();

    // Reset date values
    startDateValue.value = undefined;
    endDateValue.value = undefined;
    deadlineValue.value = undefined;

    // Emit event to parent to refresh tasks
    emit("taskAdded");
  } catch (error) {
    console.error("Failed to add task:", error);
    alert("Failed to add task. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <form @submit.prevent="onSubmit" class="max-w-2xl mx-auto space-y-6 p-6">
    <FormField v-slot="{ componentField }" name="title">
      <FormItem>
        <FormLabel>What would you like to do?</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="I want to..."
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>More details (optional)</FormLabel>
        <FormControl>
          <Textarea
            placeholder="Add more details here..."
            class="resize-none"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <AddSubtask/>

 <!--    <FormField name="subtasks">
      <FormItem>
        <FormLabel>Subtasks</FormLabel>

        <div class="space-y-3">
          <div
            v-for="(field, index) in fields"
            :key="field.key"
            class="flex items-center gap-2"
          >
            <FormField
              :name="`subtasks[${index}].title`"
              v-slot="{ componentField }"
            >
              <FormItem class="flex-1">
                <FormControl>
                  <Input
                    placeholder="What's the next small step?"
                    :aria-label="`Step ${index + 1}`"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              @click="remove(index)"
              :aria-label="`Delete step ${index + 1}`"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button type="button" variant="outline" @click="push({ title: '' })">
          + Add Subtask
        </Button>

        <FormMessage />
      </FormItem>
    </FormField> -->

    <FormField v-slot="{ componentField }" name="startdate">
      <FormItem>
        <FormLabel>Start date (optional)</FormLabel>
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

    <!-- <FormField v-slot="{ componentField }" name="enddate">
      <FormItem>
        <FormLabel>End date</FormLabel>
        <FormDescription> When would you like to be done? </FormDescription>
        <FormControl>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="
                  cn(
                    'w-[280px] justify-start text-left font-normal',
                    !endDateValue && 'text-muted-foreground'
                  )
                "
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{
                  endDateValue
                    ? df.format(endDateValue.toDate(getLocalTimeZone()))
                    : "Pick a date"
                }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="endDateValue" initial-focus />
            </PopoverContent>
          </Popover>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="deadline">
      <FormItem>
        <FormLabel>Deadline</FormLabel>
        <FormDescription> Is there a deadline? </FormDescription>
        <FormControl>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="
                  cn(
                    'w-[280px] justify-start text-left font-normal',
                    !deadlineValue && 'text-muted-foreground'
                  )
                "
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{
                  deadlineValue
                    ? df.format(deadlineValue.toDate(getLocalTimeZone()))
                    : "Pick a date"
                }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="deadlineValue" initial-focus />
            </PopoverContent>
          </Popover>
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField> -->

    <Button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? "Adding..." : "Add Task" }}
    </Button>
  </form>
</template>
