import { ReactNode, useState } from "react";

import { PlaybackTarget, VideoContext } from "../composables/use_video_control";
import { IScene } from "../types/scene";

type Props = {
  children: ReactNode;
};

export default function VideoContextProvider(props: Props) {
  // currentPlaybackTime = position of the playhead, setting this does not affect the playback
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  // newPlaybackTime can be used to jump to a specific time in a stream, use this for seeking
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

  const reset = () => {
    setCurrentPlaybackTime(0);
    setNewPlaybackTime(0);
    setPaused(true);
  };

  return (
    <VideoContext.Provider
      value={{
        reset,
        togglePlayback,
        startPlayback,
        scene,
        setScene,
        newPlaybackTime,
        setNewPlaybackTime,
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
