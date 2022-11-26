import { createContext, useState } from "react";

import { PlaybackTarget, VideoContext } from "../composables/use_video_control";
import { IScene } from "../types/scene";

type Props = {
  children: any;
};

export default function VideoContextProvider(props: Props) {
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [newPlaybackTime, setNewPlaybackTime] = useState(0);
  const [paused, setPaused] = useState(true);
  const [scene, setScene] = useState<IScene>();
  const [playerTarget, setPlayerTarget] = useState(PlaybackTarget.BROWSER);

  const togglePlayback = () => {
    setPaused(!paused);
  };

  const startPlayback = (time?: number) => {
    if (time) {
      setNewPlaybackTime(time);
    }

    if (paused) {
      setPaused(false);
    }
  };

  return (
    <VideoContext.Provider
      value={{
        togglePlayback,
        startPlayback,
        scene,
        setScene,
        newPlaybackTime,
        currentTime: currentPlaybackTime,
        currentTarget: playerTarget,
        paused,
        setCurrentTime: setCurrentPlaybackTime,
        setPaused,
        setTarget: setPlayerTarget,
      }}
    >
      {props.children}
    </VideoContext.Provider>
  );
}
