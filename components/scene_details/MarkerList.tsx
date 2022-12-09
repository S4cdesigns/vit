import { IMarker } from "../../types/marker";
import MarkerCard from "../MarkerCard";

type Props = {
  markers: IMarker[];
  onClick?: (marker: IMarker) => void;
  onDelete?: () => void;
  onBookmark?: (marker: IMarker, value: Date | null) => void;
  onRate?: (marker: IMarker, rating: number) => void;
  onFav?: (marker: IMarker, value: boolean) => void;
};

export default function MarkerList({
  markers,
  onClick,
  onBookmark,
  onRate,
  onFav,
  onDelete,
}: Props) {
  return (
    <>
      {markers.map((marker) => (
        <MarkerCard
          key={marker._id}
          marker={marker}
          onClick={() => onClick?.(marker)}
          onDelete={() => onDelete?.()}
          onBookmark={(value) => onBookmark?.(marker, value)}
          onRate={(value) => onRate?.(marker, value)}
          onFav={(value) => onFav?.(marker, value)}
        />
      ))}
    </>
  );
}
