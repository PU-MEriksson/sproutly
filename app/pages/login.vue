<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
const supabase = useSupabaseClient();
const config = useRuntimeConfig();
const email = ref("");

const signInWithOtp = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: `${config.public.PUBLIC_REDIRECT_URL}/confirm`,
    },
  });
  if (error) console.log(error);
  else {
    alert("Check your email for the login link!");
  }
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
