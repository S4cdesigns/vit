import { ReactNode, useEffect, useState } from "react";

import { SettingsContext } from "../composables/use_settings";

type Props = {
  children: ReactNode;
};

export default function SettingsContextProvider(props: Props) {
  const [showCardLabels, setShowCardLabels] = useState(true);

  useEffect(() => {
    const storageValue = window.localStorage.getItem("pm_showCardLabels");

    if (storageValue === null) {
      return;
    }

    setShowCardLabels(storageValue === "true");
  }, []);

  const toggleShowCardLabels = (isSet: boolean) => {
    window.localStorage.setItem("pm_showCardLabels", isSet.toString());
    setShowCardLabels(!showCardLabels);
  };

  return (
    <SettingsContext.Provider
      value={{
        showCardLabels,
        setShowCardLabels: toggleShowCardLabels,
      }}
    >
      {props.children}
    </SettingsContext.Provider>
  );
}
