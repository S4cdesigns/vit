import FullscreenIcon from "mdi-react/FullscreenIcon";
import PauseIcon from "mdi-react/PauseIcon";
import PlayIcon from "mdi-react/PlayIcon";
import VolumeHighIcon from "mdi-react/VolumeHighIcon";
import { useContext, useEffect, useRef, useState } from "react";
import { useMedia } from "react-chromecast";

import { useSafeMode } from "../../composables/use_safe_mode";
import { PlaybackTarget, VideoContext } from "../../pages/VideoContextProvider";
import { formatDuration } from "../../util/string";
import Loader from "../Loader";
import Marker from "../Marker";
import Spacer from "../Spacer";
import styles from "./VideoPlayer.module.scss";

type Props = {
  src: string;
  poster?: string;
  markers: { name: string; time: number; thumbnail: string }[];
  duration: number;
  startAtPosition?: number;
};

export default function VideoPlayer({ src, poster, markers, duration, startAtPosition }: Props) {
  const { blur: safeModeBlur } = useSafeMode();

  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [hover, setHover] = useState(false);
  const [paused, setPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [bufferRanges, setBufferRanges] = useState<{ start: number; end: number }[]>([]);
  const { currentTime, setCurrentTime, currentTarget } = useContext(VideoContext);
  const media = useMedia();
  const videoEl = useRef<HTMLVideoElement | null>(null);

  async function togglePlayback() {
    if (currentTarget === PlaybackTarget.CHROMECAST) {
      if (media) {
        await media.playMedia(src);
      }
      return;
    }

    if (!videoEl.current) {
      return;
    }
    if (videoEl.current.paused) {
      videoEl.current.play().catch(() => {});
    } else {
      videoEl.current.pause();
    }
  }

  useEffect(() => {
    if (videoEl.current && startAtPosition) {
      videoEl.current.currentTime = startAtPosition;
      videoEl.current.play().catch((error) => {
        console.error(error);
      });
    }
  }, []);

  // Loading chunks
  useEffect(() => {
    const handler = () => {
      if (!videoEl.current) {
        return;
      }

      const vid = videoEl.current;
      const total = vid.duration;
      setBufferRanges(
        [...new Array(vid.buffered.length)].map((_, i) => ({
          start: vid.buffered.start(i) / total,
          end: vid.buffered.end(i) / total,
        }))
      );
    };
    videoEl.current?.addEventListener("progress", handler, false);
    return () => videoEl.current?.removeEventListener("progress", handler);
  }, []);

  // Play/pause
  useEffect(() => {
    const handler = () => {
      if (!videoEl.current) {
        return;
      }
      setPaused(videoEl.current.paused);
    };
    videoEl.current?.addEventListener("play", handler, false);
    videoEl.current?.addEventListener("pause", handler, false);
    return () => {
      videoEl.current?.removeEventListener("play", handler);
      videoEl.current?.removeEventListener("pause", handler);
    };
  }, []);

  // Waiting (load)
  useEffect(() => {
    const handler = () => {
      setLoading(true);
    };
    videoEl.current?.addEventListener("waiting", handler, false);
    return () => videoEl.current?.removeEventListener("waiting", handler);
  }, []);

  // Time update
  useEffect(() => {
    const handler = () => {
      const vid = videoEl.current!;

      // this happens when playing a video then navigating away.
      // TODO: reset state?
      if (!vid) {
        return;
      }

      const buffered = vid.currentTime;
      const duration = vid.duration;
      setCurrentTime(vid.currentTime);
      setProgress(buffered / duration);
      setLoading(false);
    };
    videoEl.current?.addEventListener("timeupdate", handler, false);
    return () => videoEl.current?.removeEventListener("timeupdate", handler);
  }, []);

  // Full screen
  useEffect(() => {
    const handler = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler, false);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const PlaybackButton = paused ? PlayIcon : PauseIcon;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#05050a",
      }}
    >
      <div style={{ maxWidth: 1000, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading && !paused && <Loader />}
        </div>
        <video
          id="video-player"
          controls={fullscreen}
          ref={videoEl}
          poster={poster}
          src={src}
          width="100%"
          height="100%"
          style={{ filter: safeModeBlur }}
        />
        <div
          className={styles.controls}
          style={{
            opacity: +hover,
            background: "#000000ee",
            position: "absolute",
            bottom: 0,
            width: "100%",
          }}
        >
          <div
            onClick={(ev) => {
              const clickTarget = ev.target as HTMLDivElement;
              const clickTargetWidth = clickTarget.clientWidth;
              const xCoordInClickTarget = ev.nativeEvent.offsetX;
              const percent = xCoordInClickTarget / clickTargetWidth;
              const vid = videoEl.current!;
              vid.currentTime = vid.duration * percent;
            }}
            className={styles.seekbar}
          >
            {bufferRanges.map(({ start, end }) => (
              <div
                suppressHydrationWarning
                key={start}
                style={{
                  position: "absolute",
                  background: "#777777",
                  left: `calc(100% * ${start})`,
                  width: `calc(100% * ${end - start})`,
                  height: "100%",
                  pointerEvents: "none",
                }}
              ></div>
            ))}
            <div
              className={styles.inner}
              style={{ pointerEvents: "none", width: `calc(100% * ${progress})` }}
            ></div>
          </div>

          {markers.map((marker) => (
            <Marker
              onClick={() => {
                const vid = videoEl.current!;
                vid.currentTime = vid.duration * marker.time;
              }}
              key={marker.time}
              {...marker}
            />
          ))}

          <div className={styles.buttons}>
            <PlaybackButton size={28} onClick={togglePlayback} style={{ cursor: "pointer" }} />
            <VolumeHighIcon size={28} />
            <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.8 }}>
              {formatDuration(duration * progress)} / {formatDuration(duration)}
            </span>
            <Spacer />
            <FullscreenIcon
              onClick={() => {
                videoEl.current?.requestFullscreen().catch(() => {});
              }}
              style={{ cursor: "pointer" }}
              size={28}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
