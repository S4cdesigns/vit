import { ReactNode, useEffect, useState } from "react";

import {
  ACTOR_RATIO,
  ACTOR_TALL,
  SCENE_RATIO,
  SettingsContext,
  WIDE,
} from "../composables/use_settings";

type Props = {
  children: ReactNode;
};

export default function SettingsContextProvider(props: Props) {
  const [showCardLabels, setShowCardLabels] = useState(true);
  const [sceneAspectRatio, setSceneAspectRatio] = useState<SCENE_RATIO>(WIDE);
  const [actorAspectRatio, setActorAspectRatio] = useState<ACTOR_RATIO>(ACTOR_TALL);

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
    console.log('toggle', ratio);
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
