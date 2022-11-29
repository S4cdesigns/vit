import clsx from "clsx";
import { CSSProperties, MouseEvent, ReactNode, useContext } from "react";

import { ThemeContext } from "../pages/_app";
import styles from "./Paper.module.scss";

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export default function Paper({ onClick, children, style, className }: Props): JSX.Element {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      onClick={(event) => onClick?.(event)}
      className={clsx(className, styles.paper)}
      style={{
        background: theme === "dark" ? "#1C1C25" : "white",
        borderColor: theme === "dark" ? "#2e2e3b" : "#dadada",
        color: theme === "dark" ? "white" : "black",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
