import clsx from "clsx";
import { CSSProperties, ReactNode } from "react";

import styles from "./Button.module.scss";
import Loader from "./Loader";

type Props = {
  children?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
  loading?: boolean;
};

export default function Button({ children, onClick, style, className, loading }: Props) {
  return (
    <button
      onClick={() => {
        if (!loading) {
          onClick?.();
        }
      }}
      style={style || {}}
      className={clsx(styles.button, className, {
        hover: !loading,
      })}
    >
      <div
        style={{
          opacity: +!loading,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </div>
      {loading && (
        <Loader
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </button>
  );
}
