import { useEffect, useState } from "react";
type Props = {};

// TODO
// https://github.com/tecladistaprod/react-chromecast#readme
export default function ChromeCastIcon(props: Props) {
  const [castEnabled, setCastEnabled] = useState(false);

  useEffect(() => {
    const initializeCastApi = function () {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });
    };

    window.__onGCastApiAvailable = function (isAvailable: boolean) {
      if (isAvailable) {
        initializeCastApi();
        setCastEnabled(true);

        const context = cast.framework.CastContext.getInstance();
        context.addEventListener(
          cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          function (event) {
            switch (event.sessionState) {
              case cast.framework.SessionState.SESSION_STARTED:
                console.log("session started");

                /*
                var castSession = cast.framework.CastContext.getInstance().getCurrentSession();


                var mediaInfo = new chrome.cast.media.MediaInfo(
                  "http://192.168.1.132:4001/api/media/scene/sc_la65utqeqgnOm665?type=direct&password=null",
                  "video/mp4"
                );
                var request = new chrome.cast.media.LoadRequest(mediaInfo);
                castSession.loadMedia(request).then(
                  function () {
                    console.log("Load succeed");
                  },
                  function (errorCode) {
                    console.log(`Error code: ${errorCode}`);
                  }
                );
                */

                break;
              case cast.framework.SessionState.SESSION_RESUMED:
                var player = new cast.framework.RemotePlayer();
                var playerController = new cast.framework.RemotePlayerController(player);
                playerController.stop();

                break;
              case cast.framework.SessionState.SESSION_ENDED:
                console.log("CastContext: CastSession disconnected");
                // Update locally as necessary
                break;
            }
          }
        );
      }
    };

    const url = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (castEnabled) {
    return (
      <div style={{ width: 30, paddingTop: 6 }} className="hover">
        <google-cast-launcher></google-cast-launcher>
      </div>
    );
  }

  return null;
}
