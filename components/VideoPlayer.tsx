import FullscreenIcon from "mdi-react/FullscreenIcon";
import PauseIcon from "mdi-react/PauseIcon";
import PlayIcon from "mdi-react/PlayIcon";
import VolumeHighIcon from "mdi-react/VolumeHighIcon";
import { useEffect, useRef, useState } from "react";

import { formatDuration } from "../util/string";
import Loader from "./Loader";
import Marker from "./Marker";
import styles from "./VideoPlayer.module.scss";

type Props = {
  src: string;
  poster?: string;
  markers: { name: string; time: number; thumbnail: string }[];
  duration: number;
};

export default function VideoPlayer({ src, poster, markers, duration }: Props) {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [hover, setHover] = useState(false);
  const [paused, setPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [bufferRanges, setBufferRanges] = useState<{ start: number; end: number }[]>([]);
  const videoEl = useRef<HTMLVideoElement | null>(null);

  function togglePlayback() {
    if (!videoEl.current) {
      return;
    }
    if (videoEl.current.paused) {
      videoEl.current.play().catch(() => {});
    } else {
      videoEl.current.pause();
    }
  }

  // Loading chunks
  useEffect(() => {
    const handler = () => {
      const vid = videoEl.current!;
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
      setPaused(videoEl.current!.paused);
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
      const buffered = vid.currentTime;
      const duration = vid.duration;
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
          controls={fullscreen}
          ref={videoEl}
          poster={poster}
          src={src}
          width="100%"
          height="100%"
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
            <div style={{ flexGrow: 1 }} />
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
