<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
import Input from "~/components/ui/input/Input.vue";
import { Sprout } from "lucide-vue-next";

const supabase = useSupabaseClient();
const route = useRoute();

const email = ref("");
const otp = ref("");
const otpSent = ref(false);
const loading = ref(false);
const resendingCode = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Check if user just confirmed their email
onMounted(() => {
  if (route.query.confirmed === "true") {
    successMessage.value = "Email confirmed! Now request a login code below.";

    // Pre-fill email if provided
    if (route.query.email) {
      email.value = route.query.email as string;
    }
  }
});

const sendOtp = async () => {
  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

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

const resendOtp = async () => {
  resendingCode.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      shouldCreateUser: false,
    },
  });

  resendingCode.value = false;

  if (error) {
    errorMessage.value = error.message;
    console.error(error);
  } else {
    successMessage.value = "New code sent! Check your email.";
  }
};

const verifyOtp = async () => {
  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

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
  successMessage.value = "";
  resendingCode.value = false;
};
</script>
<template>
  <div
    class="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-calm-50 to-white"
  >
    <div class="w-full max-w-md space-y-8">
      <!-- Logo/Icon -->
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <div class="text-calm-600">
            <Sprout :size="48" :stroke-width="2" />
          </div>
        </div>
        <h1
          class="text-3xl font-bold bg-gradient-to-r from-calm-700 to-calm-600 bg-clip-text text-transparent"
        >
          {{ successMessage ? "Welcome!" : "Get Started" }}
        </h1>
        <p class="text-calm-600 mt-2">
          {{
            otpSent
              ? "Enter the code from your email"
              : "Sign in or create your account"
          }}
        </p>
      </div>

      <div
        class="bg-white/70 backdrop-blur-sm rounded-2xl border border-calm-200/40 shadow-lg p-8 space-y-6"
      >
        <div v-if="!otpSent">
          <!-- Email Input Step -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="email" class="text-sm font-medium text-calm-800"
                >Email</label
              >
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                :disabled="loading"
                @keyup.enter="sendOtp"
                class="h-12 border-calm-200/50 focus:border-calm-400"
              />
            </div>

            <Button
              @click="sendOtp"
              size="lg"
              class="w-full h-12 bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white shadow-sm hover:shadow-md"
              :disabled="!email || loading"
            >
              {{ loading ? "Sending..." : "Send Code" }}
            </Button>

            <p class="text-xs text-calm-600 text-center">
              New user? You'll receive a confirmation email first, then you can
              request a login code.
            </p>
          </div>
        </div>

        <div v-else>
          <!-- OTP Verification Step -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="otp" class="text-sm font-medium text-calm-800">
                Verification Code
              </label>
              <Input
                id="otp"
                v-model="otp"
                type="text"
                placeholder="000000"
                maxlength="6"
                :disabled="loading"
                @keyup.enter="verifyOtp"
                class="text-center text-2xl tracking-widest h-14 border-calm-200/50 focus:border-calm-400"
              />
              <p class="text-xs text-calm-600">Sent to {{ email }}</p>
            </div>

            <Button
              @click="verifyOtp"
              size="lg"
              class="w-full h-12 bg-gradient-to-br from-calm-500 to-calm-600 hover:from-calm-600 hover:to-calm-700 text-white shadow-sm hover:shadow-md"
              :disabled="otp.length !== 6 || loading"
            >
              {{ loading ? "Verifying..." : "Verify Code" }}
            </Button>

            <div class="flex gap-2">
              <Button
                @click="resendOtp"
                variant="outline"
                size="sm"
                class="flex-1 text-calm-600 hover:text-calm-700 hover:bg-calm-50 border-calm-200"
                :disabled="loading || resendingCode"
              >
                {{ resendingCode ? "Sending..." : "Send a new code" }}
              </Button>

              <Button
                @click="resetForm"
                variant="ghost"
                size="sm"
                class="flex-1 text-calm-600 hover:text-calm-700 hover:bg-calm-50"
                :disabled="loading || resendingCode"
              >
                Use different email
              </Button>
            </div>
          </div>
        </div>

        <div
          v-if="successMessage"
          class="text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg text-center"
        >
          {{ successMessage }}
        </div>

        <div
          v-if="errorMessage"
          class="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center"
        >
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>
