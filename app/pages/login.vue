<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
import Input from "~/components/ui/input/Input.vue";

const supabase = useSupabaseClient();
const email = ref("");
const otp = ref("");
const otpSent = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const sendOtp = async () => {
  loading.value = true;
  errorMessage.value = "";

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      shouldCreateUser: true,
    },
  });

  loading.value = false;

  if (error) {
    errorMessage.value = error.message;
    console.error(error);
  } else {
    otpSent.value = true;
  }
};

const verifyOtp = async () => {
  loading.value = true;
  errorMessage.value = "";

  const { error } = await supabase.auth.verifyOtp({
    email: email.value,
    token: otp.value,
    type: "email",
  });

  loading.value = false;

  if (error) {
    errorMessage.value = error.message;
    console.error(error);
  } else {
    // Success! Supabase will handle the redirect
    navigateTo("/");
  }
};

const resetForm = () => {
  otpSent.value = false;
  otp.value = "";
  errorMessage.value = "";
};
</script>
<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold">Welcome Back</h1>
        <p class="text-muted-foreground mt-2">
          {{
            otpSent
              ? "Enter the code from your email"
              : "Sign in to your account"
          }}
        </p>
      </div>

      <div class="space-y-4">
        <div v-if="!otpSent">
          <!-- Email Input Step -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="email" class="text-sm font-medium">Email</label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                :disabled="loading"
                @keyup.enter="sendOtp"
              />
            </div>

            <Button
              @click="sendOtp"
              variant="default"
              size="lg"
              class="w-full"
              :disabled="!email || loading"
            >
              {{ loading ? "Sending..." : "Send Code" }}
            </Button>
          </div>
        </div>

        <div v-else>
          <!-- OTP Verification Step -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="otp" class="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="otp"
                v-model="otp"
                type="text"
                placeholder="Enter 6-digit code"
                maxlength="6"
                :disabled="loading"
                @keyup.enter="verifyOtp"
                class="text-center text-2xl tracking-widest"
              />
              <p class="text-xs text-muted-foreground">Sent to {{ email }}</p>
            </div>

            <Button
              @click="verifyOtp"
              variant="default"
              size="lg"
              class="w-full"
              :disabled="otp.length !== 6 || loading"
            >
              {{ loading ? "Verifying..." : "Verify Code" }}
            </Button>

            <Button
              @click="resetForm"
              variant="ghost"
              size="sm"
              class="w-full"
              :disabled="loading"
            >
              Use different email
            </Button>
          </div>
        </div>

        <div v-if="errorMessage" class="text-sm text-red-600 text-center">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
