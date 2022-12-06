import FullscreenIcon from "mdi-react/FullscreenIcon";
import VolumeHighIcon from "mdi-react/VolumeHighIcon";
import { useEffect, useRef, useState } from "react";

import { useSafeMode } from "../../composables/use_safe_mode";
import { useVideoControls } from "../../composables/use_video_control";
import { IScene } from "../../types/scene";
import { formatDuration } from "../../util/string";
import Loader from "../Loader";
import Marker from "../Marker";
import PlayPauseToggleButton from "../player/PlayPauseToggleButton";
import Spacer from "../Spacer";
import styles from "./VideoPlayer.module.scss";

type Props = {
  src: string;
  poster?: string;
  markers: { name: string; time: number; thumbnail: string }[];
  duration: number;
  startAtPosition?: number;
  scene: IScene;
};

export default function VideoPlayer({
  src,
  poster,
  markers,
  duration,
  startAtPosition,
  scene,
}: Props) {
  const { blur: safeModeBlur } = useSafeMode();

  const didMountRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [hover, setHover] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bufferRanges, setBufferRanges] = useState<{ start: number; end: number }[]>([]);
  const {
    setCurrentTime,
    currentTime,
    paused,
    startPlayback,
    newPlaybackTime,
    setScene,
    setPaused,
    reset,
    togglePlayback,
  } = useVideoControls();
  const videoEl = useRef<HTMLVideoElement | null>(null);

  // play/pause handling from VideoContext
  useEffect(() => {
    // avoid autoplay
    if (!didMountRef.current) {
      didMountRef.current = true;
      // unless we want to immediately start at a specific position (markers)
      if (!startAtPosition) {
        return;
      }
    }

    if (!videoEl.current) {
      return;
    }

    if (paused) {
      videoEl.current.pause();
    } else {
      videoEl.current
        .play()
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setScene(scene);
        });
    }
  }, [paused]);

  // reset player state on unmount
  useEffect(() => {
    return reset;
  }, []);

  // handle starting the playback at a specific position
  useEffect(() => {
    if (videoEl.current && startAtPosition) {
      startPlayback(startAtPosition);
    }
  }, []);

  // handle triggers for skipping the current playhead
  useEffect(() => {
    if (typeof newPlaybackTime === "undefined" || isNaN(newPlaybackTime)) {
      return;
    }

    const vid = videoEl.current!;
    vid.currentTime = newPlaybackTime;
  }, [newPlaybackTime]);

  // Play/pause handling from video element to update the context
  useEffect(() => {
    const handler = (event: any) => {
      setPaused(event.type !== "play");
    };
    videoEl.current?.addEventListener("play", handler, false);
    videoEl.current?.addEventListener("pause", handler, false);
    return () => {
      videoEl.current?.removeEventListener("play", handler);
      videoEl.current?.removeEventListener("pause", handler);
    };
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

  return (
    <div
      onMouseMove={() => setHover(true)}
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
          onClick={togglePlayback}
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
              startPlayback(vid.duration * percent);
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
            <PlayPauseToggleButton scene={scene} />
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
