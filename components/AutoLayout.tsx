import { CSSProperties, ReactNode } from "react";

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export default function AutoLayout({ children, style, className }: Props) {
  return (
    <div
      style={{ display: "flex", gap: 20, flexDirection: "column", ...style }}
      className={className}
    >
      {children}
    </div>
  );
}
