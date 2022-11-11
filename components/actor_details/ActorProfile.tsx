import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import ExternalLinkIcon from "mdi-react/ExternalLinkIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import Button from "../../components/Button";
import {
  bookmarkActor,
  favoriteActor,
  rateActor,
  runActorPlugins,
} from "../../util/mutations/actor";
import { thumbnailUrl } from "../../util/thumbnail";
import Flag from "../Flag";
import Rating from "../Rating";
import styles from "./ActorProfile.module.scss";

type Props = {
  actorId: string;
  avatarId?: string;
  nationality?: { name: string; alias?: string; alpha2: string };
  actorName: string;
  age?: number;
  bornOn?: number;
  favorite: boolean;
  bookmark: boolean;
  rating: number;
  links?: { text: string; url: string }[];
};

export default function ActorProfile(props: Props) {
  const t = useTranslations();

  const [favorite, setFavorite] = useState(props.favorite);
  const [bookmark, setBookmark] = useState(props.bookmark);
  const [rating, setRating] = useState(props.rating);
  const [pluginLoader, setPluginLoader] = useState(false);

  useEffect(() => {
    setFavorite(props.favorite);
  }, [props.favorite]);

  useEffect(() => {
    setBookmark(props.bookmark);
  }, [props.bookmark]);

  useEffect(() => {
    setRating(props.rating);
  }, [props.rating]);

  async function changeRating(rating: number): Promise<void> {
    await rateActor(props.actorId, rating);
    setRating(rating);
  }

  function triggerPlugins() {
    setPluginLoader(true);
    runActorPlugins(props.actorId)
      .then((result) => {
        console.log("runActorPlugins done");
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setPluginLoader(false));
  }

  async function toggleFav(): Promise<void> {
    const newValue = !favorite;
    await favoriteActor(props.actorId, newValue);
    setFavorite(newValue);
  }

  async function toggleBookmark(): Promise<void> {
    const newValue = bookmark ? null : new Date();
    await bookmarkActor(props.actorId, newValue);
    setBookmark(!!newValue);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: 15,
        position: "relative",
      }}
    >
      <div style={{ position: "relative" }}>
        {props.avatarId ? (
          <img className={styles.avatar} width="140" src={thumbnailUrl(props.avatarId)} />
        ) : (
          <div className={styles.avatar} style={{ width: 140, height: 140, aspectRatio: "1" }}>
            <span
              style={{
                fontSize: 64,
                opacity: 0.1,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                position: "absolute",
              }}
            >
              ?
            </span>
          </div>
        )}
        {props.nationality && (
          <div
            style={{
              position: "absolute",
              right: -5,
              bottom: 0,
            }}
          >
            <Flag
              name={props.nationality.alias || props.nationality.name}
              code={props.nationality.alpha2}
            />
          </div>
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <div className={styles["actor-name"]}>{props.actorName}</div>
        {props.age && (
          <div
            title={`Born on ${new Date(props.bornOn!).toLocaleDateString()}`}
            style={{ fontSize: 14, opacity: 0.66 }}
          >
            {t("yearsOld", { age: props.age })}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        <div>
          {favorite ? (
            <HeartIcon
              className="hover"
              onClick={toggleFav}
              style={{ fontSize: 32, color: "#ff3355" }}
            />
          ) : (
            <HeartBorderIcon className="hover" onClick={toggleFav} style={{ fontSize: 32 }} />
          )}
        </div>
        <div>
          {bookmark ? (
            <BookmarkIcon className="hover" onClick={toggleBookmark} style={{ fontSize: 32 }} />
          ) : (
            <BookmarkBorderIcon
              className="hover"
              onClick={toggleBookmark}
              style={{ fontSize: 32 }}
            />
          )}
        </div>
      </div>
      <div>
        {props.links && (
          <div>
            {props.links.map((link) => (
              <div>
                <a href={link.url} target="_blank" rel="noopener,noreferrer">
                  <ExternalLinkIcon size={13} /> {link.text}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
      <Rating value={rating} onChange={changeRating} />
      <Button loading={pluginLoader} onClick={triggerPlugins}>
        Run Plugins
      </Button>
    </div>
  );
}
