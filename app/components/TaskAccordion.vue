<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
</script>

<template>
  <Accordion type="single" collapsible class="bg-white rounded-xl">
    <AccordionItem value="item-1">
      <AccordionTrigger class="h-14 p-4">Task placeholder</AccordionTrigger>
      <AccordionContent>
        <p>subtask placeholder text</p>
        <p>subtask placeholder text</p>
        <p>subtask placeholder text</p>
        <p>subtask placeholder text</p>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
