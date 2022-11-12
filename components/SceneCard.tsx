import Color from "color";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import WatchedIcon from "mdi-react/EyeIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import Link from "next/link";
import { useContext } from "react";

import { SafeModeContext, ThemeContext } from "../pages/_app";
import { IScene } from "../types/scene";
import { bookmarkScene, favoriteScene, rateScene } from "../util/mutations/scene";
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
  scene: Pick<
    IScene,
    | "_id"
    | "name"
    | "favorite"
    | "bookmark"
    | "actors"
    | "studio"
    | "rating"
    | "labels"
    | "thumbnail"
    | "meta"
    | "releaseDate"
    | "watches"
  >;
  onFav: (value: boolean) => void;
  onBookmark: (value: Date | null) => void;
  onRate: (rating: number) => void;
};

export default function SceneCard({ scene, onFav, onBookmark, onRate }: Props) {
  const { enabled: safeMode } = useContext(SafeModeContext);
  const { theme } = useContext(ThemeContext);

  async function toggleFav(): Promise<void> {
    const newValue = !scene.favorite;
    await favoriteScene(scene._id, newValue);
    onFav(newValue);
  }

  async function toggleBookmark(): Promise<void> {
    const newValue = scene.bookmark ? null : new Date();
    await bookmarkScene(scene._id, newValue);
    onBookmark(newValue);
  }

  async function changeRating(rating: number): Promise<void> {
    await rateScene(scene._id, rating);
    onRate(rating);
  }

  const titleColor = (() => {
    if (!scene.thumbnail?.color) {
      return undefined;
    }
    let color = new Color(scene.thumbnail.color);
    if (theme === "dark") {
      color = color.hsl(color.hue(), 100, 85);
    } else {
      color = color.hsl(color.hue(), 100, 15);
    }
    return color.hex();
  })();

  return (
    <Paper style={{ position: "relative" }}>
      <ResponsiveImage
        aspectRatio="4 / 3"
        href={`/scene/${scene._id}`}
        src={scene.thumbnail?._id && thumbnailUrl(scene.thumbnail._id)}
        imgStyle={{
          transition: "filter 0.15s ease-in-out",
          filter: safeMode ? "blur(20px)" : undefined,
        }}
      >
        {!!scene.watches.length && (
          <AutoLayout
            layout="h"
            gap={5}
            style={{
              color: "white",
              background: "#000000bb",
              borderRadius: 5,
              padding: 3,
              position: "absolute",
              left: 1,
              bottom: 1,
              fontSize: 12,
            }}
          >
            <WatchedIcon size={18} />
            <span>
              <b>Watched ({scene.watches.length}x)</b>
            </span>
          </AutoLayout>
        )}
        <div
          style={{
            fontSize: 13,
            fontWeight: "bold",
            color: "white",
            position: "absolute",
            right: 1,
            bottom: 1,
          }}
        >
          <div style={{ borderRadius: 4, padding: "2px 5px", background: "#000000dd" }}>
            <b>{formatDuration(scene.meta.duration)}</b>
          </div>
        </div>
      </ResponsiveImage>
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
        {scene.favorite ? (
          <HeartIcon
            onClick={toggleFav}
            className="hover"
            style={{ fontSize: 28, color: "#ff3355" }}
          />
        ) : (
          <HeartBorderIcon onClick={toggleFav} className="hover" style={{ fontSize: 28 }} />
        )}
        {scene.bookmark ? (
          <BookmarkIcon onClick={toggleBookmark} className="hover" style={{ fontSize: 28 }} />
        ) : (
          <BookmarkBorderIcon onClick={toggleBookmark} className="hover" style={{ fontSize: 28 }} />
        )}
      </AutoLayout>
      <AutoLayout gap={5} style={{ padding: "6px 8px 8px 8px" }}>
        <div style={{ display: "flex" }}>
          {scene.studio && (
            <Link href={`/studio/${scene.studio._id}`} passHref>
              <a>
                <div style={{ textTransform: "uppercase", fontSize: 12, opacity: 0.8 }}>
                  {scene.studio.name}
                </div>
              </a>
            </Link>
          )}
          <Spacer />
          {scene.releaseDate && (
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {new Date(scene.releaseDate).toLocaleDateString()}
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
          {scene.name}
        </div>

        {!!scene.actors.length && <ActorList actors={scene.actors} />}

        <div>
          <Rating onChange={changeRating} value={scene.rating || 0} />
        </div>

        <div>
          <LabelGroup labels={scene.labels} />
        </div>
      </AutoLayout>
    </Paper>
  );
}
