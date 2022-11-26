import { useContext } from "react";
import { useSafeMode } from "../../composables/use_safe_mode";

type Props = {
  imageId?: string;
};

export default function HeroImage({ imageId }: Props) {
  const { blur: safeModeBlur } = useSafeMode();

  return (
    <>
      {imageId && (
        <div style={{ position: "relative", filter: safeModeBlur }}>
          <img
            width="100%"
            style={{ aspectRatio: String(2.75) }}
            src={`/api/media/image/${imageId}?password=null`}
          />
        </div>
      )}
    </>
  );
}
