import { ReactNode, useEffect, useState } from "react";

import { ACTOR_RATIO, SCENE_RATIO, SettingsContext } from "../composables/use_settings";

type Props = {
  children: ReactNode;
};

export default function SettingsContextProvider(props: Props) {
  const [showCardLabels, setShowCardLabels] = useState(true);
  const [sceneAspectRatio, setSceneAspectRatio] = useState<SCENE_RATIO>("4:3");
  const [actorAspectRatio, setActorAspectRatio] = useState<ACTOR_RATIO>("3:4");

  useEffect(() => {
    const storageValue = window.localStorage.getItem("pm_showCardLabels");

    if (storageValue !== null) {
      setShowCardLabels(storageValue === "true");
    }

    const sceneRatioValue = window.localStorage.getItem("pm_sceneRatio");

    if (sceneRatioValue !== null) {
      setSceneAspectRatio(sceneRatioValue as SCENE_RATIO);
    }

    const actorRatioValue = window.localStorage.getItem("pm_actorRatio");

    if (actorRatioValue !== null) {
      setActorAspectRatio(actorRatioValue as ACTOR_RATIO);
    }
  }, []);

  const toggleShowCardLabels = (isSet: boolean) => {
    window.localStorage.setItem("pm_showCardLabels", isSet.toString());
    setShowCardLabels(!showCardLabels);
  };

  const toggleSceneAspectRatio = (ratio: SCENE_RATIO) => {
    window.localStorage.setItem("pm_sceneRatio", ratio.toString());
    setSceneAspectRatio(ratio);
  };

  const toggleActorAspectRatio = (ratio: ACTOR_RATIO) => {
    window.localStorage.setItem("pm_actorRatio", ratio.toString());
    setActorAspectRatio(ratio);
  };

  return (
    <SettingsContext.Provider
      value={{
        showCardLabels,
        sceneAspectRatio,
        setSceneAspectRatio: toggleSceneAspectRatio,
        actorAspectRatio,
        setActorAspectRatio: toggleActorAspectRatio,
        setShowCardLabels: toggleShowCardLabels,
      }}
    >
      {props.children}
    </SettingsContext.Provider>
  );
}
