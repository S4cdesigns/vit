import clsx from "clsx";
import { CSSProperties, ReactNode } from "react";

import AutoLayout from "./AutoLayout";
import styles from "./Card.module.scss";
import Paper from "./Paper";

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export default function Card({ children, className, style }: Props) {
  return (
    <Paper className={clsx(className, styles.card)} style={{ ...style }}>
      <AutoLayout>{children}</AutoLayout>
    </Paper>
  );
}
