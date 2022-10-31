import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useTranslations } from "next-intl";

import { thumbnailUrl } from "../../util/thumbnail";
import Flag from "../Flag";
import Rating from "../Rating";
import styles from "./ActorProfile.module.scss";

type Props = {
  avatarId?: string;
  nationality?: { name: string; alias?: string; alpha2: string };
  actorName: string;
  age?: number;
  bornOn?: number;
  favorite: boolean;
  bookmark: boolean;
  rating: number;
};

export default function ActorProfile(props: Props) {
  const t = useTranslations();

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
          {props.favorite ? (
            <HeartIcon style={{ fontSize: 32, color: "#ff3355" }} />
          ) : (
            <HeartBorderIcon style={{ fontSize: 32 }} />
          )}
        </div>
        <div>
          {props.bookmark ? (
            <BookmarkIcon style={{ fontSize: 32 }} />
          ) : (
            <BookmarkBorderIcon style={{ fontSize: 32 }} />
          )}
        </div>
      </div>
      <Rating value={props.rating} readonly />
    </div>
  );
}
