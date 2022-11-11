import { CSSProperties, ReactNode } from "react";

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  gap?: number;
};

export default function AutoLayout({ children, style, className, gap }: Props) {
  return (
    <div
      style={{ display: "flex", gap: gap ?? 20, flexDirection: "column", ...style }}
      className={className}
    >
      {children}
    </div>
  );
}
