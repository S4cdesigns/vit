import { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
};

export default function Text({ children, style }: Props) {
  return <div style={{ opacity: 0.5, fontSize: 16, ...style }}>{children}</div>;
}
