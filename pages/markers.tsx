import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import LabelIcon from "mdi-react/LabelIcon";
import LabelOutlineIcon from "mdi-react/LabelOutlineIcon";
import StarOutline from "mdi-react/StarBorderIcon";
import StarHalf from "mdi-react/StarHalfFullIcon";
import Star from "mdi-react/StarIcon";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import Button from "../components/Button";
import IconButtonFilter from "../components/IconButtonFilter";
import IconButtonMenu from "../components/IconButtonMenu";
import LabelSelector from "../components/LabelSelector";
import ListWrapper from "../components/ListWrapper";
import MarkerCard from "../components/MarkerCard";
import PageWrapper from "../components/PageWrapper";
import Pagination from "../components/Pagination";
import Rating from "../components/Rating";
import SortDirectionButton from "../components/SortDirectionButton";
import Spacer from "../components/Spacer";
import useLabelList from "../composables/use_label_list";
import { fetchMarkers, useMarkerList } from "../composables/use_marker_list";
import { usePaginatedList } from "../composables/use_paginated_list";
import { IMarker } from "../types/marker";
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
  rating: {
    default: 0,
  },
  labels: {
    default: [] as string[],
  },
});

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { page, q, sortBy, sortDir, favorite, bookmark, labels } = queryParser.parse(query);

  const result = await fetchMarkers(page, {
    query: q,
    sortBy,
    sortDir,
    favorite,
    bookmark,
    include: labels,
  });

  return {
    props: {
      page,
      initial: result,
    },
  };
};

export default function MarkerListPage(props: {
  page: number;
  initial: IPaginationResult<IMarker>;
}) {
  const router = useRouter();
  const t = useTranslations();

  const parsedQuery = useMemo(() => queryParser.parse(router.query), []);

  const [query, setQuery] = useState(parsedQuery.q);
  const [favorite, setFavorite] = useState(parsedQuery.favorite);
  const [bookmark, setBookmark] = useState(parsedQuery.bookmark);
  const [rating, setRating] = useState(parsedQuery.rating);
  const [sortBy, setSortBy] = useState(parsedQuery.sortBy);
  const [sortDir, setSortDir] = useState(parsedQuery.sortDir);

  const [selectedLabels, setSelectedLabels] = useState(parsedQuery.labels);
  const [labelQuery, setLabelQuery] = useState("");

  const { labels: labelList, loading: labelLoader } = useLabelList();

  const { markers, fetchMarkers, editMarker, loading, numItems, numPages } = useMarkerList(
    props.initial,
    {
      rating,
      query,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      include: selectedLabels,
    }
  );

  const { page, onPageChange } = usePaginatedList({
    fetch: fetchMarkers,
    initialPage: props.page,
    querySettings: [query, favorite, bookmark, sortBy, sortDir, JSON.stringify(selectedLabels)],
  });

  async function refresh(): Promise<void> {
    queryParser.store(router, {
      q: query,
      favorite,
      bookmark,
      sortBy,
      sortDir,
      page,
      rating,
      labels: selectedLabels,
    });
    await fetchMarkers(page);
  }

  const hasNoLabels = !labelLoader && !labelList.length;

  return (
    <PageWrapper title={t("foundMarkers", { numItems: 0 })}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: "bold" }}>{t("foundMarkers", { numItems })}</div>
        <Spacer />
        <Pagination numPages={numPages} current={page} onChange={(page) => onPageChange(page)} />
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
        <IconButtonMenu
          value={!!rating}
          activeIcon={rating === 10 ? Star : StarHalf}
          inactiveIcon={StarOutline}
        >
          <Rating value={rating} onChange={setRating} />
        </IconButtonMenu>
        <IconButtonMenu
          counter={selectedLabels.length}
          value={!!selectedLabels.length}
          activeIcon={LabelIcon}
          inactiveIcon={LabelOutlineIcon}
          isLoading={labelLoader}
          disabled={hasNoLabels}
        >
          <input
            type="text"
            style={{ width: "100%", marginBottom: 10 }}
            placeholder={t("findLabels")}
            value={labelQuery}
            onChange={(ev) => setLabelQuery(ev.target.value)}
          />
          <LabelSelector
            selected={selectedLabels}
            items={labelList.filter(
              (label) =>
                label.name.toLowerCase().includes(labelQuery.toLowerCase()) ||
                label.aliases.some((alias) =>
                  alias.toLowerCase().includes(labelQuery.toLowerCase())
                )
            )}
            onChange={setSelectedLabels}
          />
        </IconButtonMenu>
        <select value={sortBy} onChange={(ev) => setSortBy(ev.target.value)}>
          <option value="relevance">{t("relevance")}</option>
          <option value="addedOn">{t("addedToCollection")}</option>
          <option value="rating">{t("rating")}</option>
        </select>
        <SortDirectionButton
          disabled={sortBy === "$shuffle"}
          value={sortDir}
          onChange={setSortDir}
        />
        <Spacer />
        <Button onClick={refresh}>{t("refresh")}</Button>
      </div>

      <ListWrapper loading={false} noResults={false}>
        {markers.map((marker) => (
          <MarkerCard
            marker={marker}
            key={marker._id}
            onFav={(value) => {
              editMarker(marker._id, (marker) => {
                marker.favorite = value;
                return marker;
              });
            }}
            onBookmark={(value) => {
              editMarker(marker._id, (marker) => {
                marker.bookmark = value;
                return marker;
              });
            }}
            onRate={(rating) => {
              editMarker(marker._id, (marker) => {
                marker.rating = rating;
                return marker;
              });
            }}
          />
        ))}
      </ListWrapper>
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
        <Pagination numPages={numPages} current={page} onChange={onPageChange} />
      </div>
    </PageWrapper>
  );
}
