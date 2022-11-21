import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { IStudio } from "../types/studio";
import { bookmarkStudio, favoriteStudio } from "../util/mutations/studio";
import { thumbnailUrl } from "../util/thumbnail";
import LabelGroup from "./LabelGroup";
import Paper from "./Paper";
import ResponsiveImage from "./ResponsiveImage";

type Props = {
  studio: Omit<IStudio, "substudios">;
  onFav: (value: boolean) => void;
  onBookmark: (value: Date | null) => void;
};

export default function StudioCard({ studio, onFav, onBookmark }: Props) {
  const t = useTranslations();

  async function toggleFav(): Promise<void> {
    const newValue = !studio.favorite;
    await favoriteStudio(studio._id, newValue);
    onFav(newValue);
  }

  async function toggleBookmark(): Promise<void> {
    const newValue = studio.bookmark ? null : new Date();
    await bookmarkStudio(studio._id, newValue);
    onBookmark(newValue);
  }

  return (
    <Paper style={{ position: "relative" }}>
      <ResponsiveImage
        objectFit="contain"
        aspectRatio="4 / 3"
        href={`/studio/${studio._id}`}
        src={studio.thumbnail?._id && thumbnailUrl(studio.thumbnail._id)}
        imgStyle={{ padding: 10 }}
      />
      <div
        style={{
          color: "white",
          display: "flex",
          alignItems: "center",
          background: "#000000bb",
          borderRadius: 5,
          padding: 3,
          position: "absolute",
          left: 1,
          top: 1,
        }}
      >
        {studio.favorite ? (
          <HeartIcon
            onClick={toggleFav}
            className="hover"
            style={{ fontSize: 28, color: "#ff3355" }}
          />
        ) : (
          <HeartBorderIcon onClick={toggleFav} className="hover" style={{ fontSize: 28 }} />
        )}
        {studio.bookmark ? (
          <BookmarkIcon onClick={toggleBookmark} className="hover" style={{ fontSize: 28 }} />
        ) : (
          <BookmarkBorderIcon onClick={toggleBookmark} className="hover" style={{ fontSize: 28 }} />
        )}
      </div>
      <div style={{ margin: "6px 8px 8px 8px" }}>
        <div style={{ display: "flex", marginBottom: 5 }}>
          {studio.parent && (
            <Link href={`/studio/${studio.parent._id}`} passHref>
              <a>
                <div style={{ textTransform: "uppercase", fontSize: 12, opacity: 0.8 }}>
                  {studio.parent.name}
                </div>
              </a>
            </Link>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 600,
            fontSize: 16,
            gap: 5,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {studio.name}
          </div>
        </div>

        {!!studio.numScenes && (
          <div style={{ fontSize: 14, marginTop: 5, opacity: 0.66 }}>
            {studio.numScenes} {t("scene", { numItems: studio.numScenes })}
          </div>
        )}

        <div style={{ marginTop: 5 }}>
          <LabelGroup labels={studio.labels} />
        </div>
      </div>
    </Paper>
  );
}
