<script lang="ts" setup>
import type { CalendarCellTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { CalendarCellTrigger, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from '@/components/ui/button'

const props = withDefaults(defineProps<CalendarCellTriggerProps & { class?: HTMLAttributes["class"] }>(), {
  as: "button",
})

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarCellTrigger
    data-slot="calendar-cell-trigger"
    :class="cn(
      buttonVariants({ variant: 'ghost' }),
      'size-8 p-0 font-normal aria-selected:opacity-100 cursor-default',
      '[&[data-today]:not([data-selected])]:bg-neutral-100 [&[data-today]:not([data-selected])]:text-neutral-900 dark:[&[data-today]:not([data-selected])]:bg-neutral-800 dark:[&[data-today]:not([data-selected])]:text-neutral-50',
      // Selected
      'data-[selected]:bg-neutral-900 data-[selected]:text-neutral-50 data-[selected]:opacity-100 data-[selected]:hover:bg-neutral-900 data-[selected]:hover:text-neutral-50 data-[selected]:focus:bg-neutral-900 data-[selected]:focus:text-neutral-50 dark:data-[selected]:bg-neutral-50 dark:data-[selected]:text-neutral-900 dark:data-[selected]:hover:bg-neutral-50 dark:data-[selected]:hover:text-neutral-900 dark:data-[selected]:focus:bg-neutral-50 dark:data-[selected]:focus:text-neutral-900',
      // Disabled
      'data-[disabled]:text-neutral-500 data-[disabled]:opacity-50 dark:data-[disabled]:text-neutral-400',
      // Unavailable
      'data-[unavailable]:text-neutral-50 data-[unavailable]:line-through dark:data-[unavailable]:text-neutral-50',
      // Outside months
      'data-[outside-view]:text-neutral-500 dark:data-[outside-view]:text-neutral-400',
      props.class,
    )"
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarCellTrigger>
</template>
