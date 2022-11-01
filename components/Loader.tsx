import { CSSProperties } from "react";

import styles from "./Loader.module.scss";

type Props = {
  style?: CSSProperties;
};

export default function Loader({ style }: Props) {
  return (
    <div style={style}>
      <div className={styles.loader}></div>
    </div>
  );
}
