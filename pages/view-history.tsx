import { useTranslations } from "next-intl";
import Link from "next/link";
import { useContext } from "react";
import useSWR from "swr";
import ActorList from "../components/ActorList";
import LabelGroup from "../components/LabelGroup";

import PageWrapper from "../components/PageWrapper";
import ResponsiveImage from "../components/ResponsiveImage";
import { graphqlQuery } from "../util/gql";
import { thumbnailUrl } from "../util/thumbnail";
import { SafeModeContext } from "./_app";

async function getViewHistory() {
  const query = `
  query($min: Long, $max: Long) {
    getWatches(min: $min, max: $max) {
      date
      scene {
        _id
        name
        thumbnail {
          _id
          color
        }
        actors {
          _id
          name
        }
        labels {
          _id
          name
          color
        }
        studio {
          _id
          name
        }
      }
    }
  }
`;
  const { getWatches } = await graphqlQuery<{
    getWatches: {
      date: number;
      scene: {
        _id: string;
        name: string;
        thumbnail?: {
          _id: string;
          color?: string;
        };
        actors: {
          _id: string;
          name: string;
        }[];
        labels: {
          _id: string;
          name: string;
          color?: string;
        }[];
        studio?: {
          _id: string;
          name: string;
        };
      };
    }[];
  }>(query, {});

  return getWatches;
}

export default function ViewHistoryPage() {
  const { enabled: safeMode } = useContext(SafeModeContext);
  const t = useTranslations();

  const { data: viewHistory } = useSWR("view-history", getViewHistory, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  if (!viewHistory) {
    return <PageWrapper title="View history">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title="View history">
      {/*   <div>{JSON.stringify(viewHistory)}</div> */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {viewHistory.map(({ date, scene }) => (
          <div
            key={date}
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <ResponsiveImage
                aspectRatio="4 / 3"
                href={`/scene/${scene._id}`}
                src={scene.thumbnail?._id && thumbnailUrl(scene.thumbnail._id)}
                imgStyle={{
                  transition: "filter 0.15s ease-in-out",
                  filter: safeMode ? "blur(20px)" : undefined,
                  height: "160px",
                }}
                containerStyle={{
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              />
            </div>
            <div style={{ margin: "6px 8px 8px 8px", overflow: "hidden" }}>
              <div style={{ display: "flex", marginBottom: 5 }}>
                {scene.studio && (
                  <Link href={`/studio/${scene.studio._id}`} passHref>
                    <a>
                      <div style={{ textTransform: "uppercase", fontSize: 12, opacity: 0.8 }}>
                        {scene.studio.name}
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
                    //color: titleColor,
                  }}
                >
                  {scene.name}
                </div>
              </div>

              {!!scene.actors.length && <ActorList actors={scene.actors} />}

              {/* <div style={{ marginTop: 5 }}>
                <Rating onChange={changeRating} value={scene.rating || 0} />
              </div> */}

              <div style={{ marginTop: 5 }}>
                <LabelGroup labels={scene.labels} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
