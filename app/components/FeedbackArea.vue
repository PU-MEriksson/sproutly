<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";

const props = defineProps<{
  totalTasks: number;
  completedTasksToday: number;
  lastCompletedTask?: string;
  timeOfDay: "morning" | "afternoon" | "evening";
}>();

const feedbackMessage = computed(() => {
  // Celebrate when a task was just completed - highest priority feedback
  if (props.lastCompletedTask) {
    return {
      emoji: "🎉",
      message: `Amazing! You completed "${props.lastCompletedTask}". That's progress!`,
      type: "celebration",
    };
  }

  // Celebrate high productivity - 3 or more tasks completed today
  if (props.completedTasksToday >= 3) {
    return {
      emoji: "⭐",
      message: `You've completed ${props.completedTasksToday} tasks today! You're doing great!`,
      type: "celebration",
    };
  }

  // Encourage continued progress - 1-2 tasks completed today
  if (props.completedTasksToday >= 1) {
    return {
      emoji: "✨",
      message: `${props.completedTasksToday} task${
        props.completedTasksToday > 1 ? "s" : ""
      } done! Keep going, you've got this!`,
      type: "celebration",
    };
  }

  // Provide support when task list is overwhelming (>5 tasks)
  if (props.totalTasks > 5) {
    return {
      emoji: "💙",
      message:
        "That's quite a list! Remember: you don't have to do everything today. Pick one to start with.",
      type: "support",
    };
  }

  // Reassure when there are no tasks - remove pressure to be productive
  if (props.totalTasks === 0) {
    return {
      emoji: "🕊️",
      message:
        "No tasks yet? That's okay. Add something when you're ready, or just take it easy today.",
      type: "neutral",
    };
  }

  // Morning greeting - gentle prompt to start the day
  if (props.timeOfDay === "morning") {
    return {
      emoji: "☀️",
      message: "Good morning! What's one thing you'd like to accomplish today?",
      type: "neutral",
    };
  }

  // Evening wind-down - validate the day's efforts
  if (props.timeOfDay === "evening") {
    return {
      emoji: "🌙",
      message:
        "Evening time. Whatever you've done today is enough. Be proud of yourself.",
      type: "neutral",
    };
  }

  // Default fallback message - general encouragement
  return {
    emoji: "💫",
    message: "You've got this. One step at a time.",
    type: "neutral",
  };
});
</script>

<template>
  <Card
    :class="{
      'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200':
        feedbackMessage.type === 'celebration',
      'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200':
        feedbackMessage.type === 'support',
      'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200':
        feedbackMessage.type === 'neutral',
    }"
    class="border shadow-sm"
  >
    <CardContent class="pt-6">
      <p class="text-sm flex items-start gap-3">
        <span class="text-2xl">{{ feedbackMessage.emoji }}</span>
        <span class="flex-1 pt-1">{{ feedbackMessage.message }}</span>
      </p>
    </CardContent>
  </Card>
</template>
