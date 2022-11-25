import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import ListWrapper from "../components/ListWrapper";
import MarkerCard from "../components/MarkerCard";
import PageWrapper from "../components/PageWrapper";
import Pagination from "../components/Pagination";
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
      // TODO: actors
    }
  );

  const { page, onPageChange } = usePaginatedList({
    fetch: fetchMarkers,
    initialPage: props.page,
    querySettings: [query, favorite, bookmark, sortBy, sortDir, JSON.stringify(selectedLabels)],
  });

  return (
    <PageWrapper title={t("foundActors", { numItems: 0 })}>
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
