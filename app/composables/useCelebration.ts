import confetti from "canvas-confetti";

export const useCelebration = () => {
  const playSubtaskSound = () => {
    const audio = new Audio("/sounds/subtask-complete.wav");
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const playTaskSound = () => {
    const audio = new Audio("/sounds/task-complete.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const showConfetti = () => {
    // Classic confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#a855f7", "#ec4899", "#3b82f6", "#10b981"], // Purple, pink, blue, green
    });
  };

  // Full celebration (task complete)
  const celebrateTask = () => {
    playTaskSound();
    showConfetti();
  };

  // Small celebration (subtask complete)
  const celebrateSubtask = (element?: HTMLElement) => {
    playSubtaskSound();

    // Small, subtle sparkle effect
    confetti({
      particleCount: 15,
      spread: 25,
      origin: { y: 0.6, x: 0.07 },
      colors: ["#fbbf24", "#fcd34d"], // Gold sparkles
      startVelocity: 10,
      scalar: 0.5, // Smaller particles
      gravity: 1.2,
      ticks: 50, // Shorter duration
    });
  };

  return {
    celebrateTask,
    celebrateSubtask,
  };
};
