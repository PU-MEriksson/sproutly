import { ref, onMounted, onUnmounted } from "vue";

export const useOnlineStatus = () => {
  const isOnline = ref(true);
  let pollInterval: NodeJS.Timeout | null = null;

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine;
  };

  onMounted(() => {
    // Set initial state
    isOnline.value = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Poll every 2 seconds
    pollInterval = setInterval(updateOnlineStatus, 2000);
  });

  onUnmounted(() => {
    window.removeEventListener("online", updateOnlineStatus);
    window.removeEventListener("offline", updateOnlineStatus);

    if (pollInterval) {
      clearInterval(pollInterval);
    }
  });

  return {
    isOnline,
  };
};
