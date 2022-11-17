import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import prettyBytes from "pretty-bytes";

import ActorCard from "../../components/ActorCard";
import AutoLayout from "../../components/AutoLayout";
import Card from "../../components/Card";
import CardSection from "../../components/CardSection";
import CardTitle from "../../components/CardTitle";
import Description from "../../components/Description";
import LabelGroup from "../../components/LabelGroup";
import ListWrapper from "../../components/ListWrapper";
import PageWrapper from "../../components/PageWrapper";
import Rating from "../../components/Rating";
import SceneCard from "../../components/SceneCard";
import { useActorList } from "../../composables/use_actor_list";
import { useSceneList } from "../../composables/use_scene_list";
import { actorCardFragment } from "../../fragments/actor";
import { sceneCardFragment } from "../../fragments/scene";
import { IMovie } from "../../types/movie";
import { graphqlQuery } from "../../util/gql";
import { formatDuration } from "../../util/string";
import { thumbnailUrl } from "../../util/thumbnail";
import Button from "../../components/Button";
import FileInput from "../../components/FileInput";
import { useRouter } from "next/router";
import { uploadImage } from "../../util/mutations/image";
import { setMovieBackCover, setMovieFrontCover, setMovieSpine } from "../../util/mutations/movie";
import ResponsiveImage from "../../components/ResponsiveImage";
import Spacer from "../../components/Spacer";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const q = `
  query ($id: String!) {
    getMovieById(id: $id) {
      _id
      name
      description
      releaseDate
      duration
      size
      favorite
      bookmark
      rating
      frontCover {
        _id
        color
      }
      backCover {
        _id
        color
      }
      spineCover {
        _id
      }
      actors {
        ...ActorCard
      }
      labels {
        _id
        name
        color
      }
      studio {
        _id
        name
        thumbnail {
          _id
        }
      }
      scenes {
        ...SceneCard
      }
    }
  }
  ${sceneCardFragment}
  ${actorCardFragment}
  `;

  const { getMovieById } = await graphqlQuery<{
    getMovieById: IMovie;
  }>(q, {
    id: ctx.query.id,
  });

  return {
    props: {
      movie: getMovieById,
    },
  };
};

const MAX_HEIGHT = 400;

