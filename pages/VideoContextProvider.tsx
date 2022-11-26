import { createContext, useState } from "react";
import CastProvider from "react-chromecast";

type Props = {
  children: any;
};

export const PlaybackTarget = {
  BROWSER: "browser",
  CHROMECAST: "chromecast",
};

export const VideoContext = createContext<{
  currentTime: number;
  currentTarget: string;
  setCurrentTime: (time: number) => void;
  pause: (paused: boolean) => void;
  setTarget: (target: string) => void;
}>({
  currentTime: 0,
  currentTarget: PlaybackTarget.BROWSER,
  setCurrentTime: (time: number) => {},
  pause: (paused: boolean) => {},
  setTarget: (target: string) => {},
});

export default function VideoContextProvider(props: Props) {
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [paused, setPaused] = useState(true);
  const [playerTarget, setPlayerTarget] = useState(PlaybackTarget.BROWSER);

  return (
    <CastProvider>
      <VideoContext.Provider
        value={{
          currentTime: currentPlaybackTime,
          currentTarget: playerTarget,
          setCurrentTime: setCurrentPlaybackTime,
          pause: setPaused,
          setTarget: setPlayerTarget,
        }}
      >
        {props.children}
      </VideoContext.Provider>
    </CastProvider>
  );
}
