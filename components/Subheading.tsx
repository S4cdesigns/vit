import { ReactNode } from "react";

import styles from "./Subheading.module.scss";

type Props = {
  children: ReactNode;
};

export default function Subheading({ children }: Props) {
  return <div className={styles.subheading}>{children}</div>;
}
