<script setup lang="ts">
import {
  MoreVertical,
  Check,
  ArrowRight,
  Pencil,
  Trash2,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

defineProps<{
  isOnToday: boolean;
  togglingToday: boolean;
  showRemoveFromToday?: boolean;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
  toggleToday: [];
}>();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child @click.stop>
      <Button
        variant="ghost"
        size="sm"
        class="h-8 w-8 p-0 hover:bg-calm-100 shrink-0"
        aria-label="Task actions"
      >
        <MoreVertical :size="16" class="text-calm-600" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuItem
        @click.stop="emit('toggleToday')"
        :disabled="togglingToday"
      >
        <Check v-if="isOnToday" :size="16" class="mr-2" />
        <ArrowRight v-else :size="16" class="mr-2" />
        {{ isOnToday ? "Remove from Today" : "Add to Today" }}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click.stop="emit('edit')">
        <Pencil :size="16" class="mr-2" />
        Edit task
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        @click.stop="emit('delete')"
        class="text-red-600 focus:text-red-600 focus:bg-red-50"
      >
        <Trash2 :size="16" class="mr-2" />
        Delete task
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
