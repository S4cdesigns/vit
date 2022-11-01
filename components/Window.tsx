import { ReactNode } from "react";
import Card from "./Card";
import CardTitle from "./CardTitle";

import CloseIcon from "mdi-react/CloseIcon";

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
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0,
            }}
          >
            <Card style={{ padding: 20, minWidth: 400, maxWidth: "95vw" }}>
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
