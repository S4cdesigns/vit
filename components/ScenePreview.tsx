import { useSafeMode } from "../composables/use_safe_mode";

const SINGLE_PREVIEW_SPRITE_WIDTH = 160;

type Props = {
  show: boolean;
  absolutePosition?: number;
  percentagePosition?: number;
  thumbnail: string;
};

export default function ScenePreview({
  // x coordinates on the seekbar
  absolutePosition,
  thumbnail,
  show,
  // percentage value on the seekbar (0 - 1)
  percentagePosition,
}: Props) {
  const { blur: safeModeBlur } = useSafeMode();

  if (!absolutePosition || !show) {
    return null;
  }

  // total number of pixels of the scenePreview image: 16000px
  let imageOffset = Math.floor((percentagePosition || 0) * 100) * SINGLE_PREVIEW_SPRITE_WIDTH;
  imageOffset += SINGLE_PREVIEW_SPRITE_WIDTH;
  const positionProperty = `calc(100% - ${imageOffset}px)`;

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
    ></div>
  );
}
