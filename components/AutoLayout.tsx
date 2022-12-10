import { CSSProperties, ReactNode } from "react";

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  gap?: number;
  layout?: "h" | "v";
  wrap?: boolean;
};

export default function AutoLayout({ children, style, className, gap, layout, wrap }: Props) {
  const dir = (layout ?? "v") === "v" ? "column" : "row";
  return (
    <div
      style={{
        display: "flex",
        gap: gap ?? 20,
        flexDirection: dir,
        alignItems: dir === "row" ? "center" : undefined,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}
