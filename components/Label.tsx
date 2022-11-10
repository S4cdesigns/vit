import Color from "color";
import { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
  color?: string;
  onClick?: () => void;
};

export default function Label({ className, children, color, onClick }: Props) {
  return (
    <div
      className={className}
      style={{
        fontSize: 11,
        padding: "3px 8px 3px 8px",
        borderRadius: 4,
        display: "inline-block",
        marginRight: 4,
        marginBottom: 4,
        background: color || "#000000dd",
        borderColor: "#80808050",
        borderWidth: 1,
        borderStyle: "solid",
        color: new Color(color).isLight() ? "black" : "white",
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
