import axios from "axios";
import clsx from "clsx";
import type { FfprobeData } from "fluent-ffmpeg";
import { MetadataOptions } from "logform";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import CopyIcon from "mdi-react/ContentCopyIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import prettyBytes from "pretty-bytes";
import { useEffect, useState } from "react";
import { number } from "yargs";

import ActorCard from "../../components/ActorCard";
import AutoLayout from "../../components/AutoLayout";
import Button from "../../components/Button";
import Card from "../../components/Card";
import CardSection from "../../components/CardSection";
import CardTitle from "../../components/CardTitle";
import Code from "../../components/Code";
import Description from "../../components/Description";
import LabelGroup from "../../components/LabelGroup";
import ListContainer from "../../components/ListContainer";
import ListWrapper from "../../components/ListWrapper";
import MarkerCreator from "../../components/MarkerCreator";
import MovieCard from "../../components/MovieCard";
import PageWrapper from "../../components/PageWrapper";
import Rating from "../../components/Rating";
import MarkerList from "../../components/scene_details/MarkerList";
import VideoPlayer from "../../components/scene_details/VideoPlayer";
import SceneEditor from "../../components/SceneEditor";
import Spacer from "../../components/Spacer";
import Text from "../../components/Text";
import Window from "../../components/Window";
import { useActorList } from "../../composables/use_actor_list";
import { useMovieList } from "../../composables/use_movie_list";
import { useVideoControls } from "../../composables/use_video_control";
import { scenePageFragment } from "../../fragments/scene";
import ILabel from "../../types/label";
import { IScene } from "../../types/scene";
import { graphqlQuery } from "../../util/gql";
import {
  bookmarkScene,
  favoriteScene,
  rateScene,
  runScenePlugins,
  screenshotScene,
  unwatchScene,
  watchScene,
} from "../../util/mutations/scene";
import { buildQueryParser } from "../../util/query_parser";
import { formatDuration } from "../../util/string";
import { thumbnailUrl } from "../../util/thumbnail";
import styles from "./Scene.module.scss";

type MetaDataProps = {
  label: string;
  value?: string | number;
  formatter?: (value: string | number) => string;
};

const dateFormatter = (value: string | number) => {
  return new Date(value).toLocaleDateString();
};

const VideoMetaData = ({ label, value, formatter }: MetaDataProps) => {
  if (!value) {
    return null;
  }

  return (
    <div>
      <span>{label}</span>
      <span style={{ float: "right", marginRight: 70 }}>
        {formatter ? formatter(value) : value}
      </span>
    </div>
  );
};

type RawDataProps = {
  value?: string | number;
};

const RawData = ({ value }: RawDataProps) => {
  return (
    <div style={{ fontSize: 12, opacity: 0.5 }}>
      <span>{value}</span>
    </div>
  );
};

const queryParser = buildQueryParser({
  t: {
    default: null,
  },
});

async function removeLabel(item: string, label: string): Promise<void> {
  const q = `
  mutation($item: String!, $label: String!) {
    removeLabel(item: $item, label: $label)
  }`;

  await graphqlQuery(q, {
    item,
    label,
  });
}

async function updateLabels(sceneId: string, updatedLabels: string[]): Promise<ILabel[]> {
  const q = `
  mutation($ids: [String!]!, $opts: SceneUpdateOpts!) {
    updateScenes(ids: $ids, opts: $opts) {
      _id
      labels {
        _id
        name
        color
      }
    }
  }`;

  type updateLabelType = {
    updateScenes: { _id: string; labels: ILabel[] }[];
  };

  const result = await graphqlQuery<updateLabelType>(q, {
    ids: [sceneId],
    opts: {
      labels: updatedLabels,
    },
  });

  return result.updateScenes[0].labels;
}

async function runFFprobe(sceneId: string) {
  const q = `
  mutation($id: String!) {
    runFFProbe(id: $id) {
      ffprobe
    }
  }`;

  const { runFFProbe } = await graphqlQuery<{
    runFFProbe: {
      ffprobe: string;
    };
  }>(q, {
    id: sceneId,
  });

  return JSON.parse(runFFProbe.ffprobe) as FfprobeData;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { t } = queryParser.parse(ctx.query);

  const q = `
  query ($id: String!) {
    getSceneById(id: $id) {
      ...ScenePage
    }
  }
  ${scenePageFragment}
  `;

  const { getSceneById } = await graphqlQuery<{
    getSceneById: IScene;
  }>(q, {
    id: ctx.query.id,
  });

  return {
    props: {
      scene: getSceneById,
      startAtPosition: t,
    },
  };
};

