import HeartIcon from "mdi-react/HeartIcon";
import Link from "next/link";
import { useSafeMode } from "../composables/use_safe_mode";

import { thumbnailUrl } from "../util/thumbnail";
import ResponsiveImage from "./ResponsiveImage";

type Props = {
  name: string;
  thumbnailId?: string;
  favorite?: boolean;
  id: string;
};

export default function ActorGridItem({ id, name, thumbnailId, favorite }: Props) {
  const { blur: safeModeBlur } = useSafeMode();

  return (
    <Link href={`/actor/${id}`} passHref>
      <a style={{ display: "block", borderRadius: 8, overflow: "hidden" }} className="hover">
        <div className="hover" style={{ position: "relative" }}>
          <ResponsiveImage
            aspectRatio="3 / 4"
            href={`/actor/${id}`}
            src={thumbnailId && thumbnailUrl(thumbnailId)}
            imgStyle={{
              transition: "filter 0.15s ease-in-out",
              filter: safeModeBlur,
            }}
          />
          {favorite && (
            <div
              style={{
                position: "absolute",
                right: 4,
                top: 4,
              }}
            >
              <HeartIcon color="#ff3355" />
            </div>
          )}
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              background: "#000000bb",
              textAlign: "center",
              position: "absolute",
              bottom: 5,
              left: 0,
              right: 0,
              margin: "0 6px",
              borderRadius: 4,
              padding: "4px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </div>
        </div>
      </a>
    </Link>
  );
}
