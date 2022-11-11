import Link from "next/link";
import { CSSProperties, ReactNode, useContext, useMemo } from "react";

import { ThemeContext } from "../pages/_app";
import { generateThumbnailPlaceholderColor } from "../util/color";

type Props = {
  src?: string | null;
  aspectRatio: string;
  href?: string | null;
  children?: ReactNode;
  objectFit?: "cover" | "contain";
  imgStyle?: CSSProperties;
  containerStyle?: CSSProperties;
  placeholder?: ReactNode;
};

export default function ResponsiveImage({
  href,
  src,
  aspectRatio,
  children,
  objectFit,
  imgStyle,
  containerStyle,
  placeholder,
}: Props) {
  const { theme } = useContext(ThemeContext);
  const color = useMemo(() => generateThumbnailPlaceholderColor(theme === "dark"), [theme]);

  const inner = src ? (
    <img
      style={{ objectFit: objectFit || "cover", aspectRatio, ...imgStyle }}
      width="100%"
      src={src}
    />
  ) : (
    <div style={{ aspectRatio, border: "2px solid #a0a0a020" }}>
      <span
        style={{
          fontSize: 64,
          opacity: 0.1,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          position: "absolute",
        }}
      >
        {placeholder || <>?</>}
      </span>
    </div>
  );

  const linkContainer = href ? (
    <Link href={href} passHref>
      <a style={{ display: src ? "flex" : "block", overflow: "hidden" }}>{inner}</a>
    </Link>
  ) : (
    <div style={{ overflow: "hidden" }}>{inner}</div>
  );

  return (
    <div
      suppressHydrationWarning={true}
      style={{
        backgroundColor: src ? undefined : color,
        position: "relative",
        background: `repeating-linear-gradient(
        45deg,
        #a0a0a002,
        #a0a0a002 10px,
        #a0a0a004 10px,
        #a0a0a004 20px
      )`,
        ...containerStyle,
      }}
    >
      {linkContainer}
      {children}
    </div>
  );
}
