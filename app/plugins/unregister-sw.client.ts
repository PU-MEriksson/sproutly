export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === "development" && "serviceWorker" in navigator) {
    // Unregister all service workers in development
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
});
