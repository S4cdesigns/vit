import CastIcon from "mdi-react/CastIcon";
import { useCallback, useContext, useEffect, useState } from "react";
import { useCast } from "react-chromecast";

import { PlaybackTarget, VideoContext } from "../../pages/VideoContextProvider";
type Props = {};

export default function ChromeCastIcon(props: Props) {
  const { currentTarget, setTarget } = useContext(VideoContext);

  const cast = useCast({
    initialize_media_player: "DEFAULT_MEDIA_RECEIVER_APP_ID",
    auto_initialize: true,
  });
  const handleClick = useCallback(async () => {
    if (cast.castReceiver) {
      await cast.handleConnection();
      setTarget(PlaybackTarget.CHROMECAST);
    }
  }, [cast.castReceiver, cast.handleConnection]);
  return <CastIcon className="hover" onClick={handleClick} />;
}
