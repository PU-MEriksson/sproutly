<script setup lang="ts">
import { Separator } from "@/components/ui/separator";

useHead({
  title: "Settings - Supportive ToDo",
});

const supabase = useSupabaseClient();

async function logout() {
  await supabase.auth.signOut();
  navigateTo("/login");
}
</script>

<template>
  <div class="min-h-screen bg-white pb-20 pt-20">
    <TopNavbar />
    <div class="max-w-2xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-bold text-calm-800 mb-6">Settings</h1>

      <div class="space-y-6">
        <Separator />

        <!-- Daily Reset Preference Component -->
        <DailyResetPreference :show-toast="true" />

        <Separator />

        <!-- How It Works Link -->
        <NuxtLink
          to="/how-it-works"
          class="block p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-calm-200/40 hover:border-calm-300 transition-all"
        >
          <span class="text-calm-700 font-medium"
            >How SupportiveToDo Works</span
          >
          <p class="text-sm text-calm-600 mt-1">
            Learn how to use the app and get the most out of its features
          </p>
        </NuxtLink>

        <!-- About Link -->
        <NuxtLink
          to="/about"
          class="block p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-calm-200/40 hover:border-calm-300 transition-all"
        >
          <span class="text-calm-700 font-medium">About SupportiveToDo</span>
          <p class="text-sm text-calm-600 mt-1">
            Learn more about our mission and features
          </p>
        </NuxtLink>

        <!-- Logout Button -->
        <button
          @click="logout"
          class="w-full p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 text-red-700 font-medium transition-all"
        >
          Log out
        </button>
      </div>
    </div>
  </div>
  <Navbar />
</template>
