import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useContext } from "react";

import { SafeModeContext, ThemeContext } from "../pages/_app";
import { IMarker } from "../types/marker";
import { bookmarkMarker, favoriteMarker, rateMarker } from "../util/mutations/marker";
import { thumbnailUrl } from "../util/thumbnail";
import ActorList from "./ActorList";
import AutoLayout from "./AutoLayout";
import LabelGroup from "./LabelGroup";
import Paper from "./Paper";
import Rating from "./Rating";
import ResponsiveImage from "./ResponsiveImage";

type Props = {
  marker: Pick<
    IMarker,
    | "_id"
    | "time"
    | "name"
    | "scene"
    | "favorite"
    | "bookmark"
    | "rating"
    | "thumbnail"
    | "labels"
    | "actors"
  >;
  onFav: (value: boolean) => void;
  onBookmark: (value: Date | null) => void;
  onRate: (rating: number) => void;
};

export default function MarkerCard({ marker, onFav, onBookmark, onRate }: Props) {
  const { enabled: safeMode } = useContext(SafeModeContext);
  const { theme } = useContext(ThemeContext);

  async function toggleFav(): Promise<void> {
    const newValue = !marker.favorite;
    await favoriteMarker(marker._id, newValue);
    onFav(newValue);
  }

  async function toggleBookmark(): Promise<void> {
    const newValue = marker.bookmark ? null : new Date();
    await bookmarkMarker(marker._id, newValue);
    onBookmark(newValue);
  }

  async function changeRating(rating: number): Promise<void> {
    await rateMarker(marker._id, rating);
    onRate(rating);
  }

  return (
    <Paper style={{ position: "relative" }}>
      <ResponsiveImage
        aspectRatio="4 / 3"
        href={`/scene/${marker.scene._id}?t=${marker.time}`}
        src={marker.thumbnail?._id && thumbnailUrl(marker.thumbnail._id)}
        imgStyle={{
          transition: "filter 0.15s ease-in-out",
          filter: safeMode ? "blur(20px)" : undefined,
        }}
      ></ResponsiveImage>
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
        {marker.favorite ? (
          <HeartIcon
            onClick={toggleFav}
            className="hover"
            style={{ fontSize: 28, color: "#ff3355" }}
          />
        ) : (
          <HeartBorderIcon onClick={toggleFav} className="hover" style={{ fontSize: 28 }} />
        )}
        {marker.bookmark ? (
          <BookmarkIcon onClick={toggleBookmark} className="hover" style={{ fontSize: 28 }} />
        ) : (
          <BookmarkBorderIcon onClick={toggleBookmark} className="hover" style={{ fontSize: 28 }} />
        )}
      </AutoLayout>
      <AutoLayout gap={5} style={{ padding: "6px 8px 8px 8px" }}>
        <div
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            color: undefined,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {marker.name}
        </div>

        {!!marker.actors.length && <ActorList actors={marker.actors} />}

        {marker.scene && (
          <div style={{ fontSize: 12, opacity: 0.66 }}>
            From scene: <a href={`/scene/${marker.scene._id}`}>{marker.scene.name}</a>
          </div>
        )}
        <div>{<Rating onChange={changeRating} value={marker.rating || 0} />}</div>

        <div>{<LabelGroup labels={marker.labels} />}</div>
      </AutoLayout>
    </Paper>
  );
}
