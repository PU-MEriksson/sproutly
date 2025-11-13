<script setup lang="ts">
import { useFieldArray } from "vee-validate";
import { Trash2 } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const { fields, push, remove } = useFieldArray("subtasks");
</script>

<template>
  <FormField name="subtasks">
    <FormItem>
      <FormLabel>Subtasks</FormLabel>

      <div class="space-y-3">
        <div
          v-for="(field, index) in fields"
          :key="field.key"
          class="flex items-center gap-2"
        >
          <FormField
            :name="`subtasks[${index}].title`"
            v-slot="{ componentField }"
          >
            <FormItem class="flex-1">
              <FormControl>
                <Input
                  placeholder="What's the next small step?"
                  :aria-label="`Step ${index + 1}`"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            @click="remove(index)"
            :aria-label="`Delete step ${index + 1}`"
            class="text-calm-600 hover:text-calm-800 hover:bg-calm-100"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button type="button" variant="outline" @click="push({ title: '' })">
        + Add Subtask
      </Button>

      <FormMessage />
    </FormItem>
  </FormField>
</template>
