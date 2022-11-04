import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";

import ActorCard from "../components/ActorCard";
import ListContainer from "../components/ListContainer";
import MovieCard from "../components/MovieCard";
import PageWrapper from "../components/PageWrapper";
import SceneCard from "../components/SceneCard";
import { actorCardFragment } from "../fragments/actor";
import { movieCardFragment } from "../fragments/movie";
import { sceneCardFragment } from "../fragments/scene";
import { IActor } from "../types/actor";
import { IMovie } from "../types/movie";
import { IPaginationResult } from "../types/pagination";
import { IScene } from "../types/scene";
import { graphqlQuery } from "../util/gql";

async function searchAll(query: string) {
  const q = `
  query($sc: SceneSearchQuery!, $ac: ActorSearchQuery!, $mo: MovieSearchQuery!) {
    getScenes(query: $sc) {
      items {
        ...SceneCard
      }
      numItems
    }
    getActors(query: $ac) {
      items {
        ...ActorCard
      }
      numItems
    }
    getMovies(query: $mo) {
      items {
        ...MovieCard
      }
      numItems
    }
  }

  ${actorCardFragment}
  ${sceneCardFragment}
  ${movieCardFragment}
`;

  const data = await graphqlQuery<{
    getScenes: IScene[];
    getActors: IActor[];
    getMovies: IMovie[];
  }>(q, {
    sc: {
      query,
      take: 10,
    },
    ac: {
      query,
      take: 10,
    },
    mo: {
      query,
      take: 10,
    },
  });

  return {
    sceneResult: data.getScenes,
    actorResult: data.getActors,
    movieResult: data.getMovies,
  };
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const result = await searchAll(String(query.q));
  return {
    props: {
      ...result,
    },
  };
};

export default function SearchPage(props: {
  actorResult: IPaginationResult<IActor>;
  movieResult: IPaginationResult<IMovie>;
  sceneResult: IPaginationResult<IScene>;
}) {
  const t = useTranslations();

  const { actorResult, movieResult, sceneResult } = props;

  return (
    <PageWrapper title="Search results">
      {/* Actors */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
          {t("foundActors", { numItems: actorResult.numItems })}
        </div>
        <ListContainer>
          {actorResult.items.map((actor) => (
            <ActorCard
              onBookmark={() => {}}
              onFav={() => {}}
              onRate={() => {}}
              actor={actor}
              key={actor._id}
            />
          ))}
        </ListContainer>
      </div>
      {/* Movies */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
          {t("foundMovies", { numItems: movieResult.numItems })}
        </div>
        <ListContainer size={250}>
          {movieResult.items.map((movie) => (
            <MovieCard onBookmark={() => {}} onFav={() => {}} key={movie._id} movie={movie} />
          ))}
        </ListContainer>
      </div>
      {/* Scenes */}
      <div>
        <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
          {t("foundScenes", { numItems: sceneResult.numItems })}
        </div>
        <ListContainer size={250}>
          {sceneResult.items.map((scene) => (
            <SceneCard
              onBookmark={() => {}}
              onFav={() => {}}
              onRate={() => {}}
              key={scene._id}
              scene={scene}
            />
          ))}
        </ListContainer>
      </div>
    </PageWrapper>
  );
}
