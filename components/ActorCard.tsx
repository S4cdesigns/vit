import Color from "color";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useContext, useMemo, useState } from "react";

import { useSafeMode } from "../composables/use_safe_mode";
import { ThemeContext } from "../pages/_app";
import { IActor } from "../types/actor";
import { bookmarkActor, favoriteActor, rateActor } from "../util/mutations/actor";
import { thumbnailUrl } from "../util/thumbnail";
import AutoLayout from "./AutoLayout";
import Flag from "./Flag";
import LabelGroup from "./LabelGroup";
import Paper from "./Paper";
import Rating from "./Rating";
import ResponsiveImage from "./ResponsiveImage";
import Spacer from "./Spacer";

type Props = {
  actor: Pick<
    IActor,
    | "_id"
    | "altThumbnail"
    | "thumbnail"
    | "favorite"
    | "bookmark"
    | "age"
    | "nationality"
    | "name"
    | "rating"
    | "labels"
  >;
  onFav: (value: boolean) => void;
  onBookmark: (value: Date | null) => void;
  onRate: (rating: number) => void;
};

export default function ActorCard({ actor, onFav, onBookmark, onRate }: Props) {
  const { blur: safeModeBlur } = useSafeMode();
  const { theme } = useContext(ThemeContext);
  const [hover, setHover] = useState(false);

  const thumbSrc = useMemo(() => {
    if (hover && actor.altThumbnail) {
      return actor.altThumbnail && thumbnailUrl(actor.altThumbnail._id);
    }
    return actor.thumbnail && thumbnailUrl(actor.thumbnail._id);
  }, [hover]);

  async function toggleFav(): Promise<void> {
    const newValue = !actor.favorite;
    await favoriteActor(actor._id, newValue);
    onFav(newValue);
  }

  async function toggleBookmark(): Promise<void> {
    const newValue = actor.bookmark ? null : new Date();
    await bookmarkActor(actor._id, newValue);
    onBookmark(newValue);
  }

  async function changeRating(rating: number): Promise<void> {
    await rateActor(actor._id, rating);
    onRate(rating);
  }

  const titleColor = (() => {
    if (!actor.thumbnail?.color) {
      return undefined;
    }
    let color = new Color(actor.thumbnail.color);
    if (theme === "dark") {
      color = color.hsl(color.hue(), 100, 85);
    } else {
      color = color.hsl(color.hue(), 100, 15);
    }
    return color.hex();
  })();

  return (
    <Paper style={{ position: "relative" }}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <ResponsiveImage
          aspectRatio="3 / 4"
          href={`/actor/${actor._id}`}
          src={thumbSrc}
          imgStyle={{
            transition: "filter 0.15s ease-in-out",
            filter: safeModeBlur,
          }}
        />
      </div>
      <AutoLayout
        gap={5}
        layout="h"
        style={{
          color: "white",
          alignItems: "center",
          background: "#000000bb",
          borderRadius: 5,
          padding: 3,
          position: "absolute",
          left: 1,
          top: 1,
        }}
      >
        {actor.favorite ? (
          <HeartIcon
            className="hover"
            onClick={toggleFav}
            style={{ fontSize: 28, color: "#ff3355" }}
          />
        ) : (
          <HeartBorderIcon className="hover" onClick={toggleFav} style={{ fontSize: 28 }} />
        )}
        {actor.bookmark ? (
          <BookmarkIcon className="hover" onClick={toggleBookmark} style={{ fontSize: 28 }} />
        ) : (
          <BookmarkBorderIcon className="hover" onClick={toggleBookmark} style={{ fontSize: 28 }} />
        )}
      </AutoLayout>
      <AutoLayout gap={5} style={{ padding: "6px 8px 8px 8px" }}>
        <AutoLayout
          layout="h"
          style={{
            fontWeight: 600,
            fontSize: 16,
            gap: 5,
          }}
        >
          {actor.nationality && (
            <Flag name={actor.nationality.nationality} size={18} code={actor.nationality.alpha2} />
          )}
          <div
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              color: titleColor,
            }}
          >
            {actor.name}
          </div>
          <Spacer />
          <div>{actor.age}</div>
        </AutoLayout>

        <div>
          <Rating onChange={changeRating} value={actor.rating || 0} />
        </div>

        <div>
          <LabelGroup labels={actor.labels} />
        </div>
      </AutoLayout>
    </Paper>
  );
}
