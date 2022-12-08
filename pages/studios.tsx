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
import PageWrapper from "../components/PageWrapper";
import Pagination from "../components/Pagination";
import SortDirectionButton, { SortDirection } from "../components/SortDirectionButton";
import Spacer from "../components/Spacer";
import StudioCard from "../components/StudioCard";
import StudioCreator from "../components/StudioCreator";
import { usePaginatedList } from "../composables/use_paginated_list";
import { fetchStudios, useStudioList } from "../composables/use_studio_list";
import { IPaginationResult } from "../types/pagination";
import { IStudio } from "../types/studio";
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
  /* rating: {
    default: 0,
  }, */
  /* labels: {
    default: [] as string[],
  }, */
  // TODO: labels
});

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { page, q, sortBy, sortDir, favorite, bookmark } = queryParser.parse(query);

  const result = await fetchStudios(page, {
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

export default function StudioListPage(props: {
  page: number;
  initial: IPaginationResult<IStudio>;
}) {
  const router = useRouter();
  const t = useTranslations();

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);

  const [query, setQuery] = useState(parsedQuery.q);
  const [favorite, setFavorite] = useState(parsedQuery.favorite);
  const [bookmark, setBookmark] = useState(parsedQuery.bookmark);
  const [sortBy, setSortBy] = useState(parsedQuery.sortBy);
  const [sortDir, setSortDir] = useState(parsedQuery.sortDir);

  const { studios, loading, numPages, numItems, fetchStudios, editStudio } = useStudioList(
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
      // labels: [], // TODO:
    });
  };

  const { page, onPageChange } = usePaginatedList({
    fetch: fetchStudios,
    initialPage: props.page,
    querySettings: [query, favorite, bookmark, sortBy, sortDir],
  });

  async function refresh(): Promise<void> {
    updateQueryParserStore();
    await fetchStudios(page);
  }

  const pageChanged = async (page: number): Promise<void> => {
    await onPageChange(page);
    updateQueryParserStore(page);
  };

  return (
    <PageWrapper title={t("foundStudios", { numItems })}>
      <AutoLayout>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundStudios", { numItems })}</div>
          <Spacer />
          <Pagination numPages={numPages} current={page} onChange={pageChanged} />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <StudioCreator onCreate={async () => await router.replace(router.asPath)} />
          {/*  <Button style={{ marginRight: 10 }}>+ Bulk add</Button> */}
          {/* <Button style={{ marginRight: 10 }}>Choose</Button>
        <Button style={{ marginRight: 10 }}>Randomize</Button> */}
        </div>
        <AutoLayout layout="h" gap={10}>
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
        <ListWrapper loading={loading} noResults={!studios.length}>
          {studios.map((studio) => (
            <StudioCard
              key={studio._id}
              onFav={(value) => {
                editStudio(studio._id, (studio) => {
                  studio.favorite = value;
                  return studio;
                });
              }}
              onBookmark={(value) => {
                editStudio(studio._id, (studio) => {
                  studio.bookmark = !!value;
                  return studio;
                });
              }}
              studio={studio}
            />
          ))}
        </ListWrapper>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Pagination numPages={numPages} current={page} onChange={pageChanged} />
        </div>
      </AutoLayout>
    </PageWrapper>
  );
}
