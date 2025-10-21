export default defineNuxtConfig({
  compatibilityDate: "2025-10-21",
  modules: ["@nuxtjs/supabase"],
  supabase: {
    types: false,
  },
});
