import { CSSProperties } from "react";

import styles from "./Loader.module.scss";

type Props = {
  style?: CSSProperties;
};

export default function Loader({ style }: Props) {
  return <div className={styles.loader} style={style}></div>;
}
