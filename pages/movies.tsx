import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import Button from "../components/Button";
import IconButtonFilter from "../components/IconButtonFilter";
import ListWrapper from "../components/ListWrapper";
import MovieCard from "../components/MovieCard";
import Pagination from "../components/Pagination";
import SortDirectionButton, { SortDirection } from "../components/SortDirectionButton";
import { fetchMovies, useMovieList } from "../composables/use_movie_list";
import useUpdateEffect from "../composables/use_update_effect";
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

export default function ActorListPage(props: { page: number; initial: IPaginationResult<IMovie> }) {
  const router = useRouter();
  const t = useTranslations();

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);

  const [query, setQuery] = useState(parsedQuery.q);
  const [favorite, setFavorite] = useState(parsedQuery.favorite);
  const [bookmark, setBookmark] = useState(parsedQuery.bookmark);
  const [sortBy, setSortBy] = useState(parsedQuery.sortBy);
  const [sortDir, setSortDir] = useState(parsedQuery.sortDir);
  const [page, setPage] = useState(props.page);

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

  async function onPageChange(x: number): Promise<void> {
    setPage(x);
    await fetchMovies(x);
  }

  async function refresh(): Promise<void> {
    queryParser.store(router, {
      q: query,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      page,
    });
    await fetchMovies(page);
  }

  useUpdateEffect(() => {
    setPage(0);
  }, [query, favorite, bookmark, sortBy, sortDir]);

  return (
    <div style={{ padding: 10 }}>
      <Head>
        <title>{t("foundMovies", { numItems })}</title>
      </Head>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundMovies", { numItems })}</div>
        <div style={{ flexGrow: 1 }}></div>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
      </div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <Button style={{ marginRight: 10 }}>+ Add movie</Button>
        {/*  <Button style={{ marginRight: 10 }}>+ Bulk add</Button> */}
        {/* <Button style={{ marginRight: 10 }}>Choose</Button>
        <Button style={{ marginRight: 10 }}>Randomize</Button> */}
      </div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
        }}
      >
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
        <div style={{ flexGrow: 1 }}></div>
        <Button loading={loading} onClick={refresh}>
          {t("refresh")}
        </Button>
      </div>
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
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
      </div>
    </div>
  );
}
