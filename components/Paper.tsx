import clsx from "clsx";
import { CSSProperties, MouseEvent, ReactNode, useContext } from "react";

import styles from "./Paper.module.scss";

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export default function Paper({ onClick, children, style, className }: Props): JSX.Element {
  return (
    <div
      onClick={(event) => onClick?.(event)}
      className={clsx(className, styles.paper)}
      style={style}
    >
      {children}
    </div>
  );
}
