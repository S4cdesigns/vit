import { CSSProperties, ReactNode } from "react";

import styles from "./CardTitle.module.scss";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
};

export default function CardTitle({ children, style }: Props) {
  return (
    <div className={styles.title} style={style}>
      {children}
    </div>
  );
}
