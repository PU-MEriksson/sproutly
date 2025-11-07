<script setup lang="ts">
import { ref } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-vue-next";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AddTask from "./AddTask.vue";

const props = defineProps<{
  defaultDate?: string;
}>();

const isExpanded = ref(false);
const isSubmitting = ref(false);

const emit = defineEmits<{
  taskAdded: [];
}>();

const quickFormSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, "Task title is required"),
    startdate: z.string().date().optional(),
  })
);

const form = useForm({
  validationSchema: quickFormSchema,
  initialValues: {
    title: "",
  },
});

const handleQuickAdd = form.handleSubmit(async (values) => {
  isSubmitting.value = true;

  const { addTask } = useTasks();

  try {
    await addTask(values.title.trim(), undefined, props.defaultDate);
    form.resetForm();
    emit("taskAdded");
  } catch (error) {
    console.error("Failed to add task:", error);
    alert("Failed to add task. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
});

const handleExpandedTaskAdded = () => {
  isExpanded.value = false;
  emit("taskAdded");
};
</script>

<template>
  <div
    class="px-6 py-8 mx-6 my-6 bg-white/70 backdrop-blur-sm space-y-6 rounded-2xl border-l-4 border-l-calm-400 border border-calm-200/40 shadow-md"
  >
    <div class="space-y-3">
      <form @submit="handleQuickAdd" class="flex gap-3 items-center">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem class="flex-1">
            <FormControl>
              <Input
                type="text"
                placeholder="What would you like to accomplish?"
                v-bind="componentField"
                aria-label="Quick add task"
                class="h-12 text-base border-calm-200/50 focus:border-calm-400 bg-white/80"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button
          type="submit"
          size="icon"
          :disabled="isSubmitting"
          title="Add task"
          class="h-12 w-12 bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus class="h-5 w-5" />
        </Button>
      </form>

      <Sheet v-model:open="isExpanded">
        <SheetTrigger as-child>
          <button
            type="button"
            class="text-sm text-calm-600 hover:text-calm-700 underline-offset-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-calm-400 rounded-lg px-2 py-1 transition-colors duration-200"
            aria-label="Add task with more details"
          >
            Add more details
          </button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <div class="mt-4 max-h-[75vh] overflow-y-auto">
            <AddTask
              :default-date="defaultDate"
              @task-added="handleExpandedTaskAdded"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </div>
</template>
