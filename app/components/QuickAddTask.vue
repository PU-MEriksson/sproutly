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

const isExpanded = ref(false);
const isSubmitting = ref(false);

const emit = defineEmits<{
  taskAdded: [];
}>();

const quickFormSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, "Task title is required"),
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
    await addTask(values.title.trim());
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
  <div class="p-4 m-4 bg-white space-y-4 rounded-lg shadow-md">
    <div class="space-y-2">
      <form @submit="handleQuickAdd" class="flex gap-2 items-center">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem class="flex-1">
            <FormControl>
              <Input
                type="text"
                placeholder="I want to..."
                v-bind="componentField"
                aria-label="Quick add task"
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
        >
          <Plus class="h-4 w-4" />
        </Button>
      </form>

      <Sheet v-model:open="isExpanded">
        <SheetTrigger as-child>
          <button
            type="button"
            class="text-xs text-gray-500 hover:text-gray-700 underline-offset-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
            aria-label="Add task with more details"
          >
            Advanced input
          </button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <div class="mt-4 max-h-[75vh] overflow-y-auto">
            <AddTask @task-added="handleExpandedTaskAdded" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </div>
</template>
