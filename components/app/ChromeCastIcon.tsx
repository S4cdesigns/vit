import CastIcon from "mdi-react/CastIcon";
import { useCallback, useContext, useEffect, useState } from "react";
import { useCast } from "react-chromecast";

import { PlaybackTarget, VideoContext } from "../../pages/VideoContextProvider";
type Props = {};

export default function ChromeCastIcon(props: Props) {
  const { currentTarget, setTarget } = useContext(VideoContext);

  const { castReceiver, handleConnection, isConnect } = useCast({
    initialize_media_player: "DEFAULT_MEDIA_RECEIVER_APP_ID",
    auto_initialize: true,
  });

  const handleClick = useCallback(async () => {
    if (castReceiver) {
      await handleConnection();
      setTarget(PlaybackTarget.CHROMECAST);
    }
  }, [castReceiver, handleConnection]);

  useEffect(() => {
    if (isConnect) {
      setTarget(PlaybackTarget.CHROMECAST);
    } else {
      setTarget(PlaybackTarget.CHROMECAST);
    }
  }, [isConnect]);

  return (
    <CastIcon
      className="hover"
      onClick={handleClick}
      style={{ color: isConnect ? "red" : undefined }}
    />
  );
}
