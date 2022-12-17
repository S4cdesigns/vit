import { IMarker } from "../../types/marker";
import MarkerCard from "../MarkerCard";

type Props = {
  markers: IMarker[];
  onClick: (marker: IMarker) => void;
  onDelete: () => void;
  onEdit?: () => void;
  onBookmark: (marker: IMarker, value: Date | null) => void;
  onRate: (marker: IMarker, rating: number) => void;
  onFav: (marker: IMarker, value: boolean) => void;
};

MarkerList.defaultProps = {
  onClick: undefined,
  onDelete: undefined,
  onFav: undefined,
  onRate: undefined,
  onBookmark: undefined,
};

export default function MarkerList({
  markers,
  onClick,
  onBookmark,
  onRate,
  onFav,
  onDelete,
  onEdit,
}: Props) {
  return (
    <>
      {markers.map((marker) => (
        <MarkerCard
          marker={marker}
          onClick={onClick ? () => onClick(marker) : undefined}
          onDelete={onDelete}
          onEdit={onEdit}
          onBookmark={onBookmark ? (value) => onBookmark(marker, value) : undefined}
          onRate={onRate ? (value) => onRate(marker, value) : undefined}
          onFav={onFav ? (value) => onFav(marker, value) : undefined}
        />
      ))}
    </>
  );
}
