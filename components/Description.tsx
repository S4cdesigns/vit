import { CSSProperties, ReactNode } from "react";

import Text from "./Text";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
};

export default function Description({ children, style }: Props) {
  return (
    <Text
      style={{
        wordWrap: "break-word",
        textAlign: "justify",
        lineHeight: "150%",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </Text>
  );
}
