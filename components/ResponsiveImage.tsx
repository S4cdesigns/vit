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
};

export default function ResponsiveImage({
  href,
  src,
  aspectRatio,
  children,
  objectFit,
  imgStyle,
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
    <div style={{ aspectRatio }}>
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
        ?
      </span>
    </div>
  );

  const linkContainer = href ? (
    <Link href={href} passHref>
      <a style={{ display: src ? "flex" : "block" }}>{inner}</a>
    </Link>
  ) : (
    <div>{inner}</div>
  );

  return (
    <div
      suppressHydrationWarning={true}
      style={{ backgroundColor: src ? undefined : color, position: "relative" }}
    >
      {linkContainer}
      {children}
    </div>
  );
}
