import { createContext, useContext } from "react";

import { IScene } from "../types/scene";

export const PlaybackTarget = {
  BROWSER: "browser",
  // https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API
  PICT_IN_PIC: "picture_in_picture",
  CHROMECAST: "chromecast",
};

export const VideoContext = createContext<{
  // the current position of the playback in the video
  currentTime: number;
  // the current target player playing back the video
  currentTarget: string;
  // if the video is paused or not currently
  paused: boolean;
  // if mutated, the player will skip to a new playback position
  newPlaybackTime?: number;
  // currently played back scene
  scene?: IScene;
  setCurrentTime: (time: number) => void;
  startPlayback: (time?: number) => void;
  togglePlayback: () => void;
  setPaused: (paused: boolean) => void;
  setTarget: (target: string) => void;
  setScene: (scene: IScene) => void;
  // reset the player state to paused, at time 0
  reset: () => void;
}>({
  currentTime: 0,
  currentTarget: PlaybackTarget.BROWSER,
  paused: false,
  setCurrentTime: (time: number) => {},
  startPlayback: (time?: number) => {},
  togglePlayback: () => {},
  setPaused: (paused: boolean) => {},
  setTarget: (target: string) => {},
  setScene: (scene: IScene) => {},
  reset: () => {},
});

export function useVideoControls() {
  const ctx = useContext(VideoContext);
  return {
    ...ctx,
  };
}
