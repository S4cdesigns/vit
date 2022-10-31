import clsx from "clsx";
import StarOutline from "mdi-react/StarBorderIcon";
import StarHalf from "mdi-react/StarHalfFullIcon";
import Star from "mdi-react/StarIcon";

import styles from "./Rating.module.scss";

type RatingProps = {
  value: number;
  readonly?: boolean;
  onChange?: (x: number) => void;
};

const FAV_COLOR = "#ff3355";
const STAR_COLOR = "#4488ff";

export default function Rating({ value, readonly, onChange }: RatingProps) {
  const fav = value === 10;
  const _readonly = readonly ?? false;
  const className = clsx(styles.star, {
    [styles.disabled]: _readonly,
  });

  function onClick(ev: React.MouseEvent<any>, index: number) {
    if (_readonly) {
      return;
    }

    const clickTarget = ev.target as HTMLElement;
    const clickTargetWidth = clickTarget.getBoundingClientRect().width;
    const xCoordInClickTarget = ev.nativeEvent.offsetX;

    let computedValue;
    if (clickTargetWidth / 2 > xCoordInClickTarget) {
      // clicked left
      computedValue = index * 2 - 1;
    } else {
      // clicked right
      computedValue = index * 2;
    }

    if (value === computedValue) {
      onChange?.(0);
    } else {
      onChange?.(computedValue);
    }
  }

  function renderStar(index: number) {
    if (index * 2 <= (value || 0)) {
      return (
        <Star
          className={className}
          onClick={(ev) => onClick(ev, index)}
          key={index}
          style={{
            color: fav ? FAV_COLOR : STAR_COLOR,
          }}
        />
      );
    }
    if (value && value % 2 === 1 && index * 2 === value + 1) {
      return (
        <StarHalf
          className={className}
          onClick={(ev) => onClick(ev, index)}
          key={index}
          style={{
            color: STAR_COLOR,
          }}
        />
      );
    }
    return (
      <StarOutline
        className={className}
        onClick={(ev) => onClick(ev, index)}
        key={index}
        opacity={0.5}
      />
    );
  }

  return <div className={styles.wrapper}>{[1, 2, 3, 4, 5].map(renderStar)}</div>;
}
