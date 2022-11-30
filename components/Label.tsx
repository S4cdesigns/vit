import Color from "color";
import { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
  color?: string;
  onClick?: () => void;
  onDelete?: () => void;
};

export default function Label({ className, children, color, onClick, onDelete }: Props) {
  const commonStyle = {
    fontSize: 11,
    display: "inline-block",
    marginBottom: 4,
    background: color || "#000000dd",
    borderColor: "#80808050",
    borderStyle: "solid",
    color: new Color(color).isLight() ? "black" : "white",
  };

  const textStyle = onDelete
    ? {
        borderRadius: "4px 0px 0px 4px",
        padding: "3px 0 3px 8px",
        marginRight: 0,
        borderWidth: "1px 0px 1px 1px",
      }
    : {
        borderRadius: 4,
        padding: "3px 8px 3px 8px",
        marginRight: 4,
        borderWidth: 1,
      };

  const deleteStyle = Object.assign({}, commonStyle, {
    borderRadius: "0 4px 4px 0",
    padding: "3px 5px 3px 6px",
    marginRight: 4,
    borderWidth: "1px 1px 1px 0px",
  });

  const labelStyle = Object.assign({}, commonStyle, textStyle);

  return (
    <div style={{ display: "inline-block" }}>
      <div className={className} style={labelStyle} onClick={onClick}>
        {children}
      </div>
      {onDelete && (
        <div className="hover" style={deleteStyle} onClick={onDelete}>
          X
        </div>
      )}
    </div>
  );
}
