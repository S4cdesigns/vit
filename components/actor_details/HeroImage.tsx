import { useContext } from "react";

import { SafeModeContext } from "../../pages/_app";

type Props = {
  imageId?: string;
};

export default function HeroImage({ imageId }: Props) {
  const { enabled: safeMode } = useContext(SafeModeContext);
  return (
    <>
      {imageId && (
        <div style={{ position: "relative", filter: safeMode ? "blur(20px)" : undefined }}>
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
