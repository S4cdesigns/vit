import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import DeleteIcon from "mdi-react/DeleteIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useState } from "react";

import { useSafeMode } from "../composables/use_safe_mode";
import { useSettings } from "../composables/use_settings";
import { IMarker } from "../types/marker";
import { graphqlQuery } from "../util/gql";
import { bookmarkMarker, favoriteMarker, rateMarker } from "../util/mutations/marker";
import { thumbnailUrl } from "../util/thumbnail";
import ActorList from "./ActorList";
import AutoLayout from "./AutoLayout";
import LabelGroup from "./LabelGroup";
import MarkerEditor from "./MarkerEditor";
import Paper from "./Paper";
import Rating from "./Rating";
import ResponsiveImage from "./ResponsiveImage";

type Props = {
  marker: IMarker;
  onFav: (value: boolean) => void;
  onBookmark: (value: Date | null) => void;
  onRate: (rating: number) => void;
  onEdit: () => void;
  onClick: () => void;
  onDelete: () => void;
};

MarkerCard.defaultProps = {
  onClick: undefined,
  onEdit: undefined,
  onFav: undefined,
  onRate: undefined,
  onBookmark: undefined,
  onDelete: undefined,
};

export default function MarkerCard({
  marker,
  onFav,
  onBookmark,
  onRate,
  onClick,
  onEdit,
  onDelete,
}: Props) {
  const { blur: safeModeBlur } = useSafeMode();
  const [fav, setFav] = useState<boolean>(marker.favorite);
  const [bookmark, setBookmark] = useState<boolean>(marker.bookmark);
  const [rating, setRating] = useState<number>(marker.rating);
  const { showCardLabels } = useSettings();

  async function toggleFav(): Promise<void> {
    const newValue = !fav;
    setFav(newValue);
    await favoriteMarker(marker._id, newValue);
    onFav && onFav(newValue);
  }

  async function toggleBookmark(): Promise<void> {
    const newValue = !bookmark;
    setBookmark(newValue);
    await bookmarkMarker(marker._id, newValue);
    onBookmark && onBookmark(newValue);
  }

  async function changeRating(rating: number): Promise<void> {
    setRating(rating);
    await rateMarker(marker._id, rating);
    onRate && onRate(rating);
  }

  async function deleteMarker(): Promise<void> {
    const query = `
  mutation ($ids: [String!]!) {
    removeMarkers(ids: $ids) 
    
  }
 `;

    await graphqlQuery(query, {
      ids: [marker._id],
    });
    onDelete && onDelete();
  }

  return (
    <Paper
      style={{ position: "relative" }}
      onClick={() => {
        onClick && onClick();
      }}
    >
      <ResponsiveImage
        aspectRatio="4 / 3"
        href={
          typeof onClick !== "undefined" || !marker.scene
            ? undefined
            : `/scene/${marker.scene._id}?t=${marker.time}`
        }
        src={marker.thumbnail?._id && thumbnailUrl(marker.thumbnail._id)}
        imgStyle={{
          transition: "filter 0.15s ease-in-out",
          filter: safeModeBlur,
          cursor: "pointer",
        }}
      ></ResponsiveImage>
      {/* TODO: this box needs to support theming and the style should probably be moved to a component */}
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
        {fav ? (
          <HeartIcon
            onClick={async (event) => {
              event.stopPropagation();
              await toggleFav();
            }}
            className="hover"
            style={{ fontSize: 28, color: "#ff3355" }}
          />
        ) : (
          <HeartBorderIcon
            onClick={async (event) => {
              event.stopPropagation();
              await toggleFav();
            }}
            className="hover"
            style={{ fontSize: 28 }}
          />
        )}
        {bookmark ? (
          <BookmarkIcon
            onClick={async (event) => {
              event.stopPropagation();
              await toggleBookmark();
            }}
            className="hover"
            style={{ fontSize: 28 }}
          />
        ) : (
          <BookmarkBorderIcon
            onClick={async (event) => {
              event.stopPropagation();
              await toggleBookmark();
            }}
            className="hover"
            style={{ fontSize: 28 }}
          />
        )}
      </AutoLayout>
      <AutoLayout
        gap={5}
        layout="h"
        style={{
          color: "white",
          background: "#000000bb",
          borderRadius: 5,
          padding: 3,
          position: "absolute",
          right: 1,
          top: 1,
        }}
      >
        <MarkerEditor
          markerId={marker._id}
          onEdit={() => {
            onEdit && onEdit();
          }}
        />
        <DeleteIcon
          className="hover"
          onClick={async (event) => {
            event.stopPropagation();
            if (window.confirm("Really delete this marker?")) {
              await deleteMarker();
            }
          }}
        />
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

        {marker.actors?.length && <ActorList actors={marker.actors} />}

        {marker.scene && (
          <div style={{ fontSize: 12, opacity: 0.66 }}>
            From scene: <a href={`/scene/${marker.scene._id}`}>{marker.scene.name}</a>
          </div>
        )}
        <div>{<Rating onChange={changeRating} value={rating || 0} />}</div>

        {showCardLabels && marker.labels && <div>{<LabelGroup labels={marker.labels} />}</div>}
      </AutoLayout>
    </Paper>
  );
}
