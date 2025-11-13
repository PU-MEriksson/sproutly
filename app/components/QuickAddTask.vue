<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-vue-next";
import { toast } from "vue-sonner";
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
const formRef = ref<HTMLFormElement | null>(null);
const { isOnline } = useOnlineStatus();

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

const title = computed({
  get: () => form.values.title,
  set: (val) => form.setFieldValue("title", val),
});

const handleQuickAdd = form.handleSubmit(async (values) => {
  // Prevent submission when offline
  if (!isOnline.value) {
    toast.error("You're offline. Please reconnect to add a task.");
    return;
  }

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

const handleInputFocus = () => {
  // Clear error message when user focuses on the input
  form.setFieldError("title", undefined);
};

const handleClickOutside = (event: MouseEvent) => {
  if (formRef.value && !formRef.value.contains(event.target as Node)) {
    // Clear error when clicking outside the form
    form.setFieldError("title", undefined);
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    class="px-6 py-8 mx-6 my-6 bg-white/70 backdrop-blur-sm space-y-6 rounded-2xl border-l-4 border-l-calm-400 border border-calm-200/40 shadow-md"
  >
    <div class="space-y-3">
      <form
        ref="formRef"
        @submit="handleQuickAdd"
        class="flex gap-3 items-start"
      >
        <FormField
          v-slot="{ componentField }"
          name="title"
          :validate-on-blur="false"
          :validate-on-change="false"
          :validate-on-input="false"
          :validate-on-model-update="false"
        >
          <FormItem class="flex-1">
            <FormControl>
              <Input
                type="text"
                placeholder="What needs to be done?"
                v-bind="componentField"
                @focus="handleInputFocus"
                aria-label="Quick add task"
                class="h-12 text-base border-calm-200/50 focus:border-calm-400 bg-white/80"
                :disabled="!isOnline"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button
          type="submit"
          :disabled="isSubmitting || !isOnline"
          class="h-12 px-5 gap-2 bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium"
        >
          <Plus class="h-5 w-5" />
          <span class="hidden sm:inline">Add Task</span>
          <span class="sm:hidden">Add</span>
        </Button>
      </form>

      <Sheet v-model:open="isExpanded">
        <SheetTrigger as-child>
          <button
            type="button"
            class="text-sm text-calm-600 hover:text-calm-700 underline-offset-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-calm-400 rounded-lg px-2 py-1 transition-colors duration-200"
            aria-label="Add task with more details"
          >
            Include more details
          </button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <div class="mt-4 max-h-[75vh] overflow-y-auto">
            <AddTask
              v-model:title="title"
              :default-date="defaultDate"
              @task-added="handleExpandedTaskAdded"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </div>
</template>
