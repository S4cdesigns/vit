import { createContext, useContext } from "react";

// scene cards:
// aspect: pm_sceneRatio
// - Square
// - 16:9
// - 4:3

// actor cards
// - square - pm_actorRatio
// - 9:16
// - 3:4
// - fill actor thumbnails pm_fillActorCards

export type SCENE_RATIO = "1:1" | "16:9" | "4:3";
export type ACTOR_RATIO = "1:1" | "9:16" | "3:4";

export const SettingsContext = createContext<{
  showCardLabels: boolean;
  sceneAspectRatio: SCENE_RATIO;
  actorAspectRatio: ACTOR_RATIO;
  setShowCardLabels: (isSet: boolean) => void;
  setSceneAspectRatio: (ratio: SCENE_RATIO) => void;
  setActorAspectRatio: (ratio: ACTOR_RATIO) => void;
}>({
  showCardLabels: true,
  sceneAspectRatio: "4:3",
  actorAspectRatio: "3:4",
  setShowCardLabels: (isSet: boolean) => {},
  setSceneAspectRatio: (ratio: SCENE_RATIO) => {},
  setActorAspectRatio: (ratio: ACTOR_RATIO) => {},
});

type AspectRatio = {
  value: string;
  cssValue: string;
  numericValue: number;
};

const toActorImageRatio = (ratio: ACTOR_RATIO): AspectRatio => {
  switch (ratio) {
    case "9:16":
      return { value: ratio, cssValue: "9 / 16", numericValue: 9 / 16 };
    case "3:4":
      return { value: ratio, cssValue: "3 / 4", numericValue: 3 / 4 };
    default:
      return { value: ratio, cssValue: "1 / 1", numericValue: 1 };
  }
};

const toSceneImageRatio = (ratio: SCENE_RATIO): AspectRatio => {
  switch (ratio) {
    case "16:9":
      return { value: ratio, cssValue: "16 / 9", numericValue: 16 / 9 };
    case "4:3":
      return { value: ratio, cssValue: "4 / 3", numericValue: 4 / 3 };
    default:
      return { value: ratio, cssValue: "1 / 1", numericValue: 1 };
  }
};

export function useSettings() {
  const ctx = useContext(SettingsContext);

  return {
    ...ctx,
    actorImageAspect: toActorImageRatio(ctx.actorAspectRatio),
    sceneImageAspect: toSceneImageRatio(ctx.sceneAspectRatio),
  };
}
