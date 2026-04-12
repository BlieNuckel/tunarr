type HapticIntensity = "light" | "medium" | "strong";

const DURATIONS: Record<HapticIntensity, number | number[]> = {
  light: 15,
  medium: 40,
  strong: 80,
};

function trigger(intensity: HapticIntensity): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  navigator.vibrate(DURATIONS[intensity]);
}

const haptics = {
  light: () => trigger("light"),
  medium: () => trigger("medium"),
  strong: () => trigger("strong"),
} as const;

export default function useHaptics() {
  return haptics;
}