export default function ScenePage({ movie }: { movie: IMovie }) {
  const router = useRouter();
  const t = useTranslations();

  const { scenes, editScene } = useSceneList(
    {
      items: movie.scenes,
      numItems: movie.scenes.length,
      numPages: 1,
    },
    {}
  );

  const { actors, editActor } = useActorList(
    {
      items: movie.actors,
      numItems: movie.actors.length,
      numPages: 1,
    },
    {}
  );

  return (
    <PageWrapper title={movie.name}>
      <AutoLayout>
        <div
          style={{
            flexWrap: "wrap",
            display: "flex",
            justifyContent: "center",
            gap: 5,
          }}
        >
          {movie.spineCover && (
            <img
              style={{ borderRadius: 5, maxHeight: MAX_HEIGHT }}
              src={thumbnailUrl(movie.spineCover._id)}
              alt={`${movie.name} DVD spine`}
            />
          )}
          {!movie.spineCover && (
            <div
              style={{
                background: `repeating-linear-gradient(
                  45deg,
                  #a0a0a005,
                  #a0a0a005 10px,
                  #a0a0a010 10px,
                  #a0a0a010 20px
                )`,
                border: "2px solid #a0a0a020",
                position: "relative",
                width: 128,
                maxHeight: MAX_HEIGHT,
                height: MAX_HEIGHT,
              }}
            >
              <div
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  position: "absolute",
                }}
              >
                <FileInput
                  onChange={async ([file]) => {
                    /* TODO: don't show as image */
                    const img = await uploadImage({ file, name: file.name });
                    await setMovieSpine(movie._id, img._id);
                    router.replace(router.asPath);
                  }}
                  accept={[".png", ".jpg", ".jpeg", ".webp"]}
                >
                  Add spine
                </FileInput>
              </div>
            </div>
          )}
          {!movie.frontCover && (
            <div
              style={{
                background: `repeating-linear-gradient(
                45deg,
                #a0a0a005,
                #a0a0a005 10px,
                #a0a0a010 10px,
                #a0a0a010 20px
              )`,
                border: "2px solid #a0a0a020",
                position: "relative",
                aspectRatio: "0.71",
                maxHeight: MAX_HEIGHT,
                height: MAX_HEIGHT,
              }}
            >
              <div
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  position: "absolute",
                }}
              >
                <FileInput
                  onChange={async ([file]) => {
                    /* TODO: don't show as image */
                    const img = await uploadImage({ file, name: file.name });
                    await setMovieFrontCover(movie._id, img._id);
                    router.replace(router.asPath);
                  }}
                  accept={[".png", ".jpg", ".jpeg", ".webp"]}
                >
                  Add front cover
                </FileInput>
              </div>
            </div>
          )}
          {movie.frontCover && (
            <ResponsiveImage
              src={thumbnailUrl(movie.frontCover._id)}
              aspectRatio="0.71"
              imgStyle={{ height: MAX_HEIGHT }}
            />
          )}
          {!movie.backCover && (
            <div
              style={{
                background: `repeating-linear-gradient(
                45deg,
                #a0a0a005,
                #a0a0a005 10px,
                #a0a0a010 10px,
                #a0a0a010 20px
              )`,
                border: "2px solid #a0a0a020",
                position: "relative",
                aspectRatio: "0.71",
                maxHeight: MAX_HEIGHT,
                height: MAX_HEIGHT,
              }}
            >
              <div
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  position: "absolute",
                }}
              >
                <FileInput
                  onChange={async ([file]) => {
                    /* TODO: don't show as image */
                    const img = await uploadImage({ file, name: file.name });
                    await setMovieBackCover(movie._id, img._id);
                    router.replace(router.asPath);
                  }}
                  accept={[".png", ".jpg", ".jpeg", ".webp"]}
                >
                  Add back cover
                </FileInput>
              </div>
            </div>
          )}
          {movie.backCover && (
            <ResponsiveImage
              src={thumbnailUrl(movie.backCover._id)}
              aspectRatio="0.71"
              imgStyle={{ height: MAX_HEIGHT }}
            />
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <AutoLayout style={{ width: "100%", maxWidth: 1000, padding: 10 }}>
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div>
                  {movie.favorite ? (
                    <HeartIcon className="hover" style={{ fontSize: 32, color: "#ff3355" }} />
                  ) : (
                    <HeartBorderIcon className="hover" style={{ fontSize: 32 }} />
                  )}
                </div>
                <div>
                  {movie.bookmark ? (
                    <BookmarkIcon className="hover" style={{ fontSize: 32 }} />
                  ) : (
                    <BookmarkBorderIcon className="hover" style={{ fontSize: 32 }} />
                  )}
                </div>
                <Spacer />
                {!!movie.studio && (
                  /* TODO: link */
                  <img
                    style={{ maxWidth: 200, maxHeight: 64, objectFit: "cover" }}
                    src={thumbnailUrl(movie.studio.thumbnail?._id)}
                    alt={`${movie.studio.name} Logo`}
                  />
                )}
              </div>
            </Card>
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
                    <div style={{ opacity: 0.5 }}>{movie.name}</div>
                  </CardSection>
                  {!!movie.studio && (
                    <CardSection title={t("studio", { numItems: 2 })}>
                      <div style={{ opacity: 0.5 }}>
                        <Link href={`/studio/${movie.studio._id}`}>
                          <a>{movie.studio.name}</a>
                        </Link>
                      </div>
                    </CardSection>
                  )}
                  {movie.releaseDate && (
                    <CardSection title={t("releaseDate")}>
                      <div style={{ opacity: 0.5 }}>
                        {new Date(movie.releaseDate).toLocaleDateString()}
                      </div>
                    </CardSection>
                  )}
                  {movie.description && (
                    <CardSection title={t("description")}>
                      <Description>{movie.description}</Description>
                    </CardSection>
                  )}
                  <CardSection title={t("rating")}>
                    <Rating readonly value={movie.rating}></Rating>
                  </CardSection>
                  <CardSection title={t("labels", { numItems: 2 })}>
                    <LabelGroup limit={999} labels={movie.labels} />
                  </CardSection>
                </AutoLayout>
                <AutoLayout>
                  <CardSection title={t("videoDuration")}>
                    <div style={{ opacity: 0.5 }}>{formatDuration(movie.duration)}</div>
                  </CardSection>
                  <CardSection title={t("fileSize")}>
                    <div title={`${movie.size} bytes`} style={{ opacity: 0.5 }}>
                      {prettyBytes(movie.size)}
                    </div>
                  </CardSection>
                </AutoLayout>
              </div>
            </Card>
            <CardTitle>
              <span>
                {scenes.length} {t("scene", { numItems: scenes.length })}
              </span>
            </CardTitle>
            <ListWrapper loading={false} noResults={!scenes.length}>
              {scenes.map((scene) => (
                <SceneCard
                  onFav={(value) => {
                    editScene(scene._id, (scene) => {
                      scene.favorite = value;
                      return scene;
                    });
                  }}
                  onBookmark={(value) => {
                    editScene(scene._id, (scene) => {
                      scene.bookmark = !!value;
                      return scene;
                    });
                  }}
                  onRate={(rating) => {
                    editScene(scene._id, (scene) => {
                      scene.rating = rating;
                      return scene;
                    });
                  }}
                  key={scene._id}
                  scene={scene}
                ></SceneCard>
              ))}
            </ListWrapper>
            <CardTitle>
              <span>
                {actors.length} {t("actor", { numItems: actors.length })}
              </span>
            </CardTitle>
            <ListWrapper loading={false} noResults={!actors.length} size={150}>
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
            </ListWrapper>
          </AutoLayout>
        </div>
      </AutoLayout>
    </PageWrapper>
  );
}
