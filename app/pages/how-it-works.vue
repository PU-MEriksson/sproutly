<script setup lang="ts">
import {
  Sprout,
  Plus,
  WandSparkles,
  Rocket,
  CheckCircle,
  Calendar,
  List,
  ArrowRight,
  SkipForward,
} from "lucide-vue-next";

useHead({
  title: "How It Works - Sproutly",
});

const user = useSupabaseUser();

// Check if this is being accessed from onboarding
const route = useRoute();
const isOnboarding = route.query.onboarding === "true";

const continueToApp = () => {
  navigateTo("/today");
};

const skipInstructions = () => {
  navigateTo("/today");
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-calm-50 to-white pb-20">
    <TopNavbar />

    <div class="max-w-4xl mx-auto px-6 pt-24 pb-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="flex items-center justify-center gap-4 mb-6">
          <div class="text-calm-600">
            <Sprout :size="48" :stroke-width="2" />
          </div>
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-calm-700 to-calm-600 bg-clip-text text-transparent"
          >
            How Sproutly Works
          </h1>
        </div>
        <p class="text-lg text-calm-700 max-w-2xl mx-auto">
          A guide to getting the most out of your supportive task manager
        </p>

        <!-- Onboarding Progress -->
        <div v-if="isOnboarding" class="mt-6 text-sm text-calm-600">
          Step 2 of 3: Learn the basics
        </div>
      </div>

      <!-- Instructions Grid -->
      <div class="space-y-12">
        <!-- 1. Getting Started -->
        <div
          class="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-calm-200/40 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 bg-calm-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
            >
              1
            </div>
            <h2 class="text-2xl font-bold text-calm-800">Getting Started</h2>
          </div>

          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3
                class="text-lg font-semibold text-calm-800 mb-3 flex items-center gap-2"
              >
                <Plus :size="20" class="text-calm-600" />
                Add Your First Task
              </h3>
              <p class="text-calm-700 mb-4">
                Start by adding a task that feels important to you. You have two
                ways to add tasks:
              </p>
              <div class="mb-4">
                <h4 class="font-medium text-calm-800 mb-2">Quick Add</h4>
                <ul class="text-sm text-calm-600 space-y-1 mb-3">
                  <li>• Perfect for capturing ideas quickly</li>
                  <li>• Just enter a task title and you're done</li>
                  <li>• Great when you're in a hurry</li>
                </ul>

                <h4 class="font-medium text-calm-800 mb-2">
                  Include More Details
                </h4>
                <ul class="text-sm text-calm-600 space-y-1">
                  <li>• Add descriptions for better AI suggestions</li>
                  <li>• Set start dates to schedule tasks</li>
                  <li>• More context = more helpful AI responses</li>
                </ul>
              </div>
            </div>
            <div class="bg-calm-50 rounded-xl p-6 border border-calm-200/50">
              <img src="/images/addTask.png" alt="Add task form showing title input field, 'include more details' button and add button.">
            </div>
          </div>
        </div>

        <!-- 2. Breaking Down Tasks -->
        <div
          class="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-calm-200/40 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 bg-calm-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
            >
              2
            </div>
            <h2 class="text-2xl font-bold text-calm-800">
              Breaking Down Overwhelming Tasks
            </h2>
          </div>

          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3
                class="text-lg font-semibold text-calm-800 mb-3 flex items-center gap-2"
              >
                <WandSparkles :size="20" class="text-calm-600" />
                Use AI to Break Down Tasks
              </h3>
              <p class="text-calm-700 mb-4">
                When a task feels too big, let our AI help you break it into
                smaller, manageable steps.
              </p>

              <ul class="text-sm text-calm-600 space-y-1">
                <li>• Click "Break down task" button</li>
                <li>• AI creates specific, actionable subtasks</li>
                <li>• Complete them one by one at your pace</li>
                <li>• Rich descriptions = better breakdowns</li>
              </ul>

              <div
                class="bg-calm-50 rounded-lg p-4 mt-4 border border-calm-200/50"
              >
                <h4 class="text-sm font-semibold text-calm-800 mb-2">
                  ✨ Pro Tip
                </h4>
                <p class="text-sm text-calm-600">
                  Tasks with detailed descriptions get much better AI
                  breakdowns! Include your goals, timeline, or what's making it
                  feel overwhelming.
                </p>
              </div>
            </div>

            <div class="bg-calm-50 rounded-xl p-6 border border-calm-200/50">
              <img src="/images/breakDownTask.png" alt="Example of task with subtasks generated with AI.">
            </div>
          </div>
        </div>

        <!-- 3. Getting Started on Tasks -->
        <div
          class="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-calm-200/40 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 bg-calm-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
            >
              3
            </div>
            <h2 class="text-2xl font-bold text-calm-800">When You're Stuck</h2>
          </div>

          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3
                class="text-lg font-semibold text-calm-800 mb-3 flex items-center gap-2"
              >
                <Rocket :size="20" class="text-calm-600" />
                Get Help Starting
              </h3>
              <p class="text-calm-700 mb-4">
                Feeling overwhelmed or don't know where to begin? Use "Help me
                start" for a gentle first step.
              </p>

              <ul class="text-sm text-calm-600 space-y-1">
                <li>• Click "Help me start" button</li>
                <li>• Get a tiny, easy first step</li>
                <li>• Choose to dismiss or add as subtask</li>
                <li>• More task details = better AI suggestions</li>
              </ul>

              <div
                class="bg-calm-50 rounded-lg p-4 mt-4 border border-calm-200/50"
              >
                <h4 class="text-sm font-semibold text-calm-800 mb-2">
                  💡 Get Better AI Suggestions
                </h4>
                <p class="text-sm text-calm-600">
                  The more context you provide in your task description, the
                  better AI suggestions you'll get! Include details about your
                  goals, constraints, or what's making the task feel
                  overwhelming.
                </p>
              </div>
            </div>
            <div class="bg-calm-50 rounded-xl p-6 border border-calm-200/50">
              <img src="/images/firstStep.png" alt="Example of task with AI-generated first step, to help you get started.">
            </div>
          </div>
        </div>

        <!-- 4. Celebrate Completion -->
        <div
          class="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-calm-200/40 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 bg-calm-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
            >
              4
            </div>
            <h2 class="text-2xl font-bold text-calm-800">
              Celebrate Your Wins
            </h2>
          </div>

          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3
                class="text-lg font-semibold text-calm-800 mb-3 flex items-center gap-2"
              >
                <CheckCircle :size="20" class="text-calm-600" />
                Every Task Matters
              </h3>
              <p class="text-calm-700 mb-4">
                Completing tasks is an achievement worth celebrating! Take a
                moment to acknowledge your progress.
              </p>
              <ul class="text-sm text-calm-600 space-y-1">
                <li>• Check off completed tasks</li>
                <li>• Notice the satisfying completion feeling</li>
                <li>• Appreciate your progress, however small</li>
                <li>• Build momentum for the next task</li>
              </ul>
            </div>
            <div class="bg-calm-50 rounded-xl p-6 border border-calm-200/50">
              <img src="/images/celebrate.png" alt="Completion celebration with positive feedback.">
            </div>
          </div>
        </div>

        <!-- 5. Daily Workflow -->
        <div
          class="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-calm-200/40 shadow-sm"
        >
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 bg-calm-500 text-white rounded-full flex items-center justify-center text-sm font-bold"
            >
              5
            </div>
            <h2 class="text-2xl font-bold text-calm-800">
              Your Daily Workflow
            </h2>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div
                class="w-16 h-16 bg-calm-100 rounded-xl flex items-center justify-center mx-auto mb-4"
              >
                <Calendar :size="24" class="text-calm-600" />
              </div>
              <h3 class="font-semibold text-calm-800 mb-2">Today View</h3>
              <p class="text-sm text-calm-600">
                Focus on what matters today. See your scheduled tasks without
                overwhelm.
              </p>
            </div>

            <div class="text-center">
              <div
                class="w-16 h-16 bg-calm-100 rounded-xl flex items-center justify-center mx-auto mb-4"
              >
                <List :size="24" class="text-calm-600" />
              </div>
              <h3 class="font-semibold text-calm-800 mb-2">All Tasks</h3>
              <p class="text-sm text-calm-600 mb-3">
                Your complete task list. Schedule items for specific days when
                you're ready.
              </p>
              <div class="bg-calm-50 rounded-lg p-3 border border-calm-200/50">
                <p class="text-xs text-calm-600">
                  💡 Click the <strong>⋯</strong> menu on any task to add it to
                  "Today"
                </p>
              </div>
            </div>

            <div class="text-center">
              <div
                class="w-16 h-16 bg-calm-100 rounded-xl flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle :size="24" class="text-calm-600" />
              </div>
              <h3 class="font-semibold text-calm-800 mb-2">
                Celebrate Progress
              </h3>
              <p class="text-sm text-calm-600">
                Every completed task is an achievement. Enjoy the satisfaction!
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="text-center mt-12">
        <div
          v-if="isOnboarding"
          class="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            @click="skipInstructions"
            variant="ghost"
            size="lg"
            class="text-calm-600 hover:text-calm-700"
          >
            <SkipForward :size="18" class="mr-2" />
            Skip for now
          </Button>
          <Button
            @click="continueToApp"
            size="lg"
            class="bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Got it, let's start!
            <ArrowRight :size="18" class="ml-2" />
          </Button>
        </div>
        <div v-else>
          <NuxtLink
            to="/today"
            class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Go to Today
            <ArrowRight :size="18" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
  <Navbar v-if="user && !isOnboarding" />
</template>
