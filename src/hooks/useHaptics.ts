import { useWebHaptics } from "web-haptics/react";
import { useMemo } from "react";

export default function useHaptics() {
  const { trigger } = useWebHaptics();

  return useMemo(
    () => ({
      light: () => trigger("light"),
      medium: () => trigger("medium"),
      strong: () => trigger("heavy"),
    }),
    [trigger]
  );
}
