<script setup lang="ts">
import { CalendarHeart } from 'lucide-vue-next'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <CalendarHeart />
      </EmptyMedia>
      <EmptyTitle>No tasks?</EmptyTitle>
      <EmptyDescription>Add one to get started.</EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>