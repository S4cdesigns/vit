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
    } else {
      alert('no castREceiver')
    }
  }, [castReceiver, handleConnection]);

  useEffect(() => {
    if (isConnect) {
      alert("is connect");
      setTarget(PlaybackTarget.CHROMECAST);
    } else {
      setTarget(PlaybackTarget.BROWSER);
    }
  }, [isConnect]);

  // we should probably continously check if there is a receiver, the useCast
  // hook does not seem to trigger a rerender if this changes.
  if (!castReceiver) {
    return null;
  }

  return (
    <CastIcon
      className="hover"
      onClick={handleClick}
      style={{ color: isConnect ? "red" : undefined }}
    />
  );
}
