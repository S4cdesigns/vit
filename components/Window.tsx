import CloseIcon from "mdi-react/CloseIcon";
import { ReactNode } from "react";

import AutoLayout from "./AutoLayout";
import Card from "./Card";
import CardTitle from "./CardTitle";
import Spacer from "./Spacer";

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
            onClick={onClose}
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
              top: "50%",
              transform: "translate(-50%,-50%)",
              minWidth: 350,
              maxWidth: "calc(100vw - 10px)",
            }}
          >
            <Card style={{ padding: 20 }}>
              <AutoLayout layout="h">
                <CardTitle>{title}</CardTitle>
                <Spacer />
                <CloseIcon className="hover" onClick={onClose} />
              </AutoLayout>
              <AutoLayout>{children}</AutoLayout>
              {actions && (
                <AutoLayout layout="h" gap={5}>
                  <Spacer />
                  {actions}
                </AutoLayout>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
