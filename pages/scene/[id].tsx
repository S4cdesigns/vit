import axios from "axios";
import type { FfprobeData } from "fluent-ffmpeg";
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
import MarkerCreator from "../../components/MarkerCreator";
import MovieCard from "../../components/MovieCard";
import PageWrapper from "../../components/PageWrapper";
import Paper from "../../components/Paper";
import Rating from "../../components/Rating";
import VideoPlayer from "../../components/scene_details/VideoPlayer";
import Spacer from "../../components/Spacer";
import Text from "../../components/Text";
import Window from "../../components/Window";
import { useActorList } from "../../composables/use_actor_list";
import { useMovieList } from "../../composables/use_movie_list";
import { scenePageFragment } from "../../fragments/scene";
import { IScene } from "../../types/scene";
import { graphqlQuery } from "../../util/gql";
import {
  bookmarkScene,
  favoriteScene,
  rateScene,
  runScenePlugins,
  unwatchScene,
  watchScene,
} from "../../util/mutations/scene";
import { formatDuration } from "../../util/string";
import { thumbnailUrl } from "../../util/thumbnail";

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
    },
  };
};

export default function ScenePage({ scene }: { scene: IScene }) {
  const router = useRouter();
  const t = useTranslations();

  const [favorite, setFavorite] = useState(scene.favorite);
  const [bookmark, setBookmark] = useState(!!scene.bookmark);
  const [rating, setRating] = useState(scene.rating);
  const [markers, setMarkers] = useState(scene.markers);
  const [ffprobeData, setFFprobeData] = useState<FfprobeData | null>(null);

  const [watches, setWatches] = useState<number[]>(scene.watches);
  const [watchLoader, setWatchLoader] = useState(false);

  const [pluginLoader, setPluginLoader] = useState(false);

  const gridUrl = `/api/media/scene/${scene._id}/grid`;
  const [showGrid, setGrid] = useState(false);
  const [gridLoader, setGridLoader] = useState(false);

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

  return (
    <PageWrapper padless title={scene.name}>
      <AutoLayout>
        <VideoPlayer
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
                  </>
                  {/* TODO: */}
                  <MarkerCreator
                    sceneId={scene._id}
                    actorIds={scene.actors.map((actor) => actor._id)}
                    onCreate={() => alert("create")}
                  />
                  <Spacer />
                  {!!scene.studio && (
                    <Link href={`/studio/${scene.studio._id}`} passHref>
                      <a className="hover">
                        <img
                          style={{ maxWidth: 200, maxHeight: 64, objectFit: "cover" }}
                          src={thumbnailUrl(scene.studio.thumbnail?._id)}
                          alt={`${scene.studio.name}`}
                        />
                      </a>
                    </Link>
                  )}
                </div>
              </Card>
              {/* MAIN INFO */}
              <Card>
                <CardTitle>{t("general")}</CardTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 20,
                  }}
                >
                  <AutoLayout>
                    <CardSection title={t("title")}>
                      <Text>{scene.name}</Text>
                    </CardSection>
                    {!!scene.studio && (
                      <CardSection title="Studio">
                        <Text>
                          <Link href={`/studio/${scene.studio._id}`}>
                            <a>{scene.studio.name}</a>
                          </Link>
                        </Text>
                      </CardSection>
                    )}
                    {scene.releaseDate && (
                      <CardSection title={t("releaseDate")}>
                        <Text>{new Date(scene.releaseDate).toLocaleDateString()}</Text>
                      </CardSection>
                    )}
                    {scene.description && (
                      <CardSection title={t("description")}>
                        <Description>{scene.description}</Description>
                      </CardSection>
                    )}
                    <CardSection title={t("rating")}>
                      <Rating onChange={changeRating} value={rating}></Rating>
                    </CardSection>
                    <CardSection title="Labels">
                      <LabelGroup limit={999} labels={scene.labels} />
                    </CardSection>
                  </AutoLayout>
                  <AutoLayout>
                    <CardSection title={t("videoDuration")}>
                      <Text>{formatDuration(scene.meta.duration)}</Text>
                    </CardSection>
                    <CardSection
                      title={
                        <>
                          {t("path")}
                          <CopyIcon
                            onClick={() => {
                              navigator.clipboard.writeText(scene.path).catch(() => {});
                            }}
                            className="hover"
                            style={{ marginLeft: 8 }}
                            size={16}
                          />
                        </>
                      }
                    >
                      <Text style={{ lineHeight: "150%" }}>{scene.path}</Text>
                    </CardSection>
                    <CardSection title={t("fileSize")}>
                      <div title={`${scene.meta.size} bytes`}>
                        <Text>{prettyBytes(scene.meta.size)}</Text>
                      </div>
                    </CardSection>
                    <CardSection title={t("videoDimensions")}>
                      <Text>
                        {scene.meta.dimensions.width}x{scene.meta.dimensions.height}
                      </Text>
                    </CardSection>
                    <CardSection title={t("fps")}>
                      <Text>{scene.meta.fps.toFixed(2)}</Text>
                    </CardSection>
                    <CardSection title={t("bitrate")}>
                      <Text>
                        {((scene.meta.size / 1000 / scene.meta.duration) * 8).toFixed(0)} kBit/s
                      </Text>
                    </CardSection>
                    <CardSection title={t("heading.views")}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Button loading={watchLoader} onClick={_watchScene}>
                          {watches.length} +
                        </Button>
                        <Button loading={watchLoader} onClick={_unwatchScene}>
                          -
                        </Button>
                      </div>
                      {!!watches.length && (
                        <Text style={{ marginTop: 8 }}>
                          Last watched: {new Date(watches[watches.length - 1]).toLocaleString()}
                        </Text>
                      )}
                    </CardSection>
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
                          Run Plugins
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
              {/* ACTORS */}
              {!!actors.length && (
                <div>
                  <CardTitle style={{ marginBottom: 20 }}>{t("starring")}</CardTitle>
                  <ListContainer size={150}>
                    {actors.map((actor) => (
                      <ActorCard
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
                </div>
              )}
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
              {!!markers.length && (
                <div>
                  <CardTitle style={{ marginBottom: 20 }}>{t("marker", { numItems: 2 })}</CardTitle>
                  <ListContainer size={200}>
                    {markers
                      .sort((a, b) => a.time - b.time)
                      .map((marker) => (
                        <Paper key={marker._id}>
                          <img
                            onClick={() => {
                              const videoEl = document.getElementById(
                                "video-player"
                              ) as HTMLVideoElement | null;
                              if (videoEl) {
                                videoEl.currentTime = marker.time;
                                videoEl.play().catch(() => {});
                                window.scrollTo({
                                  left: 0,
                                  top: 0,
                                  behavior: "smooth",
                                });
                              }
                            }}
                            className="hover"
                            width="100%"
                            height="100%"
                            style={{ objectFit: "cover" }}
                            src={thumbnailUrl(marker.thumbnail?._id)}
                            alt={marker.name}
                          />
                        </Paper>
                      ))}
                  </ListContainer>
                </div>
              )}
            </AutoLayout>
          </div>
        </div>
      </AutoLayout>
    </PageWrapper>
  );
}
