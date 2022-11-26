import { useState } from "react";

import { useSafeMode } from "../composables/use_safe_mode";
import styles from "./Marker.module.scss";

type Props = {
  time: number;
  name: string;
  thumbnail: string;
  onClick?: () => void;
};

export default function Marker({ time, name, thumbnail, onClick }: Props) {
  const [hover, setHover] = useState(false);
  const { blur: safeModeBlur } = useSafeMode();

  return (
    <div
      suppressHydrationWarning
      onClick={(ev) => {
        ev.stopPropagation();
        onClick?.();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={styles.marker}
      style={{
        left: `calc(100% * ${time} - 2px)`,
      }}
    >
      {hover && (
        <div
          style={{
            overflow: "hidden",
            borderRadius: 4,
            background: "#000000aa",
            textAlign: "center",
            bottom: 25,
            position: "absolute",
            width: 160,
            left: -80,
          }}
        >
          <img style={{ width: 160, filter: safeModeBlur }} src={thumbnail} />
          <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.8, marginBottom: 4 }}>{name}</div>
        </div>
      )}
    </div>
  );
}
