<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const props = defineProps<{
  cardTitle?: string;
  cardDescription?: string;
}>();

const { tasks, loading, error, refresh } = useTasks();
</script>

<template>
  <Card class="bg-neutral-100">
    <CardHeader>
      <CardTitle>{{ props.cardTitle }}</CardTitle>
      <CardDescription v-if="props.cardDescription">
        {{ props.cardDescription }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p v-if="loading">Loading…</p>
      <p v-else-if="error">{{ error }}</p>

      <div v-else class="space-y-2">
        <TaskAccordion v-for="t in tasks" :key="t.id" :task="t" />
        <p v-if="tasks.length === 0">No tasks found</p>
      </div>
    </CardContent>
  </Card>
</template>
