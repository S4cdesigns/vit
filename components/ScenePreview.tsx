import { useMemo } from "react";

import { useSafeMode } from "../composables/use_safe_mode";
import { formatDuration } from "../util/string";

const SINGLE_PREVIEW_SPRITE_WIDTH = 160;

type Props = {
  show: boolean;
  absolutePosition?: number;
  percentagePosition?: number;
  thumbnail: string;
  duration: number;
};

export default function ScenePreview({
  // x coordinates on the seekbar
  absolutePosition,
  thumbnail,
  show,
  // percentage value on the seekbar (0 - 1)
  percentagePosition,
  duration,
}: Props) {
  const { blur: safeModeBlur } = useSafeMode();

  if (!absolutePosition || !show) {
    return null;
  }

  // total number of pixels of the scenePreview image: 16000px
  let imageOffset = useMemo(
    () => Math.floor((percentagePosition || 0) * 100) * SINGLE_PREVIEW_SPRITE_WIDTH,
    [duration, percentagePosition]
  );
  imageOffset += SINGLE_PREVIEW_SPRITE_WIDTH;
  const positionProperty = `calc(100% - ${imageOffset}px)`;

  const currentPosition = useMemo(
    () => Math.floor((percentagePosition || 0) * duration),
    [duration, percentagePosition]
  );

  return (
    <div
      style={{
        filter: safeModeBlur,
        position: "absolute",
        width: SINGLE_PREVIEW_SPRITE_WIDTH,
        height: 90,
        left: absolutePosition - SINGLE_PREVIEW_SPRITE_WIDTH / 2,
        bottom: 80,
        backgroundImage: `url(${thumbnail})`,
        backgroundPositionX: positionProperty,
      }}
    >
      <div
        style={{
          background: "#000000bb",
          borderRadius: 5,
          padding: 2,
          width: 80,
          height: 20,
          position: "absolute",
          bottom: -23,
          left: 50,
          textAlign: "center",
        }}
      >
        {formatDuration(currentPosition)}
      </div>
    </div>
  );
}
