<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import type { Database } from "~/types/database.types";

// Import task circle here later when the component is ready

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const props = defineProps<{ task: Task }>();
</script>

<template>
  <Accordion type="single" collapsible class="bg-white rounded-xl">
    <AccordionItem value="item-1">
      <AccordionTrigger class="h-14 p-4">
        <Checkbox id="task-completed" v-model="props.task.completed" />
        {{ props.task.title }}
      </AccordionTrigger>
      <AccordionContent>
        <p class="text-sm text-gray-600 whitespace-pre-line">
          {{ props.task.description || "No description" }}
        </p>
        <p>subtask placeholder text</p>
        <p>subtask placeholder text</p>
        <p>subtask placeholder text</p>
        <p>subtask placeholder text</p>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
