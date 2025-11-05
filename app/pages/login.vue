<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
const supabase = useSupabaseClient();
const email = ref("");

const signInWithOtp = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: "http://localhost:3000/confirm",
    },
  });
  if (error) console.log(error);
};
</script>
<template>
  <div>
    <Button @click="signInWithOtp" variant="default" size="lg">
      Sign In with E-Mail
    </Button>
    <input v-model="email" type="email" />
  </div>
</template>
