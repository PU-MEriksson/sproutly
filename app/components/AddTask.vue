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
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import { CalendarIcon, Trash2 } from "lucide-vue-next";
import { ref, watch } from "vue";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Database } from "~/types/database.types";

const df = new DateFormatter("sv-SE", {
  dateStyle: "long",
});

const startDateValue = ref<DateValue | undefined>();
const endDateValue = ref<DateValue | undefined>();
const deadlineValue = ref<DateValue | undefined>();

const subtaskSchema = z.object({
  title: z.string().min(1, "Subtask title is required"),
});

const taskSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    startdate: z.string().datetime().optional(),
    enddate: z.string().datetime().optional(),
    deadline: z.string().datetime().optional(),
    subtasks: z.array(subtaskSchema).default([]),
  })
);

const form = useForm({
  validationSchema: taskSchema,
  initialValues: {
    subtasks: [],
  },
});

const { fields, push, remove } = useFieldArray("subtasks");

const { addTask } = useTasks();

watch(endDateValue, (val) => {
  if (val) {
    form.setFieldValue("enddate", val.toDate(getLocalTimeZone()).toISOString());
  } else {
    form.setFieldValue("enddate", undefined);
  }
});

watch(deadlineValue, (val) => {
  if (val) {
    form.setFieldValue(
      "deadline",
      val.toDate(getLocalTimeZone()).toISOString()
    );
  } else {
    form.setFieldValue("deadline", undefined);
  }
});

watch(startDateValue, (val) => {
  if (val) {
    form.setFieldValue(
      "startdate",
      val.toDate(getLocalTimeZone()).toISOString()
    );
  } else {
    form.setFieldValue("startdate", undefined);
  }
});

const onSubmit = form.handleSubmit(async (values) => {
  console.log("Form submitted!", values);
  await addTask(
    values.title,
    values.description,
    values.startdate,
    values.enddate,
    values.deadline,
    values.subtasks
  );
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
            placeholder="Add a description to make your task more understandable"
            class="resize-none"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div>
      <h3>Subtasks</h3>

      <div v-if="fields.length === 0">No subtasks yet. Add one below!</div>

      <div
        v-for="(field, index) in fields"
        :key="field.key"
        class="flex items-center"
      >
        <FormField
          :name="`subtasks[${index}].title`"
          v-slot="{ componentField }"
        >
          <FormItem>
            <FormLabel>Step {{ index + 1 }}</FormLabel>
            <FormControl>
              <Input
                placeholder="What's the next small step?"
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
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>

      <Button type="button" variant="outline" @click="push({ title: '' })">
        + Add Subtask
      </Button>
    </div>
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
    <FormField v-slot="{ componentField }" name="enddate">
      <!-- <FormItem>
        <FormLabel>End date</FormLabel>
        <FormDescription>
            When would you like to be done?
        </FormDescription>
        <FormControl>
        <Popover>
            <PopoverTrigger as-child>
            <Button
                variant="outline"
                :class="cn(
                'w-[280px] justify-start text-left font-normal',
                !endDateValue && 'text-muted-foreground'
                )"
            >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ endDateValue
                ? df.format(endDateValue.toDate(getLocalTimeZone()))
                : "Pick a date" }}
            </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
            <Calendar v-model="endDateValue" initial-focus />
            </PopoverContent>
        </Popover>
        </FormControl>
        <FormMessage />
    </FormItem> -->
    </FormField>
    <!-- <FormField v-slot="{ componentField }" name="deadline">
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
    <Button type="submit"> Submit </Button>
  </form>
</template>
