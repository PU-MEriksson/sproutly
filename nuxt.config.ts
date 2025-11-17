import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-10-21",
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __WORKBOX_DEBUG__: false,
    },
  },
  modules: ["@nuxtjs/supabase", "shadcn-nuxt", "@vite-pwa/nuxt"],
  experimental: {
    appManifest: false, // Disable app manifest to fix hydration errors in dev
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "Supportive ToDo",
      link:
        process.env.NODE_ENV === "production"
          ? [{ rel: "manifest", href: "/manifest.webmanifest" }]
          : [],
      meta: [{ name: "theme-color", content: "#ffffff" }],
    },
  },
  pwa: {
    registerType: "autoUpdate",
    disable: process.env.NODE_ENV === "development",
    manifest: {
      name: "Supportive ToDo",
      short_name: "ToDo",
      description: "A supportive task management app",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      scope: "/",
      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      navigateFallbackDenylist: [/^\/api\//],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      sourcemap: false,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          handler: "NetworkFirst",
        },
      ],
    },
    registerWebManifestInRouteRules: false,
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false, // Disable PWA in dev to reduce console noise
      suppressWarnings: true,
      type: "module",
      navigateFallback: "/",
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./app/components/ui"
     */
    componentDir: "./app/components/ui",
  },
  supabase: {
    types: false,
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: [
        "/",
        "/login",
        "/confirm",
        "/about",
        "/manifest.webmanifest",
        "/dev-sw.js",
      ],
    },
  },
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    public: {
      PUBLIC_REDIRECT_URL:
        process.env.PUBLIC_REDIRECT_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"),
    },
  },
});
