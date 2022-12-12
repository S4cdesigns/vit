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

export const SQUARE = "SQUARE";
export const WIDE = "16:9";
export const TALL = "4:3";

export const ACTOR_TALL = "9:16";
export const ACTOR_SMALL = "3:4";

export type SCENE_RATIO = "SQUARE" | "16:9" | "4:3";
export type ACTOR_RATIO = "SQUARE" | "9:16" | "3:4";

export const SettingsContext = createContext<{
  showCardLabels: boolean;
  sceneAspectRatio: SCENE_RATIO;
  actorAspectRatio: ACTOR_RATIO;
  setShowCardLabels: (isSet: boolean) => void;
  setSceneAspectRatio: (ratio: SCENE_RATIO) => void;
  setActorAspectRatio: (ratio: ACTOR_RATIO) => void;
}>({
  showCardLabels: true,
  sceneAspectRatio: WIDE,
  actorAspectRatio: ACTOR_TALL,
  setShowCardLabels: (isSet: boolean) => {},
  setSceneAspectRatio: (ratio: SCENE_RATIO) => {},
  setActorAspectRatio: (ratio: ACTOR_RATIO) => {},
});

type AspectRatio = {
  cssValue: string;
  numericValue: number;
};

const toActorImageRatio = (ratio: ACTOR_RATIO): AspectRatio => {
  switch (ratio) {
    case ACTOR_TALL:
      return { cssValue: "9 / 16", numericValue: 9 / 16 };
    case ACTOR_SMALL:
      return { cssValue: "3 / 4", numericValue: 3 / 4 };
    default:
      return { cssValue: "1 / 1", numericValue: 1 };
  }
};

const toSceneImageRatio = (ratio: SCENE_RATIO): AspectRatio => {
  switch (ratio) {
    case WIDE:
      return { cssValue: "16 / 9", numericValue: 16 / 9 };
    case TALL:
      return { cssValue: "4 / 3", numericValue: 4 / 3 };
    default:
      return { cssValue: "1 / 1", numericValue: 1 };
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
