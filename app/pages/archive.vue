<script setup lang="ts">
import { ArchiveX } from "lucide-vue-next";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const {
  allCompletedTasks,
  loadingAllCompletedTasks,
  errorAllCompletedTasks,
  refreshAllCompletedTasks,
} = useTasks();
</script>

<template>
  <div class="bg-white min-h-screen pb-20 pt-20">
    <TopNavbar />

    <div class="max-w-2xl mx-auto">
      <!-- Page heading -->
      <div class="px-6 pt-6 pb-2">
        <h1 class="text-2xl font-bold text-calm-800">Archive</h1>
        <p class="text-sm text-calm-600 mt-1">
          All your completed tasks — great work! 🎉
        </p>
      </div>

      <section
        v-if="allCompletedTasks?.length === 0 && !loadingAllCompletedTasks"
      >
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ArchiveX />
            </EmptyMedia>
            <EmptyTitle>No completed tasks yet</EmptyTitle>
            <EmptyDescription>
              Your completed tasks will appear here. Keep going, you've got
              this!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <!-- Empty content -->
          </EmptyContent>
        </Empty>
      </section>

      <section class="space-y-6 px-6 py-4">
        <div v-if="allCompletedTasks?.length > 0" class="space-y-3">
          <h2 class="text-lg font-semibold text-calm-700 px-2">Completed</h2>
          <ViewTasks
            :tasks="allCompletedTasks"
            :loading="loadingAllCompletedTasks"
            :error="
              errorAllCompletedTasks ? errorAllCompletedTasks.message : null
            "
            :refresh="refreshAllCompletedTasks"
          />
        </div>
      </section>
    </div>
  </div>
  <Navbar />
</template>
