import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function DescriptionField({ children }: Props) {
  return (
    <div
      style={{
        opacity: 0.5,
        margin: 0,
        wordWrap: "break-word",
        textAlign: "justify",
        lineHeight: "150%",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
