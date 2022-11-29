import PauseIcon from "mdi-react/PauseIcon";
import PlayIcon from "mdi-react/PlayIcon";

import { useVideoControls } from "../../composables/use_video_control";
import { IScene } from "../../types/scene";

type Props = {
  scene: IScene;
};

export default function PlayPauseToggleButton({ scene }: Props) {
  const { paused, togglePlayback, scene: loadedScene } = useVideoControls();

  let PlaybackButton = PauseIcon;

  if (paused) {
    PlaybackButton = PlayIcon;
  }

  return <PlaybackButton size={28} onClick={togglePlayback} style={{ cursor: "pointer" }} />;
}
