import Star from "@mui/icons-material/Star";
import StarHalf from "@mui/icons-material/StarHalf";
import StarOutline from "@mui/icons-material/StarBorder";

type RatingProps = {
  value: number;
  readonly: boolean;
};

export default function Rating({ value, readonly }: RatingProps) {
  const fav = value === 10;

  function renderStar(index: number) {
    if (index * 2 <= (value || 0)) {
      return <Star key={index} style={{ color: fav ? "#ff3355" : "#4488ff" }} />;
    }
    if (value && value % 2 == 1 && index * 2 == value + 1) {
      return <StarHalf key={index} style={{ color: "#4488ff" }} />;
    }
    return <StarOutline key={index} opacity={0.5} />;
  }

  return <div style={{ display: "inline-flex" }}>{[1, 2, 3, 4, 5].map((x) => renderStar(x))}</div>;
}