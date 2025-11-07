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
      message: `Amazing! You completed "${props.lastCompletedTask}". You should be proud of yourself!`,
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
    :class="[
      'mx-6 my-6 border-0 shadow-md',
      feedbackMessage.type === 'celebration' &&
        '!bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 border border-emerald-200/50',
      feedbackMessage.type === 'support' &&
        '!bg-gradient-to-br from-calm-100 via-calm-50 to-blue-50 border border-calm-200/50',
      feedbackMessage.type === 'neutral' &&
        '!bg-gradient-to-br from-purple-50 via-pink-50 to-calm-50 border border-purple-100/50',
    ]"
  >
    <CardContent class="pt-8 pb-8 px-6">
      <p class="text-base flex items-start gap-4">
        <span class="text-3xl">{{ feedbackMessage.emoji }}</span>
        <span class="flex-1 pt-1.5 text-calm-900 leading-relaxed font-medium">{{
          feedbackMessage.message
        }}</span>
      </p>
    </CardContent>
  </Card>
</template>
