<script setup lang="ts">
import TaskAccordion from "~/components/TaskAccordion.vue";
</script>

<template>
  <div class="bg-blue-500">
    <h1>All tasks</h1>
    <TaskAccordion />
    <p>Links:</p>
    <NuxtLink to="/about">About</NuxtLink>
    <NuxtLink to="/settings">Settings</NuxtLink>
    <NuxtLink to="/today">Today</NuxtLink>
    <NuxtLink to="/all-tasks">All Tasks</NuxtLink>
    <NuxtLink to="/login">Login</NuxtLink>
  </div>
</template>
