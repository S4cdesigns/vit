import clsx from "clsx";
import { CSSProperties, ReactNode } from "react";

import styles from "./Paper.module.scss";

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
};

export default function Paper({ onClick, children, style, className }: Props): JSX.Element {
  return (
    <div onClick={() => onClick?.()} className={clsx(className, styles.paper)} style={style}>
      {children}
    </div>
  );
}
