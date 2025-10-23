<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { DateValue } from "@internationalized/date"
import {
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date"
import { CalendarIcon } from "lucide-vue-next"
import { ref, watch } from "vue"
import { cn } from "@/lib/utils"
import { Input } from '@/components/ui/input'

const df = new DateFormatter("sv-SE", {
  dateStyle: "long",
})

const startDateValue = ref<DateValue | undefined>()
const endDateValue = ref<DateValue | undefined>()
const deadlineValue = ref<DateValue | undefined>()



const taskSchema = toTypedSchema(z.object({
  title: z.string(),
  description: z.string().optional(),
  startdate: z.string().datetime().optional(),
  enddate: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),   
}))

const form = useForm({
  validationSchema: taskSchema,
})

const { addTask } = useTasks()

watch(endDateValue, (val) => {
  if (val) {
    form.setFieldValue('enddate', val.toDate(getLocalTimeZone()).toISOString())
  } else {
    form.setFieldValue('enddate', undefined)
  }
})

watch(deadlineValue, (val) => {
  if (val) {
    form.setFieldValue('deadline', val.toDate(getLocalTimeZone()).toISOString())
  } else {
    form.setFieldValue('deadline', undefined)
  }
})

watch(startDateValue, (val) => {
  if (val) {
    form.setFieldValue('startdate', val.toDate(getLocalTimeZone()).toISOString())
  } else {
    form.setFieldValue('startdate', undefined)
  }
})

const onSubmit = form.handleSubmit(async (values) => {
  console.log('Form submitted!', values)
  await addTask(values.title, values.description, values.startdate, values.enddate, values.deadline)
})


</script>

<template>
  <form @submit.prevent="onSubmit">
    <FormField v-slot="{ componentField }" name="title">
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormDescription>
          Add a descriptive title for your task.
        </FormDescription>
        <FormControl>
          <Input type="text" placeholder="Add task" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="description">
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormDescription>
          A description can make your task easier to do.
        </FormDescription>
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
    <FormField v-slot="{ componentField }" name="startdate">
    <FormItem>
        <FormLabel>Start date</FormLabel>
        <FormDescription>
           When would you like to start?
        </FormDescription>   
        <FormControl>
        <Popover>
            <PopoverTrigger as-child>
            <Button
                variant="outline"
                :class="cn(
                'w-[280px] justify-start text-left font-normal',
                !startDateValue && 'text-muted-foreground'
                )"
            >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ startDateValue
                ? df.format(startDateValue.toDate(getLocalTimeZone()))
                : "Pick a date" }}
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
    <FormItem>
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
    </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="deadline">
    <FormItem>
        <FormLabel>Deadline</FormLabel>
        <FormDescription>
            Is there a deadline?
        </FormDescription>
        <FormControl>
        <Popover>
            <PopoverTrigger as-child>
            <Button
                variant="outline"
                :class="cn(
                'w-[280px] justify-start text-left font-normal',
                !deadlineValue && 'text-muted-foreground'
                )"
            >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ deadlineValue
                ? df.format(deadlineValue.toDate(getLocalTimeZone()))
                : "Pick a date" }}
            </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
            <Calendar v-model="deadlineValue" initial-focus />
            </PopoverContent>
        </Popover>
        </FormControl>
        <FormMessage />
    </FormItem>
    </FormField>
    <Button type="submit">
      Submit
    </Button>
  </form>
</template>

