<script setup lang="ts">
import { CalendarHeart } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
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
    <EmptyContent>
      <!-- Maybe add buttons or something here? -->
    </EmptyContent>
  </Empty>
</template>