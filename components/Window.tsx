import CloseIcon from "mdi-react/CloseIcon";
import { ReactNode } from "react";

import Card from "./Card";
import CardTitle from "./CardTitle";

type Props = {
  children: ReactNode;
  isOpen: boolean;
  title: string;
  onClose?: () => void;
  actions?: ReactNode;
};

export default function Window({ children, isOpen, title, onClose, actions }: Props) {
  return (
    <>
      {isOpen && (
        <div
          style={{
            zIndex: 999,
            position: "fixed",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
          }}
        >
          <div
            style={{
              backdropFilter: "blur(2px)",
              background: "#000000cc",
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "33%",
              transform: "translate(-50%,-50%)",
              minWidth: 400,
              maxWidth: "95vw",
            }}
          >
            <Card style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <CardTitle>{title}</CardTitle>
                <div style={{ flexGrow: 1 }}></div>
                <CloseIcon className="hover" onClick={onClose} />
              </div>
              <div style={{ padding: 5, display: "flex", gap: 15, flexDirection: "column" }}>
                {children}
              </div>
              {actions && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>{actions}</div>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
