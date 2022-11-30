import { createContext, useContext } from "react";

export const SettingsContext = createContext<{
  showCardLabels: boolean;
  setShowCardLabels: (isSet: boolean) => void;
}>({
  showCardLabels: true,
  setShowCardLabels: (isSet: boolean) => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}
