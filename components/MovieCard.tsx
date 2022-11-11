import Color from "color";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useTranslations } from "next-intl";
import { useContext, useMemo, useState } from "react";

import { SafeModeContext, ThemeContext } from "../pages/_app";
import { IMovie } from "../types/movie";
import { bookmarkMovie, favoriteMovie } from "../util/mutations/movie";
import { formatDuration } from "../util/string";
import { thumbnailUrl } from "../util/thumbnail";
import ActorList from "./ActorList";
import AutoLayout from "./AutoLayout";
import LabelGroup from "./LabelGroup";
import Paper from "./Paper";
import Rating from "./Rating";
import ResponsiveImage from "./ResponsiveImage";
import Spacer from "./Spacer";

type Props = {
  movie: IMovie;
  onFav: (value: boolean) => void;
  onBookmark: (value: Date | null) => void;
};

export default function MovieCard({ movie, onFav, onBookmark }: Props) {
  const { enabled: safeMode } = useContext(SafeModeContext);
  const { theme } = useContext(ThemeContext);
  const t = useTranslations();
  const [hover, setHover] = useState(false);

  const thumbSrc = useMemo(() => {
    if (hover && movie.backCover) {
      return movie.backCover && thumbnailUrl(movie.backCover._id);
    }
    return movie.frontCover && thumbnailUrl(movie.frontCover._id);
  }, [hover]);

  async function toggleFav(): Promise<void> {
    const newValue = !movie.favorite;
    await favoriteMovie(movie._id, newValue);
    onFav(newValue);
  }

  async function toggleBookmark(): Promise<void> {
    const newValue = movie.bookmark ? null : new Date();
    await bookmarkMovie(movie._id, newValue);
    onBookmark(newValue);
  }

  const titleColor = (() => {
    if (!movie.frontCover?.color) {
      return undefined;
    }
    let color = new Color(movie.frontCover.color);
    if (theme === "dark") {
      color = color.hsl(color.hue(), 100, 85);
    } else {
      color = color.hsl(color.hue(), 100, 15);
    }
    return color.hex();
  })();

  return (
    <Paper style={{ position: "relative" }}>
      <div onMouseLeave={() => setHover(false)} onMouseEnter={() => setHover(true)}>
        <ResponsiveImage
          aspectRatio="0.71"
          href={`/movie/${movie._id}`}
          src={thumbSrc}
          imgStyle={{
            transition: "filter 0.15s ease-in-out",
            filter: safeMode ? "blur(20px)" : undefined,
            display: "block",
          }}
        >
          <AutoLayout
            layout="h"
            gap={2}
            style={{
              fontSize: 14,
              color: "white",
              position: "absolute",
              right: 1,
              bottom: 1,
            }}
          >
            <div style={{ borderRadius: 4, padding: "2px 5px", background: "#000000dd" }}>
              <b>{movie.scenes.length}</b> {t("scene", { numItems: movie.scenes.length })}
            </div>
            {!!movie.duration && (
              <div style={{ borderRadius: 4, padding: "2px 5px", background: "#000000dd" }}>
                <b>{formatDuration(movie.duration)}</b>
              </div>
            )}
          </AutoLayout>
        </ResponsiveImage>
      </div>
      <AutoLayout
        gap={5}
        layout="h"
        style={{
          color: "white",
          background: "#000000bb",
          borderRadius: 5,
          padding: 3,
          position: "absolute",
          left: 1,
          top: 1,
        }}
      >
        {movie.favorite ? (
          <HeartIcon
            className="hover"
            onClick={toggleFav}
            style={{ fontSize: 28, color: "#ff3355" }}
          />
        ) : (
          <HeartBorderIcon className="hover" onClick={toggleFav} style={{ fontSize: 28 }} />
        )}
        {movie.bookmark ? (
          <BookmarkIcon className="hover" onClick={toggleBookmark} style={{ fontSize: 28 }} />
        ) : (
          <BookmarkBorderIcon className="hover" onClick={toggleBookmark} style={{ fontSize: 28 }} />
        )}
      </AutoLayout>
      <AutoLayout gap={5} style={{ padding: "6px 8px 8px 8px" }}>
        <div style={{ display: "flex" }}>
          {movie.studio && (
            <div style={{ textTransform: "uppercase", fontSize: 12, opacity: 0.8 }}>
              {movie.studio.name}
            </div>
          )}
          <Spacer />
          {movie.releaseDate && (
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {new Date(movie.releaseDate).toLocaleDateString()}
            </div>
          )}
        </div>
        <div
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            color: titleColor,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {movie.name}
        </div>

        {!!movie.actors.length && <ActorList actors={movie.actors} />}

        <div>
          <Rating value={movie.rating || 0} readonly />
        </div>

        <div>
          <LabelGroup labels={movie.labels} />
        </div>
      </AutoLayout>
    </Paper>
  );
}
