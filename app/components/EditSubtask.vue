<script setup lang="ts">
import { useFieldArray, useFormValues } from "vee-validate";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-vue-next";

const { fields, push, remove } = useFieldArray("subtasks");

const values = useFormValues<{
  subtasks: Array<{ id?: number; title: string; completed?: boolean }>;
}>();
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
          <!-- Hidden ID -->
          <FormField
            :name="`subtasks[${index}].id`"
            v-slot="{ componentField }"
          >
            <input type="hidden" v-bind="componentField" />
          </FormField>

          <!-- Hidden completed flag -->
          <FormField
            :name="`subtasks[${index}].completed`"
            v-slot="{ componentField }"
          >
            <input type="hidden" v-bind="componentField" />
          </FormField>

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
                  :class="{
                    'line-through text-muted-foreground':
                      values.subtasks?.[index]?.completed,
                  }"
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
            class="text-calm-600 hover:text-calm-800 hover:bg-calm-100"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        @click="push({ title: '', completed: false })"
      >
        + Add Subtask
      </Button>

      <FormMessage />
    </FormItem>
  </FormField>
</template>
