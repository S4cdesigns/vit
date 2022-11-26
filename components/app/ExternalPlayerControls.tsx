import { PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER } from "next/dist/server/api-utils";
import { useCallback, useContext, useEffect, useState } from "react";

import { PlaybackTarget, VideoContext } from "../../pages/VideoContextProvider";

type Props = {};
export default function ExternalPlayerControls(props: Props) {
  const { currentTarget, setTarget } = useContext(VideoContext);
  return (
    <div
      style={{
        display: currentTarget === PlaybackTarget.BROWSER ? "none" : "block",
        position: "fixed",
        left: 0,
        bottom: 0,
        right: 0,
        height: 50,
        backgroundColor: "green",
      }}
    >
      External {currentTarget}
    </div>
  );
}
