import { useSafeMode } from "../composables/use_safe_mode";
import Lightbox from "./Lightbox";

type Props = {
  active: boolean;
  src: string;
  fullSrc: string;
  alt?: string;

  favorite: boolean;
  bookmark: boolean;
  rating: number | null;

  onFavorite?: () => void;
  onBookmark?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
};

export default function ImageCard(props: Props) {
  const {
    active,
    alt,
    src,
    fullSrc,
    favorite,
    bookmark,
    onBookmark,
    onFavorite,
    onNext,
    onPrevious,
    onOpen,
    onClose,
    rating,
  } = props;

  const { blur: safeModeBlur } = useSafeMode();

  return (
    <>
      <div style={{ overflow: "hidden", borderRadius: 8 }}>
        <img
          className="hover"
          width="100%"
          src={src}
          alt={alt}
          onClick={() => onOpen?.()}
          style={{
            transition: "filter 0.15s ease-in-out",
            filter: safeModeBlur,
            display: "block",
          }}
        />
      </div>
      <Lightbox
        rating={rating}
        favorite={favorite}
        bookmark={bookmark}
        onBookmark={onBookmark}
        onFavorite={onFavorite}
        onNext={onNext}
        onPrevious={onPrevious}
        onClose={() => onClose?.()}
        src={fullSrc}
        alt={alt}
        active={active}
      />
    </>
  );
}
