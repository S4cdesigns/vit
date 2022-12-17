import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import AutoLayout from "../components/AutoLayout";
import Button from "../components/Button";
import IconButtonFilter from "../components/IconButtonFilter";
import ListWrapper from "../components/ListWrapper";
import MovieBulkCreator from "../components/MovieBulkCreator";
import MovieCard from "../components/MovieCard";
import MovieCreator from "../components/MovieCreator";
import PageWrapper from "../components/PageWrapper";
import Pagination from "../components/Pagination";
import SortDirectionButton, { SortDirection } from "../components/SortDirectionButton";
import Spacer from "../components/Spacer";
import { fetchMovies, useMovieList } from "../composables/use_movie_list";
import { usePaginatedList } from "../composables/use_paginated_list";
import { IMovie } from "../types/movie";
import { IPaginationResult } from "../types/pagination";
import { buildQueryParser } from "../util/query_parser";

const queryParser = buildQueryParser({
  q: {
    default: "",
  },
  page: {
    default: 0,
  },
  sortBy: {
    default: "addedOn",
  },
  sortDir: {
    default: "desc" as SortDirection,
  },
  favorite: {
    default: false,
  },
  bookmark: {
    default: false,
  },
  // TODO: rating
  // TODO: labels
});

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { page, q, sortBy, sortDir, favorite, bookmark } = queryParser.parse(query);

  const result = await fetchMovies(page, {
    query: q,
    sortBy,
    sortDir,
    favorite,
    bookmark,
  });

  return {
    props: {
      page,
      initial: result,
    },
  };
};

export default function MovieListPage(props: { page: number; initial: IPaginationResult<IMovie> }) {
  const router = useRouter();
  const t = useTranslations();

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);

  const [query, setQuery] = useState(parsedQuery.q);
  const [favorite, setFavorite] = useState(parsedQuery.favorite);
  const [bookmark, setBookmark] = useState(parsedQuery.bookmark);
  const [sortBy, setSortBy] = useState(parsedQuery.sortBy);
  const [sortDir, setSortDir] = useState(parsedQuery.sortDir);

  const { movies, loading, numPages, numItems, fetchMovies, editMovie } = useMovieList(
    props.initial,
    {
      query,
      favorite,
      bookmark,
      sortBy,
      sortDir,
    }
  );

  const updateQueryParserStore = (nextPage?: number) => {
    queryParser.store(router, {
      q: query,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      page: nextPage || page,
    });
  };

  const { page, onPageChange } = usePaginatedList({
    fetch: fetchMovies,
    initialPage: props.page,
    querySettings: [query, favorite, bookmark, sortBy, sortDir],
  });

  async function refresh(): Promise<void> {
    updateQueryParserStore();
    await fetchMovies(page);
  }

  const pageChanged = async (page: number): Promise<void> => {
    await onPageChange(page);
    updateQueryParserStore(page);
  };

  return (
    <PageWrapper title={t("foundMovies", { numItems })}>
      <AutoLayout>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundMovies", { numItems })}</div>
          <Spacer />
          <Pagination numPages={numPages} current={page} onChange={pageChanged} />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <MovieCreator onCreate={() => pageChanged(0)} />
          <MovieBulkCreator onCreate={() => pageChanged(0)} />
          {/* <Button style={{ marginRight: 10 }}>Choose</Button>
        <Button style={{ marginRight: 10 }}>Randomize</Button> */}
        </div>
        <AutoLayout wrap layout="h" gap={10}>
          <input
            type="text"
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                refresh().catch(() => {});
              }
            }}
            placeholder={t("findContent")}
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
          />
          <IconButtonFilter
            value={favorite}
            onClick={() => setFavorite(!favorite)}
            activeIcon={HeartIcon}
            inactiveIcon={HeartBorderIcon}
          />
          <IconButtonFilter
            value={bookmark}
            onClick={() => setBookmark(!bookmark)}
            activeIcon={BookmarkIcon}
            inactiveIcon={BookmarkBorderIcon}
          />
          <select value={sortBy} onChange={(ev) => setSortBy(ev.target.value)}>
            <option value="relevance">{t("relevance")}</option>
            <option value="addedOn">{t("addedToCollection")}</option>
            <option value="duration">{t("duration")}</option>
            <option value="numScenes">{t("numScenes")}</option>
          </select>
          <SortDirectionButton
            disabled={sortBy === "$shuffle"}
            value={sortDir}
            onChange={setSortDir}
          />
          <Spacer />
          <Button loading={loading} onClick={refresh}>
            {t("refresh")}
          </Button>
        </AutoLayout>
        <ListWrapper loading={loading} noResults={!numItems}>
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
        </ListWrapper>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Pagination numPages={numPages} current={page} onChange={pageChanged} />
        </div>
      </AutoLayout>
    </PageWrapper>
  );
}