/**
 * TODO: reload after mutation without refreshing the whole page and stopping the video
 */
export default function ScenePage({
  scene,
  startAtPosition,
}: {
  scene: IScene;
  startAtPosition?: number;
}) {
  const router = useRouter();
  const t = useTranslations();

  const [favorite, setFavorite] = useState(scene.favorite);
  const [bookmark, setBookmark] = useState(!!scene.bookmark);
  const [rating, setRating] = useState(scene.rating);
  const [markers, setMarkers] = useState(scene.markers);
  const [labels, setLabels] = useState<{ _id: string; name: string; color?: string }[]>(
    scene.labels
  );
  const [ffprobeData, setFFprobeData] = useState<FfprobeData | null>(null);

  const [watches, setWatches] = useState<number[]>(scene.watches);
  const [watchLoader, setWatchLoader] = useState(false);
  const [screenshotLoader, setScreenshotLoader] = useState(false);

  const [pluginLoader, setPluginLoader] = useState(false);

  const gridUrl = `/api/media/scene/${scene._id}/grid`;
  const [showGrid, setGrid] = useState(false);
  const [gridLoader, setGridLoader] = useState(false);
  const { startPlayback, currentTime } = useVideoControls();

  const {
    actors,
    editActor,
    setData: setActors,
  } = useActorList(
    {
      items: scene.actors,
      numItems: scene.actors.length,
      numPages: 1,
    },
    {}
  );

  const {
    movies,
    editMovie,
    setData: setMovies,
  } = useMovieList(
    {
      items: scene.movies,
      numItems: scene.movies.length,
      numPages: 1,
    },
    {}
  );

  useEffect(() => {
    setFavorite(scene.favorite);
    setBookmark(!!scene.bookmark);
    setRating(scene.rating);
    setMarkers(scene.markers);
    setWatches(scene.watches);
    setActors({
      items: scene.actors,
      numItems: scene.actors.length,
      numPages: 1,
    });
    setMovies({
      items: scene.movies,
      numItems: scene.movies.length,
      numPages: 1,
    });
  }, [scene]);

  async function reloadMarkers(): Promise<void> {
    const q = `
  query ($id: String!) {
    getSceneById(id: $id) {
      markers {
        _id
        name
        time
        thumbnail {
          _id,
          name
        }
      }
    }
  }
  `;

    const { getSceneById } = await graphqlQuery<{
      getSceneById: IScene;
    }>(q, {
      id: scene._id,
    });

    setMarkers(getSceneById.markers);
  }

  async function toggleFav(): Promise<void> {
    const newValue = !scene.favorite;
    await favoriteScene(scene._id, newValue);
    setFavorite(newValue);
  }

  async function toggleBookmark(): Promise<void> {
    const newValue = scene.bookmark ? null : new Date();
    await bookmarkScene(scene._id, newValue);
    setBookmark(!!newValue);
  }

  async function changeRating(rating: number): Promise<void> {
    await rateScene(scene._id, rating);
    setRating(rating);
  }

  async function _watchScene(): Promise<void> {
    setWatchLoader(true);
    try {
      const watches = await watchScene(scene._id);
      setWatches(watches);
    } catch (error) {}
    setWatchLoader(false);
  }

  async function _unwatchScene(): Promise<void> {
    setWatchLoader(true);
    try {
      const watches = await unwatchScene(scene._id);
      setWatches(watches);
    } catch (error) {}
    setWatchLoader(false);
  }

  async function handleRunScenePlugins() {
    setPluginLoader(true);
    try {
      await runScenePlugins(scene._id);
      router.replace(router.asPath).catch(() => {});
    } catch (error) {
      console.error(error);
    }
    setPluginLoader(false);
  }

  async function handleScreenshotScene() {
    setScreenshotLoader(true);
    try {
      await screenshotScene(scene._id, currentTime);
      router.replace(router.asPath).catch(() => {});
    } catch (error) {
      console.error(error);
    }
    setScreenshotLoader(false);
  }

  async function addLabels(newLabels: string[]) {
    const updatedLabels = await updateLabels(scene._id, [
      ...labels.map((l) => l._id),
      ...newLabels,
    ]);
    setLabels(updatedLabels);
  }

  async function deleteLabel(id: string) {
    await removeLabel(scene._id, id);
    setLabels(labels.filter((label) => label._id !== id));
  }

  return (
    <PageWrapper padless title={scene.name}>
      <AutoLayout>
        <VideoPlayer
          scene={scene}
          startAtPosition={startAtPosition}
          duration={scene.meta.duration}
          markers={markers.map((marker) => ({
            ...marker,
            time: marker.time / scene.meta.duration,
            thumbnail: thumbnailUrl(marker.thumbnail?._id),
          }))}
          poster={thumbnailUrl(scene.thumbnail?._id)}
          src={`/api/media/scene/${scene._id}`}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1000,
              padding: "0 10px",
            }}
          >
            <AutoLayout>
              {/* ACTION BAR */}
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <>
                    {favorite ? (
                      <HeartIcon
                        className="hover"
                        onClick={toggleFav}
                        size={24}
                        style={{ color: "#ff3355" }}
                      />
                    ) : (
                      <HeartBorderIcon className="hover" onClick={toggleFav} size={24} />
                    )}
                  </>
                  <>
                    {bookmark ? (
                      <BookmarkIcon onClick={toggleBookmark} className="hover" size={24} />
                    ) : (
                      <BookmarkBorderIcon onClick={toggleBookmark} className="hover" size={24} />
                    )}
                    <Rating onChange={changeRating} value={rating}></Rating>
                  </>
                  <Spacer />
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Button compact loading={watchLoader} onClick={_watchScene}>
                      +
                    </Button>
                    {watches.length}
                    <Button compact loading={watchLoader} onClick={_unwatchScene}>
                      -
                    </Button>
                  </div>
                  <MarkerCreator
                    onOpen={() => {
                      const videoEl = document.getElementById(
                        "video-player"
                      ) as HTMLVideoElement | null;
                      if (videoEl) {
                        videoEl.pause();
                      }
                    }}
                    sceneId={scene._id}
                    actors={scene.actors}
                    onCreate={async () => {
                      const videoEl = document.getElementById(
                        "video-player"
                      ) as HTMLVideoElement | null;
                      if (videoEl) {
                        videoEl.play().catch(() => {});
                      }

                      await reloadMarkers();
                    }}
                  />

                  <SceneEditor
                    sceneId={scene._id}
                    onEdit={() => {
                      router.replace(router.asPath).catch(() => {});
                    }}
                  />
                </div>
              </Card>
              {/* MAIN INFO */}

              <div style={{ display: "flex", gap: 15 }} className={clsx(styles["scene-meta"])}>
                <div style={{ flex: 1 }}>
                  <Card>
                    <div>
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <div style={{ flex: 5 }}>
                          <CardTitle style={{ marginBottom: 5 }}>{scene.name}</CardTitle>
                        </div>
                        {!!scene.studio && (
                          <>
                            <Link href={`/studio/${scene.studio._id}`} passHref>
                              <a className="hover">
                                {scene.studio.thumbnail ? (
                                  <img
                                    style={{ maxWidth: 200, maxHeight: 64, objectFit: "cover" }}
                                    src={thumbnailUrl(scene.studio.thumbnail?._id)}
                                    alt={`${scene.studio.name}`}
                                  />
                                ) : (
                                  <span>{scene.studio.name}</span>
                                )}
                              </a>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 15, opacity: 0.7, textAlign: "justify" }}>
                      {scene.description}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: 20,
                      }}
                    >
                      <AutoLayout>
                        <CardSection title="">
                          <LabelGroup
                            limit={999}
                            labels={labels}
                            onAdd={addLabels}
                            onDelete={async (id: string) => {
                              if (window.confirm("Really delete this label?")) {
                                await deleteLabel(id);
                              }
                            }}
                          />
                        </CardSection>
                      </AutoLayout>
                      <div style={{ display: "flex", gap: 5, flexDirection: "row" }}>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 12,
                              opacity: 0.5,
                              border: "1.5px solid",
                              borderTop: 0,
                              borderBottom: 0,
                              borderLeft: 0,
                              borderImage:
                                "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(226, 226, 226, 1) 48%, rgba(255, 255, 255, 0) 100%)",
                              borderImageSlice: 1,
                            }}
                          >
                            <VideoMetaData
                              label="Added on"
                              value={scene.addedOn}
                              formatter={dateFormatter}
                            />
                            <VideoMetaData
                              label="Released on"
                              formatter={dateFormatter}
                              value={scene.addedOn}
                            />
                            {!!watches.length && (
                              <VideoMetaData
                                label="Last watched"
                                value={watches[watches.length - 1]}
                                formatter={dateFormatter}
                              />
                            )}
                            <VideoMetaData
                              label="Duration"
                              value={scene.meta?.duration}
                              formatter={(value) => formatDuration(value as number)}
                            />
                          </div>
                        </div>
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <RawData value={prettyBytes(scene.meta.size)} />
                          <RawData
                            value={`${scene.meta.dimensions.width}x${scene.meta.dimensions.height}`}
                          />

                          <RawData value={`${scene.meta.fps.toFixed(2)} Fps`} />
                          <RawData
                            value={`${((scene.meta.size / 1000 / scene.meta.duration) * 8).toFixed(
                              0
                            )} kBit/s`}
                          />
                        </div>
                      </div>
                      <AutoLayout>
                        <div style={{ fontSize: 12, opacity: 0.5 }}>{scene.path}</div>
                        <CardSection title={t("heading.actions")}>
                          <div>
                            <Button
                              onClick={() => {
                                runFFprobe(scene._id)
                                  .then(setFFprobeData)
                                  .catch(() => {});
                              }}
                            >
                              Run FFprobe
                            </Button>
                            <Button loading={pluginLoader} onClick={handleRunScenePlugins}>
                              Run plugins
                            </Button>
                            <Window
                              isOpen={!!ffprobeData}
                              title="FFprobe result"
                              onClose={() => setFFprobeData(null)}
                              actions={
                                <>
                                  <Button
                                    onClick={() => {
                                      navigator.clipboard
                                        .writeText(JSON.stringify(ffprobeData, null, 2).trim())
                                        .catch(() => {});
                                    }}
                                  >
                                    Copy
                                  </Button>
                                  <Button onClick={() => setFFprobeData(null)}>Close</Button>
                                </>
                              }
                            >
                              <Code
                                style={{
                                  maxHeight: "50vh",
                                  overflowX: "scroll",
                                  overflowY: "scroll",
                                  maxWidth: 700,
                                }}
                                value={ffprobeData}
                              ></Code>
                            </Window>
                            <Button
                              loading={gridLoader}
                              onClick={async () => {
                                setGridLoader(true);
                                try {
                                  const res = await axios.get(gridUrl);
                                  setGrid(true);
                                } catch (error) {}
                                setGridLoader(false);
                              }}
                            >
                              Generate grid
                            </Button>
                            <Button loading={screenshotLoader} onClick={handleScreenshotScene}>
                              Use current frame as thumbnail
                            </Button>
                          </div>
                        </CardSection>
                        {showGrid && (
                          <div>
                            <img src={gridUrl} width="100%" />
                          </div>
                        )}
                      </AutoLayout>
                    </div>
                  </Card>
                </div>

                {/* ACTORS */}
                <div style={{ flex: 1 }}>
                  {!!actors.length && (
                    <ListContainer size={150}>
                      {actors.map((actor) => (
                        <ActorCard
                          scene={scene}
                          onFav={(value) => {
                            editActor(actor._id, (actor) => {
                              actor.favorite = value;
                              return actor;
                            });
                          }}
                          onBookmark={(value) => {
                            editActor(actor._id, (actor) => {
                              actor.bookmark = !!value;
                              return actor;
                            });
                          }}
                          onRate={(rating) => {
                            editActor(actor._id, (actor) => {
                              actor.rating = rating;
                              return actor;
                            });
                          }}
                          key={actor._id}
                          actor={actor}
                        ></ActorCard>
                      ))}
                    </ListContainer>
                  )}
                </div>
              </div>
              {/* MOVIES */}
              {!!movies.length && (
                <div>
                  <CardTitle style={{ marginBottom: 20 }}>{t("movieFeatures")}</CardTitle>
                  <ListContainer size={225}>
                    {movies.map((movie) => (
                      <MovieCard
                        onFav={(value) => {
                          editMovie(movie._id, (movie) => {
                            movie.favorite = value;
                            return movie;
                          });
                        }}
                        onBookmark={(value) => {
                          editMovie(movie._id, (movie) => {
                            movie.bookmark = !!value;
                            return movie;
                          });
                        }}
                        key={movie._id}
                        movie={movie}
                      ></MovieCard>
                    ))}
                  </ListContainer>
                </div>
              )}
              {/* MARKERS */}
              <CardTitle>Markers</CardTitle>
              <ListWrapper loading={false} noResults={scene.markers.length === 0}>
                {/* TODO: update marker list on delete */}
                <MarkerList
                  markers={scene.markers}
                  onClick={(marker) => {
                    startPlayback(marker.time);
                    window.scrollTo({
                      left: 0,
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                />
              </ListWrapper>
            </AutoLayout>
          </div>
        </div>
      </AutoLayout>
    </PageWrapper>
  );
}
