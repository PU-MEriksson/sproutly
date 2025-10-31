<script setup lang="ts">
import type { NavigationMenuLinkEmits, NavigationMenuLinkProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  NavigationMenuLink,

  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<NavigationMenuLinkProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<NavigationMenuLinkEmits>()

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <NavigationMenuLink
    data-slot="navigation-menu-link"
    v-bind="forwarded"
    :class="cn('data-[active=true]:focus:bg-neutral-100 data-[active=true]:hover:bg-neutral-100 data-[active=true]:bg-neutral-100/50 data-[active=true]:text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900 ring-neutral-950/10 dark:ring-neutral-950/20 dark:outline-ring/40 outline-ring/50 [&_svg:not([class*=\'text-\'])]:text-neutral-500 flex flex-col gap-1 rounded-sm p-2 text-sm transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 [&_svg:not([class*=\'size-\'])]:size-4 dark:data-[active=true]:focus:bg-neutral-800 dark:data-[active=true]:hover:bg-neutral-800 dark:data-[active=true]:bg-neutral-800/50 dark:data-[active=true]:text-neutral-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus:bg-neutral-800 dark:focus:text-neutral-50 dark:ring-neutral-300/10 dark:dark:ring-neutral-300/20 dark:[&_svg:not([class*=\'text-\'])]:text-neutral-400', props.class)"
  >
    <slot />
  </NavigationMenuLink>
</template>
