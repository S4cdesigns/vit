import { createContext, useContext } from "react";

export const SafeModeContext = createContext<{
  enabled: boolean;
  toggle: () => void;
}>({
  enabled: false,
  toggle: () => {},
});

export function useSafeMode() {
  const ctx = useContext(SafeModeContext);
  return {
    ...ctx,
    blur: ctx.enabled ? "blur(20px)" : undefined,
  };
}
