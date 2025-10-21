import tailwindcss from '@tailwindcss/vite'


export default defineNuxtConfig({
  compatibilityDate: "2025-10-21",
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ["@nuxtjs/supabase", "shadcn-nuxt"],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./app/components/ui"
     */
    componentDir: './app/components/ui'
  },
  supabase: {
    types: false,
  },
});